// lib/supabase/server.ts
//
// Server-side Supabase client. Anon key only — RLS is the access control
// layer, and every policy in 0001_init_site_schema.sql assumes it is enforced.
//
// There is deliberately NO hardcoded project URL fallback. In a template that
// gets copied per client, a stale fallback means a misconfigured site silently
// reads another client's database. Missing env vars must fail loudly.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL is not set. Add it in Vercel project settings.',
    )
  }

  if (!key) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Add it in Vercel project settings.',
    )
  }

  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called from a Server Component. Safe to ignore when middleware
          // refreshes sessions.
        }
      },
    },
  })
}
