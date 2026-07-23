// lib/askable-category-map.ts
//
// Category resolution for the Askable publish webhook.
//
// Single-site model: no tenant scoping. Categories live in one table and slugs
// are globally unique across posts and categories (enforced by a trigger in
// 0001_init_site_schema.sql), because both resolve under /resources/<slug>.
//
// Two category types:
//   'topic'    — the default. Auto-created when the studio sends a category
//                name we do not have yet, so a publish never blocks.
//   'location' — only used when the studio sends a city. A business with no
//                geographic content simply never creates one.
//
// The Supabase client is created per call rather than at module scope. At
// module scope it runs during `next build`, which fails when the service role
// key is not present in the build environment.

import { createClient } from '@supabase/supabase-js'

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      '[askable] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.',
    )
  }

  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Normalize any name into a stable slug.
 *
 * Punctuation is stripped before hyphenation so variants converge — "St.
 * Petersburg" and "St Petersburg" both become "st-petersburg", and "Email &
 * Conversion" becomes "email-conversion".
 */
export function toSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Title-case a name for display when auto-creating a category. */
function displayName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

/**
 * Does this slug already belong to a category?
 *
 * Used by the webhook to reject a post whose slug would shadow a category
 * page. The database enforces this too, but checking here produces a clean
 * 400 with a useful hint instead of a raw constraint error.
 */
export async function isCategorySlug(slug: string): Promise<boolean> {
  const { data } = await admin()
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  return !!data
}

/**
 * Resolve category_id for an incoming article.
 *
 * Priority:
 *   1. A city, if provided, matched against existing 'location' categories.
 *      Auto-created when absent.
 *   2. A topic name, matched against existing 'topic' categories.
 *      Auto-created when absent.
 *   3. Null — the post publishes and appears under the "All" listing only.
 *
 * Never throws on a missing category. A publish should not fail because
 * taxonomy is incomplete.
 */
export async function resolveCategoryId(
  cityName?: string | null,
  topicName?: string | null,
): Promise<string | null> {
  const db = admin()

  if (cityName?.trim()) {
    const id = await findOrCreate(db, cityName, 'location')
    if (id) return id
  }

  if (topicName?.trim()) {
    const id = await findOrCreate(db, topicName, 'topic')
    if (id) return id
  }

  return null
}

type Db = ReturnType<typeof admin>

async function findOrCreate(
  db: Db,
  rawName: string,
  type: 'location' | 'topic',
): Promise<string | null> {
  const slug = toSlug(rawName)
  if (!slug) return null

  const { data: existing } = await db
    .from('categories')
    .select('id, type')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    // A slug already used by the other type is still a valid match — better to
    // file the post under it than to create a duplicate or fail the publish.
    return existing.id as string
  }

  const name = displayName(rawName)

  const { data: created, error } = await db
    .from('categories')
    .insert({ name, slug, type })
    .select('id')
    .single()

  if (!error && created) return created.id as string

  // Lost a race with a concurrent publish, or the slug collides with a post.
  // Re-read; if it is a post collision the caller's isCategorySlug guard will
  // have caught it already.
  const { data: reread } = await db
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  return reread ? (reread.id as string) : null
}
