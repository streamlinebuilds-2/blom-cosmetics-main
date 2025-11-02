import { supabase } from './supabase';

export interface Order {
  id: string;
  m_payment_id: string | null;
  order_number: string | null;
  order_display?: string | null;
  status: string;
  total_cents: number | null;
  total: number | null;
  currency: string;
  created_at: string;
  invoice_url: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
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

  // Query orders_account_v1 view if it exists, otherwise fallback to orders table
  let q = supabase
    .from('orders_account_v1')
    .select('id, m_payment_id, order_number, order_display, status, total, currency, created_at, invoice_url, buyer_name, buyer_email')
    .order('created_at', { ascending: false });

  // Apply filter: user_id if logged in, otherwise buyer_email
  if (user?.id) {
    q = q.eq('user_id', user.id);
  } else if (email) {
    q = q.eq('buyer_email', email);
  }

  const { data, error } = await q;

  // If orders_account_v1 doesn't exist, fallback to orders table
  if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
    // Table/view doesn't exist, use orders table directly
    let fallbackQuery = supabase
      .from('orders')
      .select('id, m_payment_id, order_number, status, total, currency, created_at, invoice_url, buyer_name, buyer_email')
      .order('created_at', { ascending: false });

    if (user?.id) {
      fallbackQuery = fallbackQuery.eq('user_id', user.id);
    } else if (email) {
      fallbackQuery = fallbackQuery.eq('buyer_email', email);
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError) {
      console.error('Error fetching orders:', fallbackError);
      throw fallbackError;
    }

    return (fallbackData ?? []) as Order[];
  }

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return (data ?? []) as Order[];
}
