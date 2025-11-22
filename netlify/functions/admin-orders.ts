import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing Supabase config' })
      };
    }

    // Build query to fetch only paid orders with fulfillment_method
    // Filter for:
    // - payment_status = 'paid' OR status = 'paid'
    // - fulfillment_method is not null
    const url = `${SUPABASE_URL}/rest/v1/orders`
      + `?select=*,order_items(id,product_name,sku,quantity,unit_price,line_total)`
      + `&or=(payment_status.eq.paid,status.eq.paid)`
      + `&fulfillment_method=not.is.null`
      + `&order=created_at.desc`;

    const response = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase error:', text);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to fetch orders', details: text })
      };
    }

    const orders = await response.json();

    // Format orders for admin display
    const formattedOrders = orders.map((order: any) => {
      const addr = order.delivery_address || null;
      const shippingAddress = addr && addr.street_address
        ? `${addr.street_address}, ${addr.local_area || ''}, ${addr.city || ''}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '')
        : null;

      return {
        id: order.id,
        order_number: order.order_number || order.m_payment_id,
        m_payment_id: order.m_payment_id,
        customer_name: order.buyer_name,
        customer_email: order.buyer_email,
        customer_phone: order.buyer_phone || order.contact_phone,
        fulfillment_type: order.fulfillment_method, // 'collection' or 'delivery'
        status: order.status,
        payment_status: order.payment_status,
        total: parseFloat(order.total || (order.total_cents / 100) || 0),
        total_cents: order.total_cents,
        placed_at: order.placed_at || order.created_at,
        paid_at: order.paid_at,
        created_at: order.created_at,
        delivery_address: order.delivery_address,
        collection_location: order.collection_location,
        shipping_address: shippingAddress,
        tracking_number: order.tracking_number,
        shipping_provider: order.shipping_provider,
        order_items: order.order_items || []
      };
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=30'
      },
      body: JSON.stringify(formattedOrders)
    };

  } catch (error: any) {
    console.error('Admin orders fetch error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Server error' })
    };
  }
};
