// app/api/askable-webhook/route.ts
//
// Receives article publish events from Askable Content Studio and writes them
// into the posts table.
//
// Single-site model: no tenant_id. The canonical URL is built from
// site_settings.domain rather than a hardcoded constant — this is the
// publish-time guard against the platform-leak bug, where studio-generated
// content carries the studio's own origin in its canonical and URL nodes.
//
// The Supabase admin client is created per request, not at module scope.
// Module scope runs during `next build`, which fails when the service role key
// is absent from the build environment.
//
// Requests are HMAC-SHA256 signed via x-askable-signature.
//
// Required environment variables:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   — server-side only, never NEXT_PUBLIC_
//   ASKABLE_WEBHOOK_SECRET
// Optional:
//   ASKABLE_MIRROR_IMAGES       — 'false' to skip mirroring
//   ASKABLE_STORAGE_BUCKET      — defaults to 'media'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { resolveCategoryId, isCategorySlug } from '@/lib/askable-category-map'

export const runtime = 'nodejs'

const MIRROR_IMAGES = process.env.ASKABLE_MIRROR_IMAGES !== 'false'
const BUCKET_NAME = process.env.ASKABLE_STORAGE_BUCKET ?? 'media'

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      '[askable-webhook] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.',
    )
  }

  return createClient(url, key, { auth: { persistSession: false } })
}

type Db = ReturnType<typeof admin>

// ─── Types ───────────────────────────────────────────────────────────────────

interface AskableWebhookPayload {
  event?: string
  article_id: string

  slug: string
  title: string
  h1?: string
  content_html?: string
  content?: string
  excerpt?: string

  meta_title?: string
  meta_description?: string
  canonical_url?: string
  target_keyword?: string
  focus_keyword?: string
  secondary_keywords?: string[]
  schema_markup?: string | object
  schema_json?: string | object
  tags?: string[]

  city?: string
  state?: string
  city_slug?: string
  city_name?: string
  location_data?: { city?: string; state?: string; country?: string }

  category?: string

  status?: 'draft' | 'published' | 'pending'
  published_at?: string | null
  author?: string
  word_count?: number
  estimated_read_time?: number

  // Industry-flex field. Its MEANING is relabelled per client in the studio
  // skill; the column shape never changes.
  loan_type?: string
  target_loan_type?: string
  target_audience?: string

  featured_image_url?: string
  featured_image_alt?: string
  og_image_url?: string
}

// ─── HMAC verification ───────────────────────────────────────────────────────

function verifyAskableSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.ASKABLE_WEBHOOK_SECRET
  if (!secret || !signature) return false

  const provided = signature.startsWith('sha256=') ? signature.slice(7) : signature
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(provided, 'hex'),
      Buffer.from(expected, 'hex'),
    )
  } catch {
    return false
  }
}

// ─── Content transformation ──────────────────────────────────────────────────

/** Strip inline styles — the site owns typography through theme tokens. */
function stripInlineStyles(html: string): string {
  return html.replace(/\s*style="[^"]*"/gi, '').replace(/\s*style='[^']*'/gi, '')
}

/** Remove Askable-branded CTAs so client content carries no studio marketing. */
function stripAskableCTAs(html: string): string {
  let cleaned = html.replace(
    /<a[^>]*href="[^"]*askable\.dev[^"]*"[^>]*>.*?<\/a>/gi,
    '',
  )

  const patterns = [
    /askable\.dev/i,
    /askable\s+score/i,
    /get\s+your\s+free\s+score/i,
    /free\s+askable/i,
    /ready\s+to\s+see\s+how\s+ai\s+platforms\s+view/i,
  ]

  const dropIfMatched = (match: string) =>
    patterns.some((p) => p.test(match)) ? '' : match

  cleaned = cleaned.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, dropIfMatched)
  cleaned = cleaned.replace(/<div[^>]*>[\s\S]*?<\/div>/gi, dropIfMatched)

  return cleaned.replace(/\n{3,}/g, '\n\n').trim()
}

function transformContent(html: string): string {
  return stripAskableCTAs(stripInlineStyles(html))
}

// ─── Image mirroring ─────────────────────────────────────────────────────────

