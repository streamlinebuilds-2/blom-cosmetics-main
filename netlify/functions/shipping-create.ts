import type { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const SB_URL = process.env.SUPABASE_URL!;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SHIP_BASE = process.env.SHIPLOGIC_BASE || 'https://api.shiplogic.com';
const SHIP_TOKEN = process.env.SHIPLOGIC_TOKEN!;

const WAREHOUSE = {
  name: process.env.WAREHOUSE_NAME || 'BLOM Cosmetics',
  email: process.env.WAREHOUSE_EMAIL || 'support@blom-cosmetics.co.za',
  mobile_number: process.env.WAREHOUSE_PHONE || '',
  address: {
    type: 'business',
    company: process.env.WAREHOUSE_NAME || 'BLOM Cosmetics',
    street_address: process.env.WAREHOUSE_STREET || '34 Horingbek Ave',
    local_area: process.env.WAREHOUSE_SUBURB || 'Helikon Park',
    city: process.env.WAREHOUSE_CITY || 'Randfontein',
    zone: process.env.WAREHOUSE_ZONE || 'Gauteng',
    country: process.env.WAREHOUSE_COUNTRY || 'ZA',
    code: process.env.WAREHOUSE_POSTAL_CODE || '1759'
  }
};

type Order = {
  id: string;
  merchant_payment_id: string;
  status: string;
  total_amount: number;
  currency: string;
  shipping_method: 'door'|'locker'|'own-fleet';
  shipping_status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_mobile: string | null;
  ship_to_street: string | null;
  ship_to_suburb: string | null;
  ship_to_city: string | null;
  ship_to_zone: string | null;
  ship_to_postal_code: string | null;
  locker_id: string | null;
  locker_name: string | null;
  locker_street: string | null;
  locker_suburb: string | null;
  locker_city: string | null;
  locker_zone: string | null;
  locker_postal_code: string | null;
  locker_lat: number | null;
  locker_lng: number | null;
};

type OrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_bulky?: boolean;
  shipping_provider?: 'courier'|'own-fleet';
  weight_kg?: number | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
};

function toParcels(items: OrderItem[]) {
  const courierItems = items.filter(i => !i.is_bulky && (i.shipping_provider ?? 'courier') === 'courier');
  if (courierItems.length === 0) return { parcels: [], anyCourier: false };

  const totalWeight = courierItems.reduce((s,i)=> s + (Number(i.weight_kg || 0.5) * (i.quantity||1)), 0);
  const parcel = {
    submitted_length_cm: 35,
    submitted_width_cm: 25,
    submitted_height_cm: 15,
    submitted_weight_kg: Math.max(1, Number(totalWeight.toFixed(2)))
  };
  return { parcels: [parcel], anyCourier: true };
}

function buildDelivery(order: Order) {
  // For locker/kiosk deliveries, use pickup point fields instead of address
  if (order.shipping_method === 'locker' && order.locker_id) {
    return {
      // Use pickup point fields for locker delivery
      delivery_pickup_point_id: order.locker_id,
      delivery_pickup_point_provider: 'tcg-locker',
      contact: {
        name: order.customer_name || 'Customer',
        email: order.customer_email || '',
        mobile_number: order.customer_mobile || ''
      }
    };
  }
  
  // For door-to-door deliveries, use address fields
  return {
    address: {
      type: 'residential',
      street_address: order.ship_to_street || '',
      local_area: order.ship_to_suburb || '',
      city: order.ship_to_city || '',
      zone: order.ship_to_zone || '',
      country: 'ZA',
      code: order.ship_to_postal_code || ''
    },
    contact: {
      name: order.customer_name || 'Customer',
      email: order.customer_email || '',
      mobile_number: order.customer_mobile || ''
    }
  };
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { orderId } = JSON.parse(event.body || '{}');
    if (!orderId) return { statusCode: 400, body: 'Missing orderId' };

    // Load order
    const or = await fetch(`${SB_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*`, {
      headers: { apikey: SRK, Authorization: `Bearer ${SRK}` }
    });
    if (!or.ok) return { statusCode: or.status, body: await or.text() };
    const [order]: Order[] = await or.json();
    if (!order) return { statusCode: 404, body: 'Order not found' };

    // Idempotency
    if (order.shiplogic_id) {
      return { statusCode: 200, body: JSON.stringify({
        message: 'Shipment already exists',
        tracking_reference: order.tracking_reference,
        label_url: order.label_url,
        sticker_url: order.sticker_url
      })};
    }

    // Load items
    const ir = await fetch(`${SB_URL}/rest/v1/order_items?order_id=eq.${encodeURIComponent(orderId)}&select=*`, {
      headers: { apikey: SRK, Authorization: `Bearer ${SRK}` }
    });
    if (!ir.ok) return { statusCode: ir.status, body: await ir.text() };
    const items: OrderItem[] = await ir.json();

    // Split by eligibility
    const { parcels, anyCourier } = toParcels(items);
    if (!anyCourier) {
      await fetch(`${SB_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SRK, Authorization: `Bearer ${SRK}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shipping_method: 'own-fleet', shipping_status: 'submitted' })
      });
      return { statusCode: 200, body: JSON.stringify({ message: 'Own-fleet delivery set (no courier-eligible items)' }) };
    }

    // Build addresses/contacts
    const delivery = buildDelivery(order);

    // Service level (placeholder codes; replace when you have the real ones)
    const service_level_code = (order.shipping_method === 'locker') ? 'LOCKER-STD' : 'ECO-STD';

    // Create shipment payload based on delivery type
    const shipPayload = {
      customer_reference: order.merchant_payment_id,
      collection_address: WAREHOUSE.address,
      collection_contact: { name: WAREHOUSE.name, email: WAREHOUSE.email, mobile_number: WAREHOUSE.mobile_number },
      // Conditionally include delivery_address OR delivery_pickup_point fields
      ...(delivery.delivery_pickup_point_id ? {
        delivery_pickup_point_id: delivery.delivery_pickup_point_id,
        delivery_pickup_point_provider: delivery.delivery_pickup_point_provider
      } : {
        delivery_address: delivery.address
      }),
      delivery_contact: delivery.contact,
      parcels,
      service_level_code
    };

    const sr = await fetch(`${SHIP_BASE}/v2/shipments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SHIP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(shipPayload)
    });
    if (!sr.ok) return { statusCode: sr.status, body: await sr.text() };
    const sbody = await sr.json();

    const shiplogicId = sbody?.id || sbody?.shipment_id || sbody?.data?.id;
    const trackingRef = sbody?.short_tracking_reference || sbody?.tracking_reference || sbody?.data?.short_tracking_reference;

    async function getSigned(path: string, id: any) {
      const res = await fetch(`${SHIP_BASE}${path}?id=${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${SHIP_TOKEN}` }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.url || data?.signed_url || null;
    }
    const labelUrl = await getSigned('/v2/shipments/label', shiplogicId);
    const stickerUrl = await getSigned('/v2/shipments/label/stickers', shiplogicId);

    // Persist
    await fetch(`${SB_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: {
        apikey: SRK, Authorization: `Bearer ${SRK}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shipping_status: 'submitted',
        shiplogic_id: shiplogicId,
        tracking_reference: trackingRef,
        label_url: labelUrl,
        sticker_url: stickerUrl
      })
    });

    return { statusCode: 200, body: JSON.stringify({ tracking_reference: trackingRef, label_url: labelUrl, sticker_url: stickerUrl }) };

  } catch (err: any) {
    return { statusCode: 500, body: `shipping-create error: ${err.message}` };
  }
};
