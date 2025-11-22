import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'PUT') {
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

    const body = JSON.parse(event.body || '{}');
    const { order_id, status, tracking_number, shipping_provider } = body;

    if (!order_id || !status) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'order_id and status are required' })
      };
    }

    // Validate status
    const validStatuses = ['placed', 'paid', 'packed', 'out_for_delivery', 'collected', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid status value' })
      };
    }

    // Build update payload
    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add tracking info if provided
    if (tracking_number) {
      updatePayload.tracking_number = tracking_number;
    }
    if (shipping_provider) {
      updatePayload.shipping_provider = shipping_provider;
    }

    // Update the order in Supabase
    const url = `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(order_id)}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase update error:', text);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to update order status', details: text })
      };
    }

    const updatedOrder = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        order: updatedOrder[0] || updatedOrder
      })
    };

  } catch (error: any) {
    console.error('Admin order status update error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Server error' })
    };
  }
};
