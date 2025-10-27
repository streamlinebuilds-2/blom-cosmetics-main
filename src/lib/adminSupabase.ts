import { createClient } from '@supabase/supabase-js'

// For Node.js scripts, use process.env; for browser, use import.meta.env
const supabaseUrl = typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL 
  ? process.env.VITE_SUPABASE_URL 
  : (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : '')

const supabaseKey = (typeof process !== 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY)
    ? process.env.VITE_SUPABASE_ANON_KEY
    : (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')

export const admin = createClient(supabaseUrl!, supabaseKey)

