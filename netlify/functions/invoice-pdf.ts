import type { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

// Minimal invoice renderer (HTML) that looks up an order by many keys.
// Params: m_payment_id (required), inline=1 (display in iframe), otherwise attachment download

export const handler: Handler = async (event) => {
  try {
    const orderId = event.queryStringParameters?.m_payment_id || '';
    const inline = event.queryStringParameters?.inline === '1' || !!event.queryStringParameters?.inline;
    if (!orderId) return { statusCode: 400, body: 'm_payment_id required' };

    const supaUrl = process.env.SUPABASE_URL;
    const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supaUrl || !srk) {
      // Gracefully degrade if env not set
      return { statusCode: 500, body: 'Server not configured' };
    }

    const headers = { apikey: srk, Authorization: `Bearer ${srk}` } as any;

    // Try several keys commonly used for order identifiers
    const endpoints = [
      `${supaUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*`,
      `${supaUrl}/rest/v1/orders?order_number=eq.${encodeURIComponent(orderId)}&select=*`,
      `${supaUrl}/rest/v1/orders?merchant_payment_id=eq.${encodeURIComponent(orderId)}&select=*`,
      `${supaUrl}/rest/v1/orders?m_payment_id=eq.${encodeURIComponent(orderId)}&select=*`
    ];

    let order: any = null;
    for (const url of endpoints) {
      const r = await fetch(url, { headers });
      if (!r.ok) continue;
      const j = await r.json();
      if (Array.isArray(j) && j.length > 0) { order = j[0]; break; }
    }

    if (!order) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Order not found'
      };
    }

    // Load order_items if table exists
    let items: any[] = [];
    try {
      const ri = await fetch(`${supaUrl}/rest/v1/order_items?order_id=eq.${encodeURIComponent(order.id || orderId)}&select=*`, { headers });
      if (ri.ok) items = await ri.json();
    } catch {}

    const currency = 'ZAR';
    const fmt = (n: number) => `R${Number(n || 0).toFixed(2)}`;
    const total = Number(order.total || order.amount || 0);

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BLOM Receipt ${orderId}</title>
  <style>
    body{font-family: ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";background:#f8fafc;color:#0f172a;margin:0;padding:24px}
    .card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;max-width:900px;margin:0 auto}
    .hdr{padding:16px 20px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}
    .title{font-weight:700;font-size:18px}
    .muted{color:#64748b;font-size:12px}
    .pad{padding:20px}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left}
    th{background:#f8fafc;color:#0f172a}
    .total{font-weight:700}
  </style>
  </head>
  <body>
    <div class="card">
      <div class="hdr">
        <div>
          <div class="title">Invoice #${orderId}</div>
          <div class="muted">Payment Receipt</div>
        </div>
        <div class="muted">${new Date(order.created_at || Date.now()).toLocaleString()}</div>
      </div>
      <div class="pad">
        <div style="margin-bottom:16px">
          <div><strong>Billed To</strong></div>
          <div>${order.name_first || order.customer_name || ''} ${order.name_last || ''}</div>
          <div>${order.email || order.buyer_email || ''}</div>
        </div>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
          <tbody>
            ${items.map(it => {
              const qty = Number(it.quantity || 1);
              const price = Number(it.price || it.unit_price || 0);
              return `<tr><td>${it.name || it.product_name || 'Item'}</td><td>${qty}</td><td>${fmt(price)}</td><td>${fmt(qty*price)}</td></tr>`;
            }).join('') || `<tr><td>${order.item_name || 'Order'}</td><td>1</td><td>${fmt(total)}</td><td>${fmt(total)}</td></tr>`}
            <tr><td colspan="3" class="total">Total</td><td class="total">${fmt(total)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </body>
  </html>`;

    const headersOut: Record<string,string> = { 'Content-Type': 'text/html; charset=utf-8' };
    if (!inline) {
      headersOut['Content-Disposition'] = `attachment; filename=BLOM-Receipt-${orderId}.html`;
    }
    return { statusCode: 200, headers: headersOut, body: html };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};

import { Handler } from '@netlify/functions';
import React from 'react';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

function ZAR(n: number) {
  return `R${Number(n || 0).toFixed(2)}`;
}

export const handler: Handler = async (event) => {
  try {
    const id = event.queryStringParameters?.m_payment_id;
    const asInline = event.queryStringParameters?.inline === '1' || event.queryStringParameters?.inline === 'true';
    if (!id) return { statusCode: 400, body: 'Missing m_payment_id' };

    if (!SUPABASE_URL || !SRK) {
      return { statusCode: 500, body: 'Supabase not configured' };
    }

    // Try multiple keys: merchant_payment_id (new), m_payment_id (legacy), id (fallback)
    const orFilter = encodeURIComponent(
      `merchant_payment_id.eq.${id},m_payment_id.eq.${id},id.eq.${id}`
    );
    const orderUrl = `${SUPABASE_URL}/rest/v1/orders?select=*,order_items(name,quantity,unit_price,subtotal,product_id)&or=(${orFilter})&limit=1`;
    const orderRes = await fetch(orderUrl, { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } });
    if (!orderRes.ok) return { statusCode: orderRes.status, body: await orderRes.text() };
    const arr = await orderRes.json();
    const order = arr?.[0];
    if (!order) return { statusCode: 404, body: 'Order not found' };

    const items = (order.order_items || []).map((it: any) => ({
      name: it.name || `Product ${it.product_id}` || 'Item',
      qty: Number(it.quantity ?? 1),
      unit: Number(it.unit_price ?? 0),
      total: Number(it.subtotal ?? (Number(it.quantity ?? 1) * Number(it.unit_price ?? 0)))
    }));
    const subtotal = items.reduce((s: number, i: any) => s + i.total, 0);
    const shipping = Number(order.shipping ?? 0);
    const grand = Number(order.total_amount ?? subtotal + shipping);

    const { Document, Page, Text, View, StyleSheet, Font, renderToBuffer /*, Image*/ } = await import('@react-pdf/renderer');

    const styles = StyleSheet.create({
      page: { 
        padding: 40, 
        backgroundColor: '#f8fafc',
        fontFamily: 'Helvetica'
      },
      header: { 
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      },
      brandSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
      },
      logo: { 
        width: 48, 
        height: 48, 
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
      },
      brandInfo: {
        flex: 1
      },
      brandName: { 
        fontSize: 20, 
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 2
      },
      receiptTitle: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: 500
      },
      orderInfo: {
        textAlign: 'right',
        gap: 4
      },
      orderMeta: { 
        fontSize: 11, 
        color: '#6b7280',
        marginBottom: 2
      },
      statusPaid: {
        fontSize: 11,
        color: '#1f2937',
        fontWeight: 600
      },
      contentCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 16
      },
      card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        flex: 1
      },
      cardTitle: { 
        fontSize: 12, 
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8
      },
      cardText: { 
        fontSize: 10, 
        color: '#374151',
        marginBottom: 3,
        lineHeight: 1.4
      },
      itemsCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginBottom: 20
      },
      itemsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12
      },
      tableHeader: { 
        flexDirection: 'row', 
        borderBottom: 1, 
        paddingBottom: 8, 
        borderColor: '#e5e7eb',
        marginBottom: 8
      },
      th: { 
        fontSize: 10, 
        flex: 1, 
        fontWeight: 'bold',
        color: '#374151'
      },
      thRight: {
        fontSize: 10,
        flex: 1,
        fontWeight: 'bold',
        color: '#374151',
        textAlign: 'right'
      },
      row: { 
        flexDirection: 'row', 
        paddingVertical: 8, 
        borderBottom: 1, 
        borderColor: '#f3f4f6'
      },
      td: { 
        fontSize: 10, 
        flex: 1,
        color: '#374151'
      },
      tdRight: { 
        fontSize: 10, 
        flex: 1,
        color: '#374151',
        textAlign: 'right'
      },
      totalsSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTop: 1,
        borderColor: '#e5e7eb'
      },
      totalRow: { 
        flexDirection: 'row', 
        marginBottom: 6,
        justifyContent: 'space-between'
      },
      totalLabel: { 
        fontSize: 10,
        color: '#374151'
      },
      totalValue: { 
        fontSize: 10,
        color: '#374151'
      },
      grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTop: 1,
        borderColor: '#e5e7eb'
      },
      grandTotalLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1f2937'
      },
      grandTotalValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1f2937'
      },
      footer: { 
        position: 'absolute' as const, 
        bottom: 24, 
        left: 40, 
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      footerText: {
        fontSize: 9, 
        color: '#9ca3af'
      },
      actionButtons: {
        flexDirection: 'row',
        gap: 8
      },
      button: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        fontSize: 9,
        fontWeight: 'bold'
      },
      primaryButton: {
        backgroundColor: '#3b82f6',
        color: 'white'
      },
      secondaryButton: {
        backgroundColor: 'white',
        color: '#3b82f6',
        borderWidth: 1,
        borderColor: '#3b82f6'
      }
    });

    const brandAddress = '34 Horingbek St, Randfontein 1759, South Africa';
    const brandEmail = 'shopblomcosmetics@gmail.com';
    const brandPhone = '+27 79 548 3317';

    const InvoiceDoc = () => (
      React.createElement(Document, null,
        React.createElement(Page, { size: 'A4' as any, style: styles.page },
          // Header Section
          React.createElement(View, { style: styles.header },
            // Brand Section (Left)
            React.createElement(View, { style: styles.brandSection },
              React.createElement(View, { style: styles.logo },
                React.createElement(Text, { style: { color: 'white', fontSize: 20, fontWeight: 'bold' } }, 'B')
              ),
              React.createElement(View, { style: styles.brandInfo },
                React.createElement(Text, { style: styles.brandName }, 'BLOM Cosmetics'),
                React.createElement(Text, { style: styles.receiptTitle }, 'Payment Receipt')
              )
            ),
            // Order Info Section (Right)
            React.createElement(View, { style: styles.orderInfo },
              React.createElement(Text, { style: styles.orderMeta }, `Order: ${order.merchant_payment_id}`),
              React.createElement(Text, { style: styles.orderMeta }, `Date: ${new Date(order.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`),
              React.createElement(Text, { style: styles.orderMeta }, `${new Date(order.created_at || Date.now()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`),
              React.createElement(Text, { style: styles.statusPaid }, 'Status: PAID')
            )
          ),

          // Content Cards Section
          React.createElement(View, { style: styles.contentCards },
            // Bill To Card
            React.createElement(View, { style: styles.card },
              React.createElement(Text, { style: styles.cardTitle }, 'Bill To'),
              React.createElement(Text, { style: styles.cardText }, order.customer_name || 'Customer'),
              React.createElement(Text, { style: styles.cardText }, order.customer_email || ''),
              React.createElement(Text, { style: styles.cardText }, 'South Africa')
            ),
            // Merchant Card
            React.createElement(View, { style: styles.card },
              React.createElement(Text, { style: styles.cardTitle }, 'Merchant'),
              React.createElement(Text, { style: styles.cardText }, 'BLOM Cosmetics (Pty) Ltd'),
              React.createElement(Text, { style: styles.cardText }, 'VAT: 0000000000'),
              React.createElement(Text, { style: styles.cardText }, brandEmail)
            )
          ),

          // Items Section
          React.createElement(View, { style: styles.itemsCard },
            React.createElement(Text, { style: styles.itemsTitle }, 'Items'),
            
            // Table Header
            React.createElement(View, { style: styles.tableHeader },
              React.createElement(Text, { style: styles.th }, 'Item'),
              React.createElement(Text, { style: styles.thRight }, 'Qty'),
              React.createElement(Text, { style: styles.thRight }, 'Unit'),
              React.createElement(Text, { style: styles.thRight }, 'Total')
            ),
            
            // Table Rows
            ...items.map((it: any, idx: number) => (
              React.createElement(View, { key: String(idx), style: styles.row },
                React.createElement(Text, { style: styles.td }, it.name),
                React.createElement(Text, { style: styles.tdRight }, String(it.qty)),
                React.createElement(Text, { style: styles.tdRight }, ZAR(it.unit)),
                React.createElement(Text, { style: styles.tdRight }, ZAR(it.total))
              )
            )),

            // Totals Section
            React.createElement(View, { style: styles.totalsSection },
              React.createElement(View, { style: styles.totalRow },
                React.createElement(Text, { style: styles.totalLabel }, 'Subtotal'),
                React.createElement(Text, { style: styles.totalValue }, ZAR(subtotal))
              ),
              React.createElement(View, { style: styles.totalRow },
                React.createElement(Text, { style: styles.totalLabel }, 'Shipping'),
                React.createElement(Text, { style: styles.totalValue }, shipping === 0 ? 'FREE' : ZAR(shipping))
              ),
              React.createElement(View, { style: styles.grandTotalRow },
                React.createElement(Text, { style: styles.grandTotalLabel }, 'Total'),
                React.createElement(Text, { style: styles.grandTotalValue }, ZAR(grand))
              )
            )
          ),

          // Footer
          React.createElement(View, { style: styles.footer },
            React.createElement(Text, { style: styles.footerText }, 'Thank you for your order! This receipt was generated automatically.')
          )
        )
      )
    );

    const buf = await renderToBuffer(React.createElement(InvoiceDoc));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${asInline ? 'inline' : 'attachment'}; filename="BLOM-Receipt-${id}.pdf"`,
        'Cache-Control': 'private, max-age=0, no-store',
      },
      body: Buffer.from(buf).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err: any) {
    return { statusCode: 500, body: `Invoice error: ${err.message}` };
  }
};

// Single export already declared above


