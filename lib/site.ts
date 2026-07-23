// lib/site.ts
//
// Single-site data access. Replaces the old host-based tenant resolver: there
// is no Host header lookup and no tenant_id, because this database serves
// exactly one business.
//
// getSite() is the root of everything — SEO metadata, schema.org identity,
// navigation, and theme all derive from the row it returns.

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { defaultTheme } from '@/lib/theme'
import type {
  SiteSettings,
  SiteTheme,
  SiteNavConfig,
  SiteFooterConfig,
  Page,
  Section,
  Category,
  Post,
  TeamMember,
  Integrations,
} from '@/lib/types/database'

export type {
  SiteSettings,
  SiteTheme,
  SiteNavConfig,
  SiteFooterConfig,
  Page,
  Section,
  Category,
  Post,
  TeamMember,
  Integrations,
}

/**
 * Fill in defaults for the jsonb columns so callers never have to null-check
 * them. Theme merges over defaults, so a partial theme still renders.
 */
function normalizeSite(raw: Record<string, unknown>): SiteSettings {
  return {
    ...(raw as unknown as SiteSettings),
    theme: { ...defaultTheme, ...((raw.theme as SiteTheme) ?? {}) },
    nav: (raw.nav as SiteNavConfig) ?? { links: [] },
    footer: (raw.footer as SiteFooterConfig) ?? {},
    social_links: (raw.social_links as Record<string, string>) ?? {},
    alt_domains: (raw.alt_domains as string[]) ?? [],
  }
}

/**
 * The single site_settings row, cached per request.
 *
 * Returns null rather than throwing so a misconfigured environment produces a
 * 404 instead of a crashed render. Callers should notFound() on null.
 */
export const getSite = cache(async (): Promise<SiteSettings | null> => {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', true)
      .single()

    if (error || !data) return null

    return normalizeSite(data)
  } catch {
    return null
  }
})

/**
 * Canonical origin, e.g. "https://example.com".
 * Every URL the site emits — canonical tags, og:url, sitemap entries,
 * schema.org @id values — must be built from this and nothing else.
 */
export function siteOrigin(site: SiteSettings): string {
  return `https://${site.domain}`
}

/** Absolute URL for a page path. Accepts '/' or 'about' or '/about'. */
export function siteUrl(site: SiteSettings, path = '/'): string {
  const origin = siteOrigin(site)
  if (!path || path === '/') return origin
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${origin}${clean}`
}

// ── Pages ────────────────────────────────────────────────────────────────────

export async function getPage(slug: string): Promise<Page | null> {
  const supabase = await createClient()

  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !page) return null

  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', page.id)
    .order('sort_order', { ascending: true })

  return { ...page, sections: (sections ?? []) as Section[] } as Page
}

/** All published pages, for navigation fallbacks and the sitemap. */
export async function getPages(): Promise<Page[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (error) return []
  return data as Page[]
}

// ── Team ─────────────────────────────────────────────────────────────────────

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (error) return []
  return data as TeamMember[]
}

// ── Integrations ─────────────────────────────────────────────────────────────

export async function getIntegrations(): Promise<Integrations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', true)
    .single()

  if (error || !data) return null
  return data as Integrations
}

// ── Leads ────────────────────────────────────────────────────────────────────

export async function submitLead(lead: {
  source?: string
  full_name?: string
  email?: string
  phone?: string
  subject_type?: string
  message?: string
  meta?: Record<string, unknown>
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .insert({ status: 'new', ...lead })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
