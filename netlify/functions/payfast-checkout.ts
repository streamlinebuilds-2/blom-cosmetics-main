import type { Handler } from '@netlify/functions'
import crypto from 'node:crypto'

function md5Hex(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex')
}

function buildSignature(params: Record<string, string>, passphrase?: string): string {
  const p: Record<string, string> = { ...params }
  delete (p as any).signature
  const sorted = Object.keys(p).sort().reduce<Record<string, string>>((acc, k) => {
    acc[k] = p[k] ?? ''
    return acc
  }, {})
  const qs = Object.entries(sorted)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  const withPass = passphrase ? `${qs}&passphrase=${encodeURIComponent(passphrase)}` : qs
  return md5Hex(withPass)
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }
  try {
    const body = event.body ? JSON.parse(event.body) : {}

    const merchant_id = process.env.PAYFAST_MERCHANT_ID as string
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY as string
    const passphrase = process.env.PAYFAST_PASSPHRASE as string | undefined

    const return_url = process.env.PAYFAST_RETURN_URL || 'https://blom-cosmetics.co.za/checkout/return'
    const cancel_url = process.env.PAYFAST_CANCEL_URL || 'https://blom-cosmetics.co.za/checkout/cancel'
    const notify_url = process.env.PAYFAST_NOTIFY_URL || 'https://n8n.example.com/webhook/payfast-itn'

    const amountCents: number = Number(body.total_cents || 0)
    const amount = (amountCents / 100).toFixed(2)

    const params: Record<string, string> = {
      merchant_id,
      merchant_key,
      amount,
      item_name: `BLOM Order ${body.order_number || body.order_id || ''}`.trim(),
      email_address: String(body.customer_email || ''),
      return_url,
      cancel_url,
      notify_url,
      m_payment_id: String(body.order_id || ''),
      custom_str1: String(body.order_id || ''),
    }

    const signature = buildSignature(params, passphrase)
    const response = { ...params, signature, endpoint: 'https://www.payfast.co.za/eng/process' }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify(response)
    }
  } catch (e: any) {
    return { statusCode: 400, body: `Bad Request: ${e.message || 'invalid body'}` }
  }
}

export default handler


