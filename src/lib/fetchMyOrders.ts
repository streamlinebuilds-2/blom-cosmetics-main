import { supabase } from './supabase';

export interface Order {
  id: string;
  merchant_payment_id: string | null;
  status: string;
  total_cents: number | null;
  total: number | null;
  currency: string;
  created_at: string;
}

/**
 * Fetches all orders for the current authenticated user
 * Works for both logged-in user orders (by user_id) and guest orders (by customer_email)
 */
export async function fetchMyOrders(): Promise<Order[]> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  
  if (userErr) {
    console.error('Error getting user:', userErr);
    throw userErr;
  }
  
  if (!user) {
    return []; // No user logged in, return empty array
  }

  const userId = user.id;
  const email = (user.email ?? '').toLowerCase();

  if (!email) {
    console.warn('User has no email, cannot fetch orders');
    return [];
  }

  // Either match by user_id OR by email (guest orders)
  const { data, error } = await supabase
    .from('orders')
    .select('id, merchant_payment_id, status, total_cents, total, currency, created_at')
    .or(`user_id.eq.${userId},customer_email.eq.${email}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return (data ?? []) as Order[];
}
