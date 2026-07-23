import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Supabase project URL - can also be set via NEXT_PUBLIC_SUPABASE_URL env var
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://toivhpeabwwqilbzbrfb.supabase.co'

// Client for build-time / static generation (no cookies needed)
export function createStaticClient() {
  // Support both standard and non-standard env var names
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY

  if (!key) {
    throw new Error("Missing Supabase anon key environment variable")
  }

  return createSupabaseClient(SUPABASE_URL, key)
}