async function mirrorImage(
  db: Db,
  sourceUrl: string,
  slug: string,
): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl, { redirect: 'follow' })
    if (!res.ok) {
      console.warn(`[askable-webhook] Image fetch failed ${res.status}: ${sourceUrl}`)
      return null
    }

    const contentType = res.headers.get('content-type') ?? 'image/png'
    const ext = contentType.includes('jpeg')
      ? 'jpg'
      : (contentType.split('/')[1] ?? 'png')
    const buffer = Buffer.from(await res.arrayBuffer())
    const fileName = `askable/${slug}-${Date.now()}.${ext}`

    const { error } = await db.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
        cacheControl: '31536000',
      })

    if (error) {
      console.error('[askable-webhook] Image upload failed:', error)
      return null
    }

    const { data } = db.storage.from(BUCKET_NAME).getPublicUrl(fileName)
    return data.publicUrl
  } catch (err) {
    console.error('[askable-webhook] Image mirror error:', err)
    return null
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function firstDefined<T>(...vals: (T | undefined | null)[]): T | undefined {
  for (const v of vals) if (v !== undefined && v !== null) return v
  return undefined
}

function schemaToJsonb(input: unknown): object | null {
  if (!input) return null
  if (typeof input === 'object') return input as object
  if (typeof input === 'string') {
    try {
      return JSON.parse(input)
    } catch {
      return null
    }
  }
  return null
}

function estimateReadingTime(wordCount?: number): number {
  if (!wordCount || wordCount <= 0) return 5
  return Math.max(1, Math.ceil(wordCount / 200))
}

/**
 * Read the site's canonical identity.
 *
 * Every URL written into posts derives from this — never from a constant and
 * never from the studio payload. A canonical pointing at the studio's origin
 * consolidates ranking onto the wrong domain while looking fine in a browser.
 */
async function getSiteIdentity(
  db: Db,
): Promise<{ origin: string; name: string } | null> {
  const { data } = await db
    .from('site_settings')
    .select('name, domain')
    .eq('id', true)
    .maybeSingle()

  if (!data?.domain) return null

  return { origin: `https://${data.domain}`, name: data.name }
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  const rawBody = await req.text()
  const signature =
    req.headers.get('x-askable-signature') ?? req.headers.get('x-signature')

  if (!verifyAskableSignature(rawBody, signature)) {
    console.warn('[askable-webhook] Invalid or missing HMAC signature')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: AskableWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!payload.article_id || !payload.slug || !payload.title) {
    return NextResponse.json(
      { error: 'Missing required fields: article_id, slug, title' },
      { status: 400 },
    )
  }

  let db: Db
  try {
    db = admin()
  } catch (err) {
    console.error('[askable-webhook] Configuration error:', err)
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  const site = await getSiteIdentity(db)
  if (!site) {
    return NextResponse.json(
      { error: 'site_settings row missing or has no domain' },
      { status: 500 },
    )
  }

  // A post slug must never shadow a category page — both resolve under
  // /resources/<slug>.
  if (await isCategorySlug(payload.slug)) {
    return NextResponse.json(
      {
        error: 'Slug conflicts with an existing category slug',
        slug: payload.slug,
        hint: 'Post slugs cannot match a location or topic category slug',
      },
      { status: 400 },
    )
  }

  try {
    const { data: existing } = await db
      .from('posts')
      .select('id, slug')
      .eq('askable_article_id', payload.article_id)
      .maybeSingle()

    const rawHtml = firstDefined(payload.content_html, payload.content) ?? ''
    const contentHtml = transformContent(rawHtml)
    const focusKeyword =
      firstDefined(payload.target_keyword, payload.focus_keyword) ?? null
    const schemaJson = schemaToJsonb(
      firstDefined(payload.schema_markup, payload.schema_json),
    )
    const cityName = firstDefined(
      payload.city_name,
      payload.city,
      payload.location_data?.city,
    )
    const state = firstDefined(payload.state, payload.location_data?.state) ?? null

    const categoryId = await resolveCategoryId(cityName, payload.category)

    let imageUrl = payload.featured_image_url ?? null
    if (imageUrl && MIRROR_IMAGES && !imageUrl.startsWith(site.origin)) {
      const mirrored = await mirrorImage(db, imageUrl, payload.slug)
      if (mirrored) imageUrl = mirrored
    }

    const postRow = {
      askable_article_id: payload.article_id,
      slug: payload.slug,
      title: payload.title,
      h1: payload.h1 ?? payload.title,
      content: contentHtml,
      excerpt: payload.excerpt ?? null,
      featured_image_url: imageUrl,
      featured_image_alt: payload.featured_image_alt ?? null,
      meta_title: payload.meta_title ?? null,
      meta_description: payload.meta_description ?? null,
      // Always the site's own domain, never the studio origin.
      canonical_url: `${site.origin}/resources/${payload.slug}`,
      focus_keyword: focusKeyword,
      secondary_keywords: payload.secondary_keywords ?? [],
      category_id: categoryId,
      tags: payload.tags ?? [],
      target_city: cityName ?? null,
      target_county: null,
      target_loan_type:
        firstDefined(payload.target_loan_type, payload.loan_type) ?? null,
      target_audience: payload.target_audience ?? null,
      state,
      author: payload.author ?? site.name,
      status: payload.status === 'published' ? 'published' : 'draft',
      published_at:
        payload.status === 'published'
          ? (payload.published_at ?? new Date().toISOString())
          : null,
      word_count: payload.word_count ?? null,
      reading_time_minutes:
        payload.estimated_read_time ?? estimateReadingTime(payload.word_count),
      schema_json: schemaJson,
    }

    let resultId: string
    let action: 'created' | 'updated'

    if (existing) {
      const { data, error } = await db
        .from('posts')
        .update({ ...postRow, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('id, slug')
        .single()

      if (error) throw error
      resultId = data.id
      action = 'updated'
    } else {
      const { data: slugConflict } = await db
        .from('posts')
        .select('id')
        .eq('slug', payload.slug)
        .maybeSingle()

      if (slugConflict) {
        return NextResponse.json(
          {
            error: 'Slug already exists from a non-Askable source',
            slug: payload.slug,
            hint: 'Change the slug in Askable or remove the existing post',
          },
          { status: 409 },
        )
      }

      const { data, error } = await db
        .from('posts')
        .insert(postRow)
        .select('id, slug')
        .single()

      if (error) throw error
      resultId = data.id
      action = 'created'
    }

    // Bust the article and its listing surfaces so the change is live now.
    try {
      revalidatePath(`/resources/${payload.slug}`)
      revalidatePath('/resources')

      if (categoryId) {
        const { data: cat } = await db
          .from('categories')
          .select('slug')
          .eq('id', categoryId)
          .maybeSingle()
        if (cat?.slug) revalidatePath(`/resources/${cat.slug}`)
      }
    } catch (e) {
      console.warn('[askable-webhook] revalidatePath failed (non-fatal):', e)
    }

    return NextResponse.json({
      success: true,
      action,
      post_id: resultId,
      slug: payload.slug,
      url: `${site.origin}/resources/${payload.slug}`,
      category_id: categoryId,
      image_mirrored: imageUrl !== payload.featured_image_url,
      styles_stripped: true,
      askable_ctas_stripped: true,
      processing_ms: Date.now() - startTime,
    })
  } catch (err) {
    console.error('[askable-webhook] Processing error:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}

// ─── GET — health check ──────────────────────────────────────────────────────

export async function GET() {
  const hasSecret = !!process.env.ASKABLE_WEBHOOK_SECRET
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  let domain: string | null = null
  if (hasUrl && hasServiceKey) {
    try {
      const site = await getSiteIdentity(admin())
      domain = site?.origin ?? null
    } catch {
      domain = null
    }
  }

  return NextResponse.json({
    service: 'askable publish webhook',
    status: 'ok',
    ready: hasSecret && hasServiceKey && hasUrl && !!domain,
    config: {
      webhook_secret_configured: hasSecret,
      supabase_configured: hasServiceKey && hasUrl,
      site_origin: domain,
      storage_bucket: BUCKET_NAME,
      image_mirroring: MIRROR_IMAGES,
      category_model: 'auto-create, topic by default',
      inline_styles: 'stripped',
      askable_ctas: 'stripped',
    },
  })
}
