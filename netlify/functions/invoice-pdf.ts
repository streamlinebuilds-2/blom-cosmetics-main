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
    if (!id) return { statusCode: 400, body: 'Missing m_payment_id' };

    if (!SUPABASE_URL || !SRK) {
      return { statusCode: 500, body: 'Supabase not configured' };
    }

    const orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?select=*,order_items(*,products(name))&merchant_payment_id=eq.${encodeURIComponent(id)}&limit=1`,
      { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } }
    );
    if (!orderRes.ok) return { statusCode: orderRes.status, body: await orderRes.text() };
    const arr = await orderRes.json();
    const order = arr?.[0];
    if (!order) return { statusCode: 404, body: 'Order not found' };

    const items = (order.order_items || []).map((it: any) => ({
      name: it.products?.name ?? it.name ?? 'Item',
      qty: Number(it.quantity ?? 1),
      unit: Number(it.unit_price ?? 0),
      total: Number(it.total_price ?? (Number(it.quantity ?? 1) * Number(it.unit_price ?? 0)))
    }));
    const subtotal = items.reduce((s: number, i: any) => s + i.total, 0);
    const shipping = Number(order.shipping_total ?? 0);
    const grand = Number(order.total_amount ?? subtotal + shipping);

    const { Document, Page, Text, View, StyleSheet, Font, renderToBuffer /*, Image*/ } = await import('@react-pdf/renderer');

    const styles = StyleSheet.create({
      page: { padding: 32 },
      header: { marginBottom: 16 },
      brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      brandLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
      logo: { width: 64, height: 64 },
      brand: { fontSize: 18, fontWeight: 700 },
      addr: { fontSize: 9, color: '#666', marginTop: 2 },
      metaRow: { fontSize: 10, marginTop: 4, color: '#666' },
      sectionTitle: { marginTop: 16, fontSize: 12, fontWeight: 600 },
      tableHeader: { flexDirection: 'row', borderBottom: 1, paddingBottom: 6, marginTop: 8, borderColor: '#ddd' },
      th: { fontSize: 10, flex: 1, fontWeight: 600 },
      row: { flexDirection: 'row', paddingVertical: 6, borderBottom: 1, borderColor: '#eee' },
      td: { fontSize: 10, flex: 1 },
      right: { textAlign: 'right' as const },
      totalRow: { flexDirection: 'row', marginTop: 10 },
      totalLabel: { flex: 1, textAlign: 'right' as const, fontSize: 11, fontWeight: 600 },
      totalValue: { width: 100, textAlign: 'right' as const, fontSize: 11, fontWeight: 700 },
      footer: { position: 'absolute' as const, bottom: 24, left: 32, right: 32, fontSize: 9, color: '#888' },
    });

    const brandAddress = '34 Horingbek St, Randfontein 1759, South Africa';
    const brandEmail = 'shopblomcosmetics@gmail.com';
    const brandPhone = '+27 79 548 3317';

    const InvoiceDoc = () => (
      React.createElement(Document, null,
        React.createElement(Page, { size: 'A4' as any, style: styles.page },
          React.createElement(View, { style: styles.header },
            React.createElement(View, { style: styles.brandRow },
              React.createElement(View, { style: styles.brandLeft },
                // Logo placeholder (uncomment when available)
                // React.createElement(Image, { src: '/blom-logo.png', style: styles.logo }),
                React.createElement(View, null,
                  React.createElement(Text, { style: styles.brand }, 'BLOM Cosmetics — Tax Invoice / Receipt'),
                  React.createElement(Text, { style: styles.addr }, brandAddress),
                  React.createElement(Text, { style: styles.addr }, `${brandEmail} · ${brandPhone}`)
                )
              )
            ),
            React.createElement(Text, { style: styles.metaRow }, `Order: ${order.merchant_payment_id}`),
            React.createElement(Text, { style: styles.metaRow }, `Date: ${new Date(order.created_at || Date.now()).toLocaleString()}`),
            React.createElement(Text, { style: styles.metaRow }, `Status: ${(order.status || '').toUpperCase()}`)
          ),

          React.createElement(Text, { style: styles.sectionTitle }, 'Bill To'),
          React.createElement(Text, { style: styles.metaRow }, order.customer_name || 'Customer'),
          React.createElement(Text, { style: styles.metaRow }, order.customer_email || ''),

          React.createElement(Text, { style: styles.sectionTitle }, 'Items'),
          React.createElement(View, { style: styles.tableHeader },
            React.createElement(Text, { style: styles.th }, 'Item'),
            React.createElement(Text, { style: [styles.th, styles.right] as any }, 'Qty'),
            React.createElement(Text, { style: [styles.th, styles.right] as any }, 'Unit'),
            React.createElement(Text, { style: [styles.th, styles.right] as any }, 'Total')
          ),
          ...items.map((it: any, idx: number) => (
            React.createElement(View, { key: String(idx), style: styles.row },
              React.createElement(Text, { style: styles.td }, it.name),
              React.createElement(Text, { style: [styles.td, styles.right] as any }, String(it.qty)),
              React.createElement(Text, { style: [styles.td, styles.right] as any }, ZAR(it.unit)),
              React.createElement(Text, { style: [styles.td, styles.right] as any }, ZAR(it.total))
            )
          )),

          React.createElement(View, { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, 'Subtotal'),
            React.createElement(Text, { style: styles.totalValue }, ZAR(subtotal))
          ),
          React.createElement(View, { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, 'Shipping'),
            React.createElement(Text, { style: styles.totalValue }, ZAR(shipping))
          ),
          React.createElement(View, { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, 'Total'),
            React.createElement(Text, { style: styles.totalValue }, ZAR(grand))
          ),

          React.createElement(Text, { style: styles.footer }, 'Thank you for your purchase! This receipt was generated automatically by BLOM Cosmetics.')
        )
      )
    );

    const buf = await renderToBuffer(React.createElement(InvoiceDoc));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BLOM-Receipt-${id}.pdf"`,
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


