// app/api/leads/route.ts
//
// Public lead capture. The insert policy on `leads` allows anonymous writes so
// the site form works without auth; every other operation on that table is
// admin-only. Nothing here reads back what it wrote.
//
// No tenant_id — this database serves one business.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const MAX_LENGTHS: Record<string, number> = {
  source: 120,
  full_name: 200,
  email: 320,
  phone: 40,
  subject_type: 120,
  message: 5000,
}

function clean(value: unknown, field: string): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, MAX_LENGTHS[field] ?? 500)
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot. Bots fill every field they find; a real browser leaves a
  // visually hidden input empty. Return 200 so the bot believes it worked.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ success: true })
  }

  const email = clean(body.email, 'email')
  const phone = clean(body.phone, 'phone')
  const fullName = clean(body.full_name, 'full_name')

  if (!fullName) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  if (!email && !phone) {
    return NextResponse.json(
      { error: 'An email address or phone number is required' },
      { status: 400 },
    )
  }

  if (email && !looksLikeEmail(email)) {
    return NextResponse.json(
      { error: 'That email address does not look valid' },
      { status: 400 },
    )
  }

  const lead = {
    status: 'new',
    source: clean(body.source, 'source'),
    full_name: fullName,
    email,
    phone,
    subject_type: clean(body.subject_type, 'subject_type'),
    message: clean(body.message, 'message'),
    meta: {
      user_agent: request.headers.get('user-agent') ?? undefined,
      referer: request.headers.get('referer') ?? undefined,
      submitted_at: new Date().toISOString(),
    },
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('leads').insert(lead)

    if (error) {
      // Log server-side; never leak database detail to the client.
      console.error('[api/leads] Insert failed:', error.message)
      return NextResponse.json(
        { error: 'Could not save your message. Please try again.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/leads] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Could not save your message. Please try again.' },
      { status: 500 },
    )
  }
}
