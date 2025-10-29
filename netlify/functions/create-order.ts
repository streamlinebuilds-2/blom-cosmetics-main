import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
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
      userId
    } = JSON.parse(event.body || '{}');

    if (!items || !customerEmail || total === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: items, customerEmail, total' })
      };
    }

    const admin = createClient(SUPABASE_URL, SRK);

    // Convert amounts to cents for precision
    const subtotalCents = Math.round(Number(subtotal || 0) * 100);
    const shippingCents = Math.round(Number(shipping || 0) * 100);
    const discountCents = Math.round(Number(discount || 0) * 100);
    const totalCents = Math.round(Number(total || 0) * 100);

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
        user_id: userId,
        status: 'unpaid', // Changed from 'pending' to 'unpaid' as per user's request
        channel: 'website',
        customer_name: customerName || 'Guest',
        customer_email: customerEmail,
        customer_phone: customerPhone || '',
        delivery_method: deliveryMethod,
        shipping_address: shippingAddress, // Using the new structured shipping_address
        collection_slot: null, // Placeholder for collection slot
        collection_location: null, // Placeholder for collection location
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        discount_cents: discountCents,
        tax_cents: 0, // Assuming 0 tax for now
        total_cents: totalCents,
        currency: 'ZAR',
        placed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to create order: ${orderError?.message}` })
      };
    }

    // Insert order items with exact schema
    const orderItemsData = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId || null,
      sku: item.sku || null,
      name: item.name,
      variant: item.variant?.title || null,
      qty: item.quantity || 1,
      unit_price_cents: Math.round(Number(item.price || 0) * 100),
      line_total_cents: Math.round((item.quantity || 1) * Number(item.price || 0) * 100)
    }));

    const { error: itemsError } = await admin
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Order items insertion error:', itemsError);
      console.warn(`Order ${order.id} created but items insertion failed:`, itemsError.message);
    }

    // Log for admin visibility
    console.log(`✅ Order created: ${order.id} | Customer: ${customerEmail} | Total: R${(totalCents / 100).toFixed(2)} | Items: ${items.length}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        order_id: order.id,
        total_cents: totalCents,
        message: `Order ${order.id} created. Ready for PayFast payment.`
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
