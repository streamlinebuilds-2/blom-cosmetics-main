import type { Handler } from '@netlify/functions'
import crypto from 'crypto'
import querystring from 'querystring'

// Use your existing env var names with fallbacks
let pfBase = process.env.PAYFAST_BASE || 'https://www.payfast.co.za'
// Strip /eng/process if it's already there (to avoid duplicates)
if (pfBase.endsWith('/eng/process')) {
  pfBase = pfBase.replace(/\/eng\/process$/, '')
}
const returnUrl = process.env.PAYFAST_RETURN_URL || (process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za') + '/checkout/return'
const cancelUrl = process.env.PAYFAST_CANCEL_URL || (process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za') + '/checkout/cancel'
const notifyUrl = process.env.PAYFAST_NOTIFY_URL || process.env.N8N_ITN_URL || 'https://n8n.example.com/webhook/payfast-itn'

function sign(fields: Record<string, any>, passphrase?: string): string {
  // PayFast signature: specific fields in specific order, with spaces as +
  // https://www.payfast.co.za/integrate/display/Help/Hosted+Integration
  const signatureFields = [
    'merchant_id',
    'merchant_key',
    'return_url',
    'cancel_url',
    'notify_url',
    'name_first',
    'name_last',
    'email_address',
    'm_payment_id',
    'amount',
    'item_name',
    'custom_str1'
  ]

  const parts: string[] = []
  for (const key of signatureFields) {
    const val = fields[key]
    if (val !== undefined && val !== null && val !== '') {
      // Use encodeURIComponent and replace %20 with +
      parts.push(`${key}=${encodeURIComponent(String(val)).replace(/%20/g, '+')}`)
    }
  }

  let baseString = parts.join('&')
  if (passphrase) {
    baseString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
  }

  return crypto.createHash('md5').update(baseString).digest('hex')
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')

    // Support both old format (totalCents, customer object) and new format (amount, name_first, etc.)
    let m_payment_id: string
    let amount: string
    let name_first: string
    let name_last: string
    let email_address: string
    let item_name: string
    let order_id: string | undefined

    if (body.totalCents && body.customer && body.merchantPaymentId) {
      // Old format - convert to new format
      m_payment_id = body.merchantPaymentId
      amount = (Number(body.totalCents) / 100).toFixed(2)
      name_first = body.customer.firstName || ''
      name_last = body.customer.lastName || ''
      email_address = body.customer.email
      item_name = body.itemName || 'BLOM Order'
      order_id = body.orderId
    } else {
      // New format - direct mapping
      m_payment_id = body.m_payment_id
      amount = body.amount
      name_first = body.name_first
      name_last = body.name_last
      email_address = body.email_address
      item_name = body.item_name || 'BLOM Order'
      order_id = body.order_id
    }

    // Validate required fields
    if (!m_payment_id || !amount || !email_address) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields: m_payment_id, amount, email_address',
          received: body
        })
      }
    }

    const fields: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || process.env.PF_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || process.env.PF_MERCHANT_KEY!,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      m_payment_id,
      amount: Number(amount).toFixed(2),
      item_name: item_name.substring(0, 100),
      name_first: name_first || '',
      name_last: name_last || '',
      email_address,
      ...(order_id && { custom_str1: order_id })
    }

    const signature = sign(fields, process.env.PAYFAST_PASSPHRASE || process.env.PF_PASSPHRASE || undefined)
    const url = `${pfBase}/eng/process?${querystring.stringify({ ...fields, signature })}`

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redirect: url })
    }
  } catch (e: any) {
    console.error('PayFast checkout error:', e)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message || 'Server error' })
    }
  }
}
