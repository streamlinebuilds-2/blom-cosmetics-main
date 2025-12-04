import { supabase } from './supabase';

export interface Order {
  id: string;
  m_payment_id: string | null;
  order_number: string | null;
  order_display?: string | null;
  status: string;
  shipping_status: string | null;
  order_packed_at: string | null;
  total_cents: number | null;
  total: number | null;
  currency: string;
  created_at: string;
  invoice_url: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  // Financial fields
  subtotal_cents?: number;
  shipping_cents?: number;
  discount_cents?: number;
}

/**
 * Fetches all orders for the current authenticated user
 * Works for both logged-in user orders (by user_id) and guest orders (by buyer_email)
 */
export async function fetchMyOrders(): Promise<Order[]> {
  // Get current user
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  const email = user?.email ?? null;

  if (!user && !email) {
    return [];
  }

  // 1. Define Safe Fields (Columns guaranteed to exist on the 'orders' table)
  // removed 'order_display' from this list to prevent the 400 error
  const safeFields = 'id, m_payment_id, order_number, status, shipping_status, order_packed_at, total, total_cents, subtotal_cents, shipping_cents, discount_cents, currency, created_at, invoice_url, buyer_name, buyer_email';

  // 2. Try querying the VIEW first (It might have extra fields like order_display)
  let q = supabase
    .from('orders_account_v1')
    .select(`${safeFields}, order_display`) // Request order_display ONLY from the view
    .order('created_at', { ascending: false });

  if (user?.id) {
    q = q.eq('user_id', user.id);
  } else if (email) {
    q = q.eq('buyer_email', email);
  }

  const { data, error } = await q;

  // 3. ROBUST FALLBACK: If the view fails (missing view OR missing column), use the table
  if (error) {
    console.warn('View query failed (likely missing column or view), falling back to orders table:', error.message);

    let fallbackQuery = supabase
      .from('orders')
      .select(safeFields) // Use ONLY safe fields (no order_display)
      .order('created_at', { ascending: false });

    if (user?.id) {
      fallbackQuery = fallbackQuery.eq('user_id', user.id);
    } else if (email) {
      fallbackQuery = fallbackQuery.eq('buyer_email', email);
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError) {
      console.error('Error fetching orders from fallback:', fallbackError);
      throw fallbackError;
    }

    return (fallbackData ?? []) as Order[];
  }

  return (data ?? []) as Order[];
}
