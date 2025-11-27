import type { Handler } from '@netlify/functions'

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_sku?: string;
  variant_title?: string;
}

interface OrderData {
  order_id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  paid_at?: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  shipping_method?: string;
  shipping_cost?: number;
  delivery_address?: {
    street_address?: string;
    local_area?: string;
    city?: string;
    zone?: string;
    code?: string;
    country?: string;
  };
  items: OrderItem[];
  payment_details?: {
    provider: string;
    provider_txn_id?: string;
    transaction_fee?: number;
  };
}

async function fetchOrderDetails(orderId: string): Promise<any> {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('Missing Supabase configuration')
  }

  // Fetch order details
  const orderRes = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=*`,
    {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    }
  )

  if (!orderRes.ok) {
    throw new Error('Failed to fetch order details')
  }

  const orders = await orderRes.json()
  const order = orders[0]

  if (!order) {
    throw new Error('Order not found')
  }

  // Fetch order items with product details
  const itemsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}&select=*`,
    {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    }
  )

  if (!itemsRes.ok) {
    throw new Error('Failed to fetch order items')
  }

  const orderItems = await itemsRes.json()

  // Enrich items with product details
  const enrichedItems = await Promise.all(
    orderItems.map(async (item: any) => {
      let productName = 'Unknown Product'
      let productSku = item.sku

      // Try to get product details from products table
      if (item.product_id) {
        const productRes = await fetch(
          `${SUPABASE_URL}/rest/v1/products?id=eq.${item.product_id}&select=name,sku`,
          {
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`
            }
          }
        )

        if (productRes.ok) {
          const products = await productRes.json()
          if (products[0]) {
            productName = products[0].name
            productSku = products[0].sku || item.sku
          }
        }
      }

      return {
        id: item.id,
        quantity: item.quantity,
        unit_price: Number(item.price),
        total_price: Number(item.total_price || (item.price * item.quantity)),
        product_name: productName,
        product_sku: productSku,
        variant_title: item.variant_title || null
      }
    })
  )

  return {
    order_id: order.id,
    order_number: order.order_number || order.m_payment_id || orderId,
    status: order.status,
    payment_status: order.payment_status,
    total_amount: Number(order.total || order.total_amount || 0),
    currency: order.currency || 'ZAR',
    created_at: order.created_at,
    paid_at: order.paid_at,
    customer_email: order.buyer_email || order.customer_email,
    customer_name: order.buyer_name || order.customer_name,
    customer_phone: order.buyer_phone || order.customer_phone,
    shipping_method: order.shipping_method,
    shipping_cost: Number(order.shipping_cost || 0),
    delivery_address: order.delivery_address,
    items: enrichedItems,
    payment_details: {
      provider: 'payfast',
      provider_txn_id: order.provider_txn_id || null,
      transaction_fee: null // Could be calculated if needed
    }
  }
}

async function sendNewOrderAlert(orderData: OrderData): Promise<boolean> {
  const WEBHOOK_URL = 'https://dockerfile-1n82.onrender.com/webhook/new-order-alert'
  
  try {
    console.log('Sending new order alert for order:', orderData.order_number)
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BLOM-Cosmetics-Webhook/1.0'
      },
      body: JSON.stringify({
        event_type: 'order_paid',
        timestamp: new Date().toISOString(),
        order: orderData
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Webhook request failed:', response.status, errorText)
      return false
    }

    console.log('New order alert sent successfully for order:', orderData.order_number)
    return true
  } catch (error) {
    console.error('Error sending new order alert:', error)
    return false
  }
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = event.body || '{}'
    let json: any
    try {
      json = JSON.parse(body)
    } catch {
      return { 
        statusCode: 400, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ error: 'INVALID_JSON', message: 'Invalid JSON in request body' }) 
      }
    }

    const { order_id } = json || {}
    if (!order_id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'MISSING_ORDER_ID', 
          message: 'order_id is required' 
        })
      }
    }

    // Fetch complete order details
    const orderData = await fetchOrderDetails(order_id)

    // Send webhook alert
    const success = await sendNewOrderAlert(orderData)

    if (success) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'New order alert sent successfully',
          order_id: orderData.order_id,
          order_number: orderData.order_number
        })
      }
    } else {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'WEBHOOK_FAILED', 
          message: 'Failed to send new order alert' 
        })
      }
    }
  } catch (error: any) {
    console.error('New order alert handler error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'SERVER_ERROR', 
        message: error.message || 'Internal server error' 
      })
    }
  }
}