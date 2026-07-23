// components/blocks/types.ts
//
// Shared types for every block. Blocks receive the section's content jsonb,
// the variant string, the site row, and an embedded flag.
//
// Most blocks never touch `site` — they read theme CSS variables instead,
// which is what allows a block to look completely different per client with
// no code change. Reach for `site` only when a block needs actual business
// data (a phone number, the business name, a license number).

import type { SiteSettings, Section } from '@/lib/types/database'

export type { Section }

export interface BlockProps<T = Record<string, unknown>> {
  content: T
  site: SiteSettings
  variant?: string
  /**
   * Render without the outer <section> chrome — no section padding,
   * background, centred heading, or container — so a parent layout block
   * such as two_column can compose it inside a column.
   */
  embedded?: boolean
}

export type BlockComponent<T = Record<string, unknown>> = React.ComponentType<
  BlockProps<T>
>

export interface CtaLink {
  label: string
  href: string
}

// ── Hero ─────────────────────────────────────────────────────────────────────

export interface HeroContent {
  eyebrow?: string
  headline: string
  /** Rendered inline after the headline, italic and lighter. */
  headlineAccent?: string
  subhead?: string
  primaryCta?: CtaLink
  secondaryCta?: CtaLink
  proofItems?: string[]
  image?: string
  imageAlt?: string
  videoUrl?: string
  iframeUrl?: string
  poster?: string
  size?: 'full' | 'medium' | 'compact'
  /** Passthrough overrides for an animated background variant. */
  background?: Record<string, unknown>
}

// ── Path cards ───────────────────────────────────────────────────────────────

export interface PathCard {
  label: string
  description?: string
  href: string
  image?: string
}

export interface PathCardsContent {
  heading?: string
  cards: PathCard[]
  /** Link text on each card. Defaults to 'Learn more'. */
  ctaLabel?: string
}

// ── Stat strip ───────────────────────────────────────────────────────────────

export interface Stat {
  value: string
  suffix?: string
  label: string
  detail?: string
  image?: string
  imageAlt?: string
}

export interface StatStripContent {
  eyebrow?: string
  heading?: string
  intro?: string
  stats: Stat[]
}

// ── Rich text ────────────────────────────────────────────────────────────────

export interface RichTextContent {
  markdown: string
  align?: 'left' | 'center'
}

// ── Feature grid ─────────────────────────────────────────────────────────────

export interface FeatureItem {
  icon?: string
  title: string
  body: string
  href?: string
}

export interface FeatureGridContent {
  heading?: string
  subheading?: string
  intro?: string
  items: FeatureItem[]
}

// ── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  quote: string
  author: string
  /** Role, company, or location — whatever identifies the speaker. */
  attribution?: string
  rating?: number
  image?: string
}

export interface TestimonialsContent {
  heading?: string
  testimonials: Testimonial[]
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

export interface FaqItem {
  q: string
  a: string
}

export interface FaqGroup {
  heading: string
  intro?: string
  items: FaqItem[]
}

export interface FaqContent {
  eyebrow?: string
  heading?: string
  /** Flat list. Used by the default and accordion variants. */
  items?: FaqItem[]
  /** Themed groups. Used by the grouped variant. */
  groups?: FaqGroup[]
  /**
   * Emit FAQPage JSON-LD. Default true — the highest-leverage AEO structure
   * on most sites. Set false when the page already emits FAQPage from
   * page.schema_json, to avoid duplicate nodes.
   */
  emitSchema?: boolean
}

// ── Lead form ────────────────────────────────────────────────────────────────

export interface LeadFormContent {
  heading?: string
  subheading?: string
  sourceKey: string
  subjectTypes?: string[]
  showMessage?: boolean
  submitLabel?: string
  successHeading?: string
  successBody?: string
}

// ── CTA band ─────────────────────────────────────────────────────────────────

export interface CtaBandContent {
  headline: string
  subhead?: string
  cta: CtaLink
}

// ── Team grid ────────────────────────────────────────────────────────────────

export interface TeamGridContent {
  heading?: string
  subheading?: string
  /** CTA inside the member detail modal. */
  cta?: CtaLink
}

// ── Image ────────────────────────────────────────────────────────────────────

export interface ImageContent {
  src: string
  alt: string
  caption?: string
  aspect?: 'video' | 'square' | 'wide'
}

// ── Media + text ─────────────────────────────────────────────────────────────
//
// Copy and media split. Alternate imagePosition down a page to build rhythm —
// three of these stacked with alternating sides is how a single-authority
// layout becomes a multi-authority one.
//
// Distinct from two_column, which is a layout primitive composing two other
// blocks. This one owns its own content.

export interface MediaTextContent {
  eyebrow?: string
  heading?: string
  body?: string
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  /** Small tag row beneath the prose — useful for focus areas or specialties. */
  tags?: string[]
  cta?: CtaLink
  /** Fade and slide in on scroll. */
  reveal?: boolean
}

// ── Quick facts ──────────────────────────────────────────────────────────────

export interface QuickFact {
  label: string
  value: string
  detail?: string
}

export interface QuickFactsContent {
  heading?: string
  facts: QuickFact[]
}

// ── Process timeline ─────────────────────────────────────────────────────────

export interface ProcessStep {
  title: string
  body: string
}

export interface ProcessTimelineContent {
  heading?: string
  intro?: string
  steps: ProcessStep[]
}

// ── Tabbed panels ────────────────────────────────────────────────────────────
//
// Generic replacement for the lending-specific "Loan 101" block. Panel labels,
// count, and kinds all come from content, so the same component serves
// "Who it's for / Benefits / Eligibility" for a lender and
// "Discovery / Audit / Implementation" for an advisory firm.

export type PanelKind = 'prose' | 'grid' | 'checklist'

export interface TabbedPanel {
  label: string
  kind: PanelKind
  heading?: string
  /** kind: 'prose' */
  body?: string
  /** kind: 'grid' */
  items?: FeatureItem[]
  /** kind: 'checklist' */
  points?: string[]
}

export interface TabbedPanelsContent {
  heading?: string
  panels: TabbedPanel[]
}

// ── Two column (layout primitive) ────────────────────────────────────────────
//
// Renders two CHILD BLOCKS side by side, each resolved through the shared
// registry and rendered in embedded mode. This block owns the section padding,
// heading, container, and grid.
//
// Industry-agnostic: any two embeddable blocks compose — a calculator beside a
// form, a testimonial beside an image, an FAQ beside a media_text.

export interface ChildBlock {
  type: string
  variant?: string
  content: Record<string, unknown>
}

export interface TwoColumnContent {
  heading?: string
  subheading?: string
  left: ChildBlock
  right: ChildBlock
  /** Desktop column ratio. Defaults to '1:1'. */
  ratio?: '1:1' | '5:7' | '7:5' | '4:6' | '6:4'
  /** Vertical alignment. Defaults to 'stretch'. */
  align?: 'start' | 'center' | 'stretch'
}
