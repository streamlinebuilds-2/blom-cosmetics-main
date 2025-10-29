import type { Handler } from '@netlify/functions'
import crypto from 'crypto'

const IS_LIVE = process.env.PF_ENV === 'live' // set PF_ENV=live in Netlify when going live
const PF_MERCHANT_ID = process.env.PF_MERCHANT_ID!      // live or sandbox
const PF_MERCHANT_KEY = process.env.PF_MERCHANT_KEY!    // live or sandbox
const PF_PASSPHRASE = process.env.PF_PASSPHRASE || ''   // ONLY if enabled in dashboard
const RETURN_URL = process.env.PF_RETURN_URL || (process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za') + '/checkout/return'
const CANCEL_URL = process.env.PF_CANCEL_URL || (process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za') + '/checkout/cancel'
const NOTIFY_URL = process.env.PF_NOTIFY_URL || process.env.N8N_ITN_URL || 'https://n8n.example.com/webhook/payfast-itn'

function buildSignature(params: Record<string, string>, passphrase?: string) {
  // 1) sort keys alpha
  const keys = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort((a, b) => a.localeCompare(b))

  // 2) form key=value&... with urlencoded values
  const base = keys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&')

  // 3) append passphrase ONLY IF enabled
  const baseWithPass = passphrase ? `${base}&passphrase=${encodeURIComponent(passphrase)}` : base

  // 4) sha512 hex lowercase
  return {
    baseString: baseWithPass,
    signature: crypto.createHash('sha512').update(baseWithPass).digest('hex'),
  }
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')

    // ---- required inputs from your frontend / order ----
    // totalCents: number
    // itemName: string (short, <=100 chars) e.g. `Order ${merchantPaymentId}`
    // customer: { firstName, lastName, email }
    // merchantPaymentId: string, e.g. "BLM-ABC123"
    const {
      totalCents,
      itemName,
      customer,
      merchantPaymentId,      // map to m_payment_id (your merchant ref)
      orderId,                // optional: internal order UUID
      debug,                  // optional boolean to return baseString
    } = body

    if (!totalCents || !itemName || !customer?.email || !merchantPaymentId) {
      return { statusCode: 400, body: 'Missing required fields' }
    }

    const amount = (Number(totalCents) / 100).toFixed(2) // "123.45"

    // Build the exact param set PayFast expects
    const pfParams: Record<string, string> = {
      merchant_id: PF_MERCHANT_ID,
      merchant_key: PF_MERCHANT_KEY,
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      notify_url: NOTIFY_URL,

      amount,                              // "123.45"
      item_name: itemName.substring(0, 100),
      // Optional:
      // item_description: 'BLOM Order',
      name_first: customer.firstName || '',
      name_last: customer.lastName || '',
      email_address: customer.email,

      // Your own references:
      m_payment_id: merchantPaymentId,     // your merchant ref shown on PF
      custom_str1: orderId || '',          // your internal order UUID (optional)
    }

    // Compute signature
    const { baseString, signature } = buildSignature(pfParams, PF_PASSPHRASE || undefined)

    // Return all fields + signature + endpoint to the frontend
    const endpoint = IS_LIVE
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process'

    const payload = { endpoint, fields: { ...pfParams, signature } }

    if (debug) {
      // DEBUG ONLY: helps you compare with PayFast signature calculator
      ;(payload as any).debug = { baseString, hasPassphrase: !!PF_PASSPHRASE }
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }
  } catch (e: any) {
    return { statusCode: 500, body: e?.message || 'Server error' }
  }
}

export default handler
