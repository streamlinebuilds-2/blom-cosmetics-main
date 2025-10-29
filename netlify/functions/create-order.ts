import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with serverless-friendly config
const admin = createClient(SUPABASE_URL, SRK, {
  auth: { persistSession: false }
});

function generateMerchantPaymentId() {
  const rand = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `BLM-${rand}`;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      items,
      shippingInfo,
      shippingMethod,
      subtotal,
      shipping,
      discount,
      total,
      customerEmail,
      customerName,
      customerPhone,
      deliveryAddress,
      userId,
      customerId // Also accept customerId as fallback
    } = body;

    if (!items || !customerEmail || total === undefined) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields: items, customerEmail, total' })
      };
    }

    // Validate items have required fields
    if (!Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Items array is required and must not be empty' })
      };
    }

    for (const item of items) {
      if (!item.name || item.price === undefined) {
        console.error('Invalid item:', JSON.stringify(item, null, 2));
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: `Item missing required fields: name="${item.name}", price=${item.price}` })
        };
      }
    }

    // Convert amounts to cents for precision
    const subtotalCents = Math.round(Number(subtotal || 0) * 100);
    const shippingCents = Math.round(Number(shipping || 0) * 100);
    const discountCents = Math.round(Number(discount || 0) * 100);
    const totalCents = Math.round(Number(total || 0) * 100);

    // Generate unique merchant payment ID for PayFast
    const merchantPaymentId = generateMerchantPaymentId();
    
    // Use userId or customerId (fallback)
    const finalUserId = userId || customerId || null;

    // Build delivery method and address
    const isCollection = shippingMethod === 'store-pickup';
    const deliveryMethod = isCollection ? 'collection' : 'delivery';
    
    const shippingAddress = isCollection
      ? null
      : {
          line1: deliveryAddress?.street_address || shippingInfo?.ship_to_street || '',
          line2: '',
          suburb: deliveryAddress?.local_area || shippingInfo?.ship_to_suburb || '',
          city: deliveryAddress?.city || shippingInfo?.ship_to_city || '',
          province: deliveryAddress?.zone || shippingInfo?.ship_to_zone || '',
          postal_code: deliveryAddress?.code || shippingInfo?.ship_to_postal_code || '',
          country: 'ZA',
          notes: ''
        };

    // Create order with exact schema
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert([{
        user_id: finalUserId,
        m_payment_id: merchantPaymentId,
        merchant_payment_id: merchantPaymentId,
        status: 'pending',
        payment_status: 'unpaid',
        channel: 'website',
        customer_name: customerName || 'Guest',
        customer_email: (customerEmail || '').toLowerCase(),
        customer_phone: customerPhone || '',
        delivery_method: deliveryMethod,
        shipping_address: shippingAddress,
        collection_slot: null,
        collection_location: null,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        discount_cents: discountCents,
        tax_cents: 0,
        total_cents: totalCents,
        currency: 'ZAR',
        placed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', JSON.stringify(orderError, null, 2));
      console.error('Order payload attempted:', JSON.stringify({
        user_id: finalUserId,
        merchant_payment_id: merchantPaymentId,
        status: 'pending',
        payment_status: 'unpaid',
        customer_email: customerEmail,
        total_cents: totalCents
      }, null, 2));
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Failed to create order: ${orderError?.message || 'Unknown error'}` })
      };
    }

    // Helper to check if string is a valid UUID
    function isUUID(str: string | null | undefined): boolean {
      if (!str) return false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    }

    // Insert order items with exact schema
    // Note: productId from cart might be a slug, not UUID, so validate before inserting
    const orderItemsData = items.map((item: any) => {
      const productId = item.productId;
      // Only set product_id if it's a valid UUID, otherwise null (slug-based products)
      const validProductId = isUUID(productId) ? productId : null;
      
      return {
        order_id: order.id,
        product_id: validProductId,
        sku: item.sku || null,
        name: item.name,
        variant: item.variant?.title || null,
        qty: item.quantity || 1,
        unit_price_cents: Math.round(Number(item.price || 0) * 100),
        line_total_cents: Math.round((item.quantity || 1) * Number(item.price || 0) * 100)
      };
    });

    const { error: itemsError } = await admin
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Order items insertion error:', JSON.stringify(itemsError, null, 2));
      console.error('Items payload attempted:', JSON.stringify(orderItemsData, null, 2));
      // Still return error - items are critical
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: `Order created but items failed: ${itemsError.message}`,
          order_id: order.id
        })
      };
    }

    // Create payment row for admin tracking (non-blocking)
    admin
      .from('payments')
      .insert([{
        order_id: order.id,
        provider: 'payfast',
        amount_cents: totalCents,
        status: 'pending',
        provider_txn_id: null,
        raw: null
      }])
      .then(() => console.log(`Payment row created for order ${order.id}`))
      .catch((err: any) => console.warn(`Payment row creation skipped:`, err?.message));

    // Build PayFast form parameters
    const siteUrl = process.env.SITE_BASE_URL || process.env.URL || 'https://blom-cosmetics.co.za';
    const n8nHost = process.env.N8N_ITN_URL || 'https://n8n.yourdomain.com';

    const pfParams = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
      return_url: `${siteUrl}/checkout/return`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      notify_url: n8nHost,
      name_first: customerName?.split(' ')[0] || '',
      name_last: customerName?.split(' ').slice(1).join(' ') || '',
      email_address: customerEmail,
      m_payment_id: merchantPaymentId,
      amount: (totalCents / 100).toFixed(2),
      item_name: 'BLOM Order',
      item_description: `BLOM order ${merchantPaymentId}`
    };

    console.log(`✅ Order created: ${order.id} | Merchant ID: ${merchantPaymentId} | Customer: ${customerEmail} | Total: R${(totalCents / 100).toFixed(2)} | Items: ${items.length}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        order_id: order.id,
        merchant_payment_id: merchantPaymentId,
        total_cents: totalCents,
        pf: pfParams
      })
    };
  } catch (err: any) {
    console.error('Create order error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Internal error: ${err.message}` })
    };
  }
};
