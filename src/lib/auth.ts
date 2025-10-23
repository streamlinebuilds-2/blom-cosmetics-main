import { supabase } from './supabase'

export async function signUp(email: string, password: string, name?: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  })
  if (error) throw error
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

// Legacy compatibility - create a simple authService object
export const authService = {
  getState: () => ({ user: null, loading: false, error: null }),
  subscribe: () => () => {},
  signInWithEmail: async (email: string, password: string) => {
    try {
      await signIn(email, password)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },
  signUpWithEmail: async (email: string, password: string) => {
    try {
      await signUp(email, password)
      return { success: true, needsVerification: false }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },
  signOut: async () => {
    try {
      await signOut()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },
  resetPassword: async (email: string) => {
    try {
      await resetPassword(email)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },
  requireAuth: () => false,
  formatMemberSince: (dateString: string) => 'Unknown'
}

export interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}