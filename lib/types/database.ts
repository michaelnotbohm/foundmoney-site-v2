// lib/types/database.ts
//
// Single-site model. There is no tenant_id anywhere — this database serves
// exactly one business. Shapes are synced to supabase/migrations/0001_init_site_schema.sql.

export type PublishStatus = 'draft' | 'published' | 'archived'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'lost'
export type AdminRole = 'owner' | 'admin' | 'editor'
export type CategoryType = 'topic' | 'location'

// ── Theme ────────────────────────────────────────────────────────────────────
//
// Flat token shape. Each key maps to a CSS custom property emitted by
// getThemeStyleObject() in lib/theme.ts. Blocks read the variables, never
// these values directly.

export interface SiteTheme {
  primary?: string
  primaryForeground?: string
  secondary?: string
  secondaryForeground?: string
  accent?: string
  accentForeground?: string
  background?: string
  surface?: string
  foreground?: string
  muted?: string
  mutedForeground?: string
  border?: string
  fontHeading?: string
  fontBody?: string
  radius?: string
  radiusButton?: string
}

// ── Navigation ───────────────────────────────────────────────────────────────

export interface NavLink {
  label: string
  href: string
  children?: NavLink[]
}

export interface NavCta {
  label: string
  href: string
}

export interface SiteNavConfig {
  links: NavLink[]
  cta?: NavCta
}

export interface FooterColumn {
  heading: string
  links: NavLink[]
}

export interface SiteFooterConfig {
  columns?: FooterColumn[]
  legal?: string
}

// ── Site settings ────────────────────────────────────────────────────────────
//
// Exactly one row, enforced by a singleton primary key in the schema.

export interface SiteSettings {
  id: boolean

  // Identity
  name: string
  legal_name: string | null
  tagline: string | null
  description: string | null

  // Domains
  domain: string
  alt_domains: string[]
  preview_domain: string | null

  // Brand
  logo_url: string | null
  logo_dark_url: string | null
  favicon_url: string | null

  // Contact
  email: string | null
  phone: string | null
  phone_tollfree: string | null
  fax: string | null

  // Address
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  latitude: number | null
  longitude: number | null

  // Credentials. license_label is the generic hook: a lender sets "NMLS",
  // a contractor sets "State License #", an advisory firm leaves both null.
  license_number: string | null
  license_label: string | null

  // Structured config
  social_links: Record<string, string>
  theme: SiteTheme
  nav: SiteNavConfig
  footer: SiteFooterConfig

  // Schema.org
  business_type: string
  founding_date: string | null

  noindex: boolean

  created_at: string
  updated_at: string
}

// ── Page ─────────────────────────────────────────────────────────────────────

export interface Page {
  id: string
  slug: string
  title: string
  meta_title: string | null
  meta_description: string | null
  // Override only. Normally null so lib/seo.ts computes it from the site domain.
  canonical_url: string | null
  og_image: string | null
  schema_json: Record<string, unknown> | null
  status: PublishStatus
  sort_order: number
  noindex: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  sections?: Section[]
}

// ── Section ──────────────────────────────────────────────────────────────────
//
// Known block types. The renderer accepts any string so a new block can be
// seeded before its type lands here, but keep this list current — it is the
// closest thing to documentation of the block library.

export type SectionType =
  | 'hero'
  | 'rich_text'
  | 'cta_band'
  | 'faq'
  | 'testimonial'
  | 'feature_grid'
  | 'process_timeline'
  | 'quick_facts'
  | 'two_column'
  | 'path_cards'
  | 'stat_strip'
  | 'team_grid'
  | 'calculator'
  | 'clarky_form'
  | 'blog_list'

export interface Section {
  id: string
  page_id: string
  type: SectionType | string
  variant: string
  content: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  type: CategoryType | null
  description: string | null
  created_at: string
}

// ── Post ─────────────────────────────────────────────────────────────────────
//
// Column shape MUST match the Askable content studio exactly. Do not simplify.
// The target_* fields are the industry-flex points: relabel their MEANING in
// the studio skill per client, never change the shape. Drifting this breaks
// publishing silently.

export interface Post {
  id: string
  title: string
  h1: string | null
  slug: string
  excerpt: string | null
  // Rendered HTML. This is the only body column — there is no content_html
  // and no body. Selecting a column that doesn't exist makes PostgREST 400
  // and the JS client return null, which surfaces as a mystery 404.
  content: string | null
  featured_image_url: string | null
  featured_image_alt: string | null
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  focus_keyword: string | null
  secondary_keywords: string[]
  schema_json: Record<string, unknown> | null
  category_id: string | null
  tags: string[]
  target_loan_type: string | null
  target_city: string | null
  target_audience: string | null
  target_county: string | null
  state: string | null
  region: string | null
  author: string | null
  status: PublishStatus
  published_at: string | null
  reading_time_minutes: number | null
  word_count: number | null
  askable_article_id: string | null
  created_at: string
  updated_at: string
  category?: Category | null
}

// ── TeamMember ───────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string
  name: string
  title: string | null
  license_no: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  photo_position: string | null
  bio: string | null
  // Used as sameAs in Person schema. Keep consistent with the live profile.
  linkedin_url: string | null
  sort_order: number
  status: PublishStatus
  created_at: string
  updated_at: string
}

// ── Lead ─────────────────────────────────────────────────────────────────────

export interface Lead {
  id: string
  source: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  subject_type: string | null
  message: string | null
  status: LeadStatus
  notes: string | null
  meta: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ── Media ────────────────────────────────────────────────────────────────────

export interface Media {
  id: string
  url: string
  alt: string | null
  width: number | null
  height: number | null
  folder: string | null
  created_at: string
}

// ── Integrations ─────────────────────────────────────────────────────────────

export interface Integrations {
  id: boolean
  ga4_id: string | null
  meta_pixel_id: string | null
  gtm_id: string | null
  clarity_id: string | null
  other: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ── AdminUser ────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  auth_user_id: string
  email: string | null
  full_name: string | null
  role: AdminRole
  created_at: string
}
