import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Get user ID from query parameters
    const userId = event.queryStringParameters?.user_id;
    if (!userId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }

    // Fetch orders from Supabase
  const url = `${process.env.SUPABASE_URL}/rest/v1/orders`
      + `?select=*,order_items(name,quantity,unit_price,total_price,product_id)`
      + `&user_id=eq.${encodeURIComponent(userId)}`
      + `&order=created_at.desc`;

    const response = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: text })
      };
    }

    const orders = await response.json();

    // Format orders for frontend
  const formattedOrders = orders.map((order: any) => {
    const addr = order.delivery_address || null;
    const shippingAddress = addr && addr.street_address ? `${addr.street_address}, ${addr.local_area || ''}, ${addr.city || ''}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '') : null;
    return {
      id: order.merchant_payment_id,
      date: order.created_at,
      status: order.status || 'pending',
      total: parseFloat(order.total_amount || order.total || 0),
      items: order.order_items?.length || 0,
      trackingNumber: order.tracking_number || null,
      shippingMethod: order.shipping_method || 'Standard',
      shippingAddress,
      pickupPoint: order.collection_location || null,
      orderItems: order.order_items || []
    }
  });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60' // Cache for 1 minute
      },
      body: JSON.stringify(formattedOrders)
    };

  } catch (error: any) {
    console.error('Orders fetch error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
