import type { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const API = 'https://api.shiplogic.com/v2';

function auth() {
  const t = process.env.SHIPLOGIC_TOKEN!;
  return { Authorization: `Bearer ${t}` };
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { orderId } = JSON.parse(event.body || '{}');
    if (!orderId) return { statusCode: 400, body: 'orderId required' };

    // 1) Load order & items from Supabase (service role key in env)
    const supaUrl = process.env.SUPABASE_URL!;
    const srk = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const h = { apikey: srk, Authorization: `Bearer ${srk}` };

    const [orderRes, itemsRes] = await Promise.all([
      fetch(`${supaUrl}/rest/v1/orders?id=eq.${orderId}&select=*`, { headers: h }),
      fetch(`${supaUrl}/rest/v1/order_items?order_id=eq.${orderId}&select=quantity,submitted_length_cm,submitted_width_cm,submitted_height_cm,submitted_weight_kg`, { headers: h }),
    ]);
    const order = (await orderRes.json())[0];
    const items = await itemsRes.json();

    if (!order) return { statusCode: 404, body: 'Order not found' };

    // Build parcels from items (fallbacks)
    const parcels = (Array.isArray(items) ? items : []).map((p:any)=>({
      parcel_description: '',
      submitted_length_cm: Number(p.submitted_length_cm || 40),
      submitted_width_cm:  Number(p.submitted_width_cm  || 30),
      submitted_height_cm: Number(p.submitted_height_cm || 10),
      submitted_weight_kg: Number(p.submitted_weight_kg || 2),
      packaging: 'Box',
    })) || [{
      parcel_description: '',
      submitted_length_cm: 40, submitted_width_cm: 30, submitted_height_cm: 10, submitted_weight_kg: 2, packaging: 'Box'
    }];

    // Contacts
    const delivery_contact = {
      name: order.recipient_name || order.name_first || 'Customer',
      mobile_number: order.customer_mobile || order.phone || '',
      email: order.email || order.buyer_email || ''
    };
    const collection_contact = {
      name: 'Blom Dispatch',
      mobile_number: process.env.DISPATCH_MOBILE || '000',
      email: process.env.DISPATCH_EMAIL || 'dispatch@example.com'
    };

    // Address vs Pickup point
    const warehouse = JSON.parse(process.env.WAREHOUSE_ADDRESS_JSON || '{}');

    const isLocker = (order.shipping_method || '').toLowerCase().includes('locker')
                  || (order.shipping_method || '').toLowerCase().includes('kiosk')
                  || !!order.delivery_pickup_point_id;

    const basePayload:any = {
      customer_reference: order.order_number || order.merchant_payment_id || order.id,
      service_level_code: order.service_level_code || 'ECO', // adjust if you use specific codes
      collection_address: warehouse,
      collection_contact,
      parcels,
      mute_notifications: false
    };

    if (isLocker) {
      // DELIVERY to pickup point (Shiplogic requires *no* delivery_address and a provider)
      basePayload.delivery_pickup_point_id = order.delivery_pickup_point_id; // e.g. "CG341" or "K120"
      basePayload.delivery_pickup_point_provider = 'tcg-locker';            // required for TCG lockers/kiosks
      basePayload.delivery_contact = delivery_contact; // mobile/email required on contact
    } else {
      // DOOR delivery (normal address)
      basePayload.delivery_address = {
        street_address: order.address1,
        local_area: order.suburb,
        city: order.city,
        zone: order.province,
        country: 'ZA',
        code: order.postal_code,
        lat: order.lat || undefined,
        lng: order.lng || undefined,
        type: 'residential'
      };
      basePayload.delivery_contact = delivery_contact;
    }

    // 2) Create shipment
    const createRes = await fetch(`${API}/shipments`, {
      method: 'POST',
      headers: { ...auth(), 'Content-Type': 'application/json' },
      body: JSON.stringify(basePayload)
    });
    const created = await createRes.json();

    if (!createRes.ok) {
      // persist failure on order for visibility
      await fetch(`${supaUrl}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: { ...h, 'Content-Type':'application/json' },
        body: JSON.stringify({ shipping_status: 'creation_failed', shipping_error: JSON.stringify(created).slice(0, 1000) })
      });
      return { statusCode: 502, body: JSON.stringify(created) };
    }

    // Pull IDs/refs for tracking + label
    const shipmentId = created?.id || created?.shipment?.id;
    const trackingRef = created?.tracking_reference || created?.shipment?.tracking_reference;
    const status = created?.status || created?.shipment?.status || 'submitted';

    // 3) Get label URL (signed PDF)
    let label_url: string|undefined;
    if (shipmentId) {
      const labelRes = await fetch(`${API}/shipments/label?id=${encodeURIComponent(String(shipmentId))}`, {
        headers: auth()
      });
      const labelJson = await labelRes.json().catch(()=>null);
      label_url = labelJson?.url || labelJson?.signed_url || labelJson?.pdf_url;
    }

    // 4) Update order in Supabase
    await fetch(`${supaUrl}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: { ...h, 'Content-Type':'application/json' },
      body: JSON.stringify({
        shipping_status: status,
        tracking_reference: trackingRef,
        shipment_id: shipmentId,
        label_url
      })
    });

    return { statusCode: 200, body: JSON.stringify({ shipmentId, trackingRef, status, label_url }) };

  } catch (e:any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};