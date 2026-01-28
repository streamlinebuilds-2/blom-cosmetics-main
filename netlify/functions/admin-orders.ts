import type { Handler } from '@netlify/functions'

interface AdminOrder {
  id: string;
  order_number: string | null;
  m_payment_id: string | null;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
  invoice_url: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  shipping_method: string | null;
  fulfillment_method: string | null;
  fulfillment_type: string | null;
  delivery_address: any;
  collection_location: string | null;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  discount_cents: number | null;
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    variant_title: string | null;
  }[];
}

export const handler: Handler = async (event) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_KEY) {
      throw new Error('Missing Supabase configuration')
    }

    const queryParams = event.queryStringParameters || {}

    // GET /admin-orders - List all orders with invoice URLs
    if (event.httpMethod === 'GET') {
      const status = queryParams.status
      const limit = queryParams.limit || '50'
      const offset = queryParams.offset || '0'
      const orderId = queryParams.order_id

      // If specific order requested
      if (orderId) {
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
          throw new Error('Failed to fetch order')
        }

        const orders = await orderRes.json()
        const order = orders[0]

        if (!order) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'ORDER_NOT_FOUND', message: 'Order not found' })
          }
        }

        // Fetch order items
        const itemsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}&select=*`,
          {
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`
            }
          }
        )

        const items = itemsRes.ok ? await itemsRes.json() : []

        const orderWithItems: AdminOrder = {
          ...order,
          order_items: items.map((item: any) => ({
            id: item.id,
            product_name: item.product_name || item.sku || 'Unknown Product',
            quantity: Number(item.quantity || 0),
            unit_price: Number(item.unit_price || 0),
            total_price: Number(item.line_total || (item.unit_price * item.quantity)),
            variant_title: item.variant_title || null
          }))
        }

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: orderWithItems,
            invoice_info: {
              has_invoice: !!order.invoice_url,
              invoice_url: order.invoice_url,
              can_generate_invoice: order.status === 'paid' || order.payment_status === 'paid',
              needs_manual_generation: order.status === 'placed' && !order.invoice_url
            }
          })
        }
      }

      // List all orders
      let ordersQuery = `select=id,order_number,m_payment_id,status,payment_status,total,currency,created_at,paid_at,invoice_url,buyer_name,buyer_email,buyer_phone,shipping_method,fulfillment_method,fulfillment_type,delivery_address,collection_location,subtotal_cents,shipping_cents,discount_cents`

      if (status) {
        ordersQuery += `&status=eq.${encodeURIComponent(status)}`
      }

      ordersQuery += `&order=created_at.desc&limit=${limit}&offset=${offset}`

      const ordersRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?${ordersQuery}`, {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`
        }
      })

      if (!ordersRes.ok) {
        throw new Error('Failed to fetch orders')
      }

      const orders = await ordersRes.json()

      const orderIds = orders.map((o: any) => o.id).filter(Boolean)
      let courseOrderIdSet = new Set<string>()
      if (orderIds.length > 0) {
        const inFilter = `(${orderIds.map((id: string) => `"${id}"`).join(',')})`
        const cpRes = await fetch(
          `${SUPABASE_URL}/rest/v1/course_purchases?select=order_id&order_id=in.${encodeURIComponent(inFilter)}`,
          {
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`
            }
          }
        )
        if (cpRes.ok) {
          const cps = await cpRes.json()
          courseOrderIdSet = new Set<string>((cps || []).map((c: any) => String(c.order_id)))
        }
      }

      const filteredOrders = orders.filter((o: any) => !courseOrderIdSet.has(String(o.id)))

      // For each order, fetch items with invoice_url status
      const ordersWithItems = await Promise.all(
        filteredOrders.map(async (order: any) => {
          // Fetch order items
          const itemsRes = await fetch(
            `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order.id}&select=id,product_name,quantity,unit_price,total_price,variant_title`,
            {
              headers: {
                apikey: SERVICE_KEY,
                Authorization: `Bearer ${SERVICE_KEY}`
              }
            }
          )

          const items = itemsRes.ok ? await itemsRes.json() : []

          return {
            ...order,
            order_items: items,
            has_invoice: !!order.invoice_url,
            invoice_ready: order.invoice_url !== null
          }
        })
      )

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders: ordersWithItems,
          count: ordersWithItems.length,
          has_invoices: ordersWithItems.filter(o => o.has_invoice).length
        })
      }
    }

    // POST /admin-orders/generate-invoice - Generate invoice for order
    if (event.httpMethod === 'POST' && queryParams.action === 'generate-invoice') {
      const body = event.body || '{}'
      let json: any
      try {
        json = JSON.parse(body)
      } catch {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'INVALID_JSON', message: 'Invalid JSON' })
        }
      }

      const { order_id, m_payment_id } = json || {}
      if (!order_id && !m_payment_id) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'MISSING_PARAMS', message: 'order_id or m_payment_id required' })
        }
      }

      // Call invoice-pdf function to generate invoice
      const invoiceResponse = await fetch('/.netlify/functions/invoice-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          m_payment_id: m_payment_id,
          order_id: order_id,
          site_url: 'https://blom-cosmetics.co.za'
        })
      })

      if (invoiceResponse.ok) {
        // Fetch updated order to get invoice_url
        const orderRes = await fetch(
          `${SUPABASE_URL}/rest/v1/orders?id=eq.${order_id}&select=invoice_url,status,payment_status`,
          {
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`
            }
          }
        )

        const orders = await orderRes.json()
        const updatedOrder = orders[0]

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            message: 'Invoice generated successfully',
            invoice_url: updatedOrder?.invoice_url || null,
            order_status: updatedOrder?.status,
            payment_status: updatedOrder?.payment_status
          })
        }
      } else {
        const errorText = await invoiceResponse.text()
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'INVOICE_GENERATION_FAILED',
            message: `Invoice generation failed: ${errorText}`
          })
        }
      }
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' })
    }

  } catch (error: any) {
    console.error('Admin orders handler error:', error)
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
