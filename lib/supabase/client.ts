import { createBrowserClient } from '@supabase/ssr'

// Supabase project URL - can also be set via NEXT_PUBLIC_SUPABASE_URL env var
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://toivhpeabwwqilbzbrfb.supabase.co'

export function createClient() {
  // Support both standard and non-standard env var names
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY
  
  if (!key) {
    throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_SUPABASE_ANON_KEY must be set.')
  }
  
  return createBrowserClient(SUPABASE_URL, key)
}
