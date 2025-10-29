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
      customerPhone
    } = JSON.parse(event.body || '{}');

    if (!items || !customerEmail || total === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: items, customerEmail, total' })
      };
    }

    const admin = createClient(SUPABASE_URL, SRK);

    // Create order
    const { data: order, error: orderError } = await admin.from('orders').insert([{
      status: 'pending',
      email: customerEmail,
      customer_email: customerEmail,
      customer_name: customerName || 'Guest',
      customer_mobile: customerPhone || '',
      shipping_method: shippingMethod === 'store-pickup' ? 'collection' : 'delivery',
      ship_to_street: shippingInfo?.ship_to_street || '',
      ship_to_suburb: shippingInfo?.ship_to_suburb || '',
      ship_to_city: shippingInfo?.ship_to_city || '',
      ship_to_zone: shippingInfo?.ship_to_zone || '',
      ship_to_postal_code: shippingInfo?.ship_to_postal_code || '',
      subtotal: Number(subtotal || 0),
      shipping: Number(shipping || 0),
      discount: Number(discount || 0),
      total: Number(total || 0),
      total_cents: Math.round(Number(total || 0) * 100),
      currency: 'ZAR',
      created_at: new Date().toISOString(),
      payment_status: 'unpaid'
    }]).select().single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to create order: ${orderError?.message}` })
      };
    }

    // Insert order items
    const orderItemsData = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId || null,
      sku: item.sku || null,
      name: item.name,
      variant: item.variant?.title || null,
      qty: item.quantity || 1,
      quantity: item.quantity || 1,
      unit_price: Number(item.price || 0),
      price: Number(item.price || 0),
      subtotal: (item.quantity || 1) * Number(item.price || 0)
    }));

    const { error: itemsError } = await admin
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Order items insertion error:', itemsError);
      // Order was created but items failed; log but don't fail
      console.warn(`Order ${order.id} created but items insertion failed:`, itemsError.message);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        order_id: order.id,
        total_cents: Math.round(Number(total || 0) * 100)
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
