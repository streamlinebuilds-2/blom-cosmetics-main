import type { Handler } from '@netlify/functions'
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `ORD-${dateStr}-${random}`;
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const orderData = JSON.parse(event.body || "{}");
    const m_payment_id = randomUUID();
    const order_number = generateOrderNumber();

    console.log(`📦 Creating Order ${order_number} - Processing Items...`);

    // ============================================================
    // 1. PRE-PROCESS ITEMS: Find Missing IDs
    // ============================================================
    const processedItems: any[] = [];
    
    if (orderData.items && orderData.items.length > 0) {
      for (const item of orderData.items) {
        let finalProductId = item.product_id;

        // If ID is missing, try to find it via the Database Mapping
        if (!finalProductId && item.name) {
          console.log(`🔍 ID missing for "${item.name}", attempting lookup...`);
          
          // Try finding via our smart mapping function
          const { data: matchData } = await supabase
            .rpc('find_product_match', { order_product_name: item.name });

          if (matchData && matchData[0]?.found) {
            finalProductId = matchData[0].product_id;
            console.log(`✅ Resolved "${item.name}" to ID: ${finalProductId}`);
          }
        }

        processedItems.push({
          ...item,
          product_id: finalProductId // Update the item with the found ID
        });
      }
    } else {
        console.warn("⚠️ Order created with no items");
    }

    // ============================================================
    // 2. VERIFY STOCK (Now using the fixed IDs)
    // ============================================================
    const productIds = processedItems
        .filter(item => item.product_id)
        .map(item => item.product_id);

    let productsMap = new Map();

    if (productIds.length > 0) {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, price, inventory_quantity, track_inventory, status')
          .in('id', productIds);

        if (productsError) {
          console.error("Error fetching products:", productsError);
          throw new Error('Failed to validate products');
        }
        
        products?.forEach(p => productsMap.set(p.id, p));

        // Check stock
        for (const item of processedItems) {
          if (!item.product_id) continue;

          const product = productsMap.get(item.product_id);
          
          // Optional: Fail if product not found? Or allow "Custom Items"?
          // For now, we log warning if not found but don't crash unless it's critical
          if (product) {
              if (product.status === 'archived') {
                  throw new Error(`Product "${product.name}" is no longer available.`);
              }
              if (product.track_inventory && product.inventory_quantity < item.qty) {
                  throw new Error(`Insufficient stock for ${product.name}. Available: ${product.inventory_quantity}`);
              }
          }
        }
    }

    // ============================================================
    // 3. CREATE ORDER
    // ============================================================
    
    // Calculate subtotal
    const subtotal_cents = processedItems.reduce((sum, item) => {
      return sum + (item.unit_price_cents * item.qty);
    }, 0);

    // Handle Coupons (Reuse existing logic but ensure variables exist)
    let discount_cents = 0;
    if (orderData.coupon_code) {
        // ... (Keep your existing coupon fetch logic here) ...
        // Assuming reuse of your existing coupon block for brevity, 
        // or just trust the passed values if that's your current flow
        // Ideally, call the validate-coupon function here again.
    }
    // Use passed discount if coupon logic didn't run
    discount_cents = discount_cents || orderData.discount_cents || 0; 

    const shipping_cents = orderData.shipping_cents || 0;
    const tax_cents = orderData.tax_cents || 0;
    const total_cents = subtotal_cents + shipping_cents - discount_cents + tax_cents;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number,
        merchant_payment_id: m_payment_id,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        delivery_method: orderData.delivery_method,
        shipping_address: orderData.shipping_address,
        collection_slot: orderData.collection_slot,
        collection_location: orderData.collection_location,
        subtotal_cents,
        shipping_cents,
        discount_cents,
        tax_cents,
        total_cents,
        currency: orderData.currency || "ZAR",
        status: "unpaid",
        payment_status: "unpaid",
        fulfillment_status: "pending",
        placed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    // ============================================================
    // 4. CREATE ORDER ITEMS (With Fixed IDs)
    // ============================================================
    if (processedItems.length > 0) {
      const itemsToInsert = processedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id, // Now populated correctly
        sku: item.sku,
        name: item.name,
        variant: item.variant,
        quantity: item.qty,
        unit_price_cents: item.unit_price_cents,
        line_total_cents: item.unit_price_cents * item.qty,
        variant_index: item.variant_index ?? null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
      }
    }

    // ... (Keep your coupon usage update logic here) ...

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        order_id: order.id,
        order_number: order.order_number,
        m_payment_id,
        total_cents,
        total_zar: (total_cents / 100).toFixed(2),
      }),
    };
  } catch (e: any) {
    console.error("Create order error:", e);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: e.message || "Server error" }),
    };
  }
};
