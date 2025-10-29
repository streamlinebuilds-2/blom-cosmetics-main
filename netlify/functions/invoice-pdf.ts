import type { Handler } from '@netlify/functions';
import React from 'react';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

function ZAR(n: number) {
  return `R${Number(n || 0).toFixed(2)}`;
}

function formatDate(date: string | undefined | null): string {
  if (!date) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(date: string | undefined | null): string {
  if (!date) return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export const handler: Handler = async (event) => {
  try {
    const id = event.queryStringParameters?.m_payment_id || event.queryStringParameters?.id;
    const asInline = event.queryStringParameters?.inline === '1' || event.queryStringParameters?.inline === 'true';
    if (!id) return { statusCode: 400, body: 'Missing m_payment_id or id' };

    if (!SUPABASE_URL || !SRK) {
      return { statusCode: 500, body: 'Supabase not configured' };
    }

    // Try multiple ways to find the order
    const tryCols = ['merchant_payment_id', 'm_payment_id', 'custom_str1', 'id'];
    let order: any = null;
    let orderItems: any[] = [];

    for (const col of tryCols) {
      try {
        // First try to get order with order_items relation
        const url = `${SUPABASE_URL}/rest/v1/orders?select=*,order_items(*)&${encodeURIComponent(col)}=eq.${encodeURIComponent(id)}&limit=1`;
        const r = await fetch(url, { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } });
        if (!r.ok) continue;
        const j = await r.json();
        if (Array.isArray(j) && j.length) {
          order = j[0];
          orderItems = order.order_items || [];
          break;
        }
      } catch (e) {
        // Try without relation
        try {
          const url = `${SUPABASE_URL}/rest/v1/orders?select=*&${encodeURIComponent(col)}=eq.${encodeURIComponent(id)}&limit=1`;
          const r = await fetch(url, { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } });
          if (!r.ok) continue;
          const j = await r.json();
          if (Array.isArray(j) && j.length) {
            order = j[0];
            // Try to fetch items separately
            try {
              const itemsUrl = `${SUPABASE_URL}/rest/v1/order_items?select=*&order_id=eq.${encodeURIComponent(order.id)}`;
              const itemsRes = await fetch(itemsUrl, { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } });
              if (itemsRes.ok) {
                const itemsData = await itemsRes.json();
                orderItems = Array.isArray(itemsData) ? itemsData : [];
              }
            } catch {}
            break;
          }
        } catch {}
      }
    }

    // If still no order, return error instead of demo
    if (!order) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Order not found: ${id}` })
      };
    }

    // Extract items from order
    const items = (orderItems.length > 0 ? orderItems : order.order_items || []).map((it: any) => ({
      name: it.name || `Product ${it.product_id || 'Unknown'}` || 'Item',
      qty: Number(it.quantity ?? 1),
      unit: Number(it.unit_price ?? it.price ?? 0),
      total: Number(it.subtotal ?? it.total_price ?? (Number(it.quantity ?? 1) * Number(it.unit_price ?? it.price ?? 0)))
    }));

    // Calculate totals
    const subtotal = items.reduce((s: number, i: any) => s + i.total, 0);
    const shipping = Number(order.shipping_cost ?? order.shipping ?? 0);
    const discount = Number(order.coupon_discount ?? order.discount ?? 0);
    const grand = Number(order.total_amount ?? (subtotal + shipping - discount));

    // Customer address formatting
    const getCustomerAddress = () => {
      const method = order.shipping_method || '';
      if (method.toLowerCase().includes('pickup') || method.toLowerCase().includes('collect')) {
        return {
          type: 'Store Pickup',
          hashtag: order.locker_name ? `${order.locker_name}, ${order.locker_street || ''}`.trim() : 'BLOM HQ, 34 Horingbek St, Randfontein 1759'
        };
      }
      // Door-to-door
      const parts = [];
      if (order.ship_to_street) parts.push(order.ship_to_street);
      if (order.ship_to_suburb) parts.push(order.ship_to_suburb);
      if (order.ship_to_city) parts.push(order.ship_to_city);
      if (order.ship_to_zone) parts.push(order.ship_to_zone);
      if (order.ship_to_postal_code) parts.push(order.ship_to_postal_code);
      return {
        type: 'Door-to-Door Delivery',
        address: parts.length > 0 ? parts.join(', ') : 'Address not provided'
      };
    };

    const customerAddr = getCustomerAddress();

    const { Document, Page, Text, View, StyleSheet, renderToBuffer } = await import('@react-pdf/renderer');

    const styles = StyleSheet.create({
      page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica'
      },
      header: {
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: 2,
        borderColor: '#FF74A4',
        paddingBottom: 20
      },
      brandSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
      },
      logo: {
        width: 56,
        height: 56,
        backgroundColor: '#FF74A4',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
      },
      logoText: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold'
      },
      brandInfo: {
        flex: 1
      },
      brandName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4
      },
      receiptTitle: {
        fontSize: 13,
        color: '#FF74A4',
        fontWeight: 600
      },
      orderInfo: {
        textAlign: 'right',
        gap: 4
      },
      orderMeta: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 3
      },
      statusPaid: {
        fontSize: 11,
        color: '#059669',
        fontWeight: 'bold',
        backgroundColor: '#d1fae5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
      },
      contentCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 16
      },
      card: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 16,
        border: 1,
        borderColor: '#e5e7eb',
        flex: 1
      },
      cardTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5
      },
      cardText: {
        fontSize: 10,
        color: '#374151',
        marginBottom: 4,
        lineHeight: 1.5
      },
      itemsCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 20,
        border: 1,
        borderColor: '#e5e7eb',
        marginBottom: 24
      },
      itemsTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5
      },
      tableHeader: {
        flexDirection: 'row',
        borderBottom: 2,
        paddingBottom: 10,
        borderColor: '#FF74A4',
        marginBottom: 10
      },
      th: {
        fontSize: 9,
        flex: 2,
        fontWeight: 'bold',
        color: '#1f2937',
        textTransform: 'uppercase',
        letterSpacing: 0.5
      },
      thRight: {
        fontSize: 9,
        flex: 1,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'right',
        textTransform: 'uppercase',
        letterSpacing: 0.5
      },
      row: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottom: 1,
        borderColor: '#f3f4f6'
      },
      td: {
        fontSize: 10,
        flex: 2,
        color: '#374151',
        lineHeight: 1.4
      },
      tdRight: {
        fontSize: 10,
        flex: 1,
        color: '#374151',
        textAlign: 'right'
      },
      totalsSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTop: 2,
        borderColor: '#e5e7eb'
      },
      totalRow: {
        flexDirection: 'row',
        marginBottom: 8,
        justifyContent: 'space-between'
      },
      totalLabel: {
        fontSize: 10,
        color: '#6b7280'
      },
      totalValue: {
        fontSize: 10,
        color: '#374151',
        fontWeight: 500
      },
      grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        marginTop: 8,
        borderTop: 2,
        borderColor: '#FF74A4'
      },
      grandTotalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1f2937'
      },
      grandTotalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF74A4'
      },
      footer: {
        position: 'absolute' as const,
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: 1,
        borderColor: '#e5e7eb',
        paddingTop: 16
      },
      footerText: {
        fontSize: 8,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 1.5
      }
    });

    const brandAddress = '34 Horingbek St, Randfontein 1759, South Africa';
    const brandEmail = 'shopblomcosmetics@gmail.com';
    const brandPhone = '+27 79 548 3317';

    const InvoiceDoc = () => (
      React.createElement(Document, null,
        React.createElement(Page, { size: 'A4' as any, style: styles.page },
          // Header
          React.createElement(View, { style: styles.header },
            React.createElement(View, { style: styles.brandSection },
              React.createElement(View, { style: styles.logo },
                React.createElement(Text, { style: styles.logoText }, 'B')
              ),
              React.createElement(View, { style: styles.brandInfo },
                React.createElement(Text, { style: styles.brandName }, 'BLOM Cosmetics'),
                React.createElement(Text, { style: styles.receiptTitle }, 'INVOICE / RECEIPT')
              )
            ),
            React.createElement(View, { style: styles.orderInfo },
              React.createElement(Text, { style: styles.orderMeta }, `Order #${order.merchant_payment_id || id}`),
              React.createElement(Text, { style: styles.orderMeta }, `Date: ${formatDate(order.created_at)}`),
              React.createElement(Text, { style: styles.orderMeta }, `Time: ${formatTime(order.created_at)}`),
              React.createElement(View, { style: { marginTop: 4 } },
                React.createElement(Text, { style: styles.statusPaid }, order.status === 'paid' ? 'PAID' : order.status?.toUpperCase() || 'PENDING')
              )
            )
          ),

          // Customer & Merchant Info
          React.createElement(View, { style: styles.contentCards },
            React.createElement(View, { style: styles.card },
              React.createElement(Text, { style: styles.cardTitle }, 'Bill To'),
              React.createElement(Text, { style: styles.cardText }, order.customer_name || 'Customer'),
              React.createElement(Text, { style: styles.cardText }, order.customer_email || ''),
              React.createElement(Text, { style: styles.cardText }, order.customer_mobile || ''),
              React.createElement(View, { style: { marginTop: 6, paddingTop: 6, borderTop: 1, borderColor: '#e5e7eb' } },
                React.createElement(Text, { style: [styles.cardText, { fontWeight: 'bold' }] }, customerAddr.type),
                React.createElement(Text, { style: styles.cardText }, customerAddr.address || customerAddr.hashtag || '')
              )
            ),
            React.createElement(View, { style: styles.card },
              React.createElement(Text, { style: styles.cardTitle }, 'From'),
              React.createElement(Text, { style: styles.cardText }, 'BLOM Cosmetics (Pty) Ltd'),
              React.createElement(Text, { style: styles.cardText }, brandAddress),
              React.createElement(Text, { style: styles.cardText }, `Email: ${brandEmail}`),
              React.createElement(Text, { style: styles.cardText }, `Phone: ${brandPhone}`)
            )
          ),

          // Items Table
          React.createElement(View, { style: styles.itemsCard },
            React.createElement(Text, { style: styles.itemsTitle }, 'Order Items'),
            React.createElement(View, { style: styles.tableHeader },
              React.createElement(Text, { style: styles.th }, 'Description'),
              React.createElement(Text, { style: styles.thRight }, 'Qty'),
              React.createElement(Text, { style: styles.thRight }, 'Unit Price'),
              React.createElement(Text, { style: styles.thRight }, 'Total')
            ),
            ...items.map((it: any, idx: number) => (
              React.createElement(View, { key: String(idx), style: styles.row },
                React.createElement(Text, { style: styles.td }, it.name),
                React.createElement(Text, { style: styles.tdRight }, String(it.qty)),
                React.createElement(Text, { style: styles.tdRight }, ZAR(it.unit)),
                React.createElement(Text, { style: styles.tdRight }, ZAR(it.total))
              )
            )),

            // Totals
            React.createElement(View, { style: styles.totalsSection },
              React.createElement(View, { style: styles.totalRow },
                React.createElement(Text, { style: styles.totalLabel }, 'Subtotal'),
                React.createElement(Text, { style: styles.totalValue }, ZAR(subtotal))
              ),
              ...(shipping > 0 ? [
                React.createElement(View, { key: 'shipping', style: styles.totalRow },
                  React.createElement(Text, { style: styles.totalLabel }, 'Shipping'),
                  React.createElement(Text, { style: styles.totalValue }, ZAR(shipping))
                )
              ] : []),
              ...(discount > 0 ? [
                React.createElement(View, { key: 'discount', style: styles.totalRow },
                  React.createElement(Text, { style: [styles.totalLabel, { color: '#059669' }] }, 'Discount'),
                  React.createElement(Text, { style: [styles.totalValue, { color: '#059669' }] }, `-${ZAR(discount)}`)
                )
              ] : []),
              React.createElement(View, { style: styles.grandTotalRow },
                React.createElement(Text, { style: styles.grandTotalLabel }, 'Total Amount'),
                React.createElement(Text, { style: styles.grandTotalValue }, ZAR(grand))
              )
            )
          ),

          // Footer
          React.createElement(View, { style: styles.footer },
            React.createElement(Text, { style: styles.footerText },
              'Thank you for your order! This invoice was automatically generated.\n'
            ),
            React.createElement(Text, { style: styles.footerText },
              'For any queries, please contact us at shopblomcosmetics@gmail.com or +27 79 548 3317'
            )
          )
        )
      )
    );

    const buf = await renderToBuffer(React.createElement(InvoiceDoc));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${asInline ? 'inline' : 'attachment'}; filename="BLOM-Invoice-${order.merchant_payment_id || id}.pdf"`,
        'Cache-Control': 'private, max-age=0, no-store',
      },
      body: Buffer.from(buf).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err: any) {
    console.error('Invoice generation error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Invoice error: ${err.message}`, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined })
    };
  }
};
