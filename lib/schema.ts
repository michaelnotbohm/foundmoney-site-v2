// lib/schema.ts
//
// JSON-LD builders. Every node's identity comes from the site_settings row,
// so AI answer engines attribute content to the client business rather than
// to whatever built the site.
//
// @id values are stable URIs built from the site domain. Keeping them
// consistent across pages is what lets a crawler understand that the
// Organization on the homepage and the publisher of an article are the same
// entity.

import type {
  SiteSettings,
  Post,
  TeamMember,
  Category,
} from '@/lib/types/database'
import { siteOrigin, siteUrl } from '@/lib/site'

type Json = Record<string, unknown>

/** Strip undefined/null/empty so the emitted JSON stays clean. */
function compact<T extends Json>(obj: T): T {
  const out: Json = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    if (typeof v === 'string' && v.trim() === '') continue
    if (Array.isArray(v) && v.length === 0) continue
    out[k] = v
  }
  return out as T
}

/** Stable @id for the business entity. Referenced by every other node. */
export function organizationId(site: SiteSettings): string {
  return `${siteOrigin(site)}/#organization`
}

function postalAddress(site: SiteSettings): Json | undefined {
  if (!site.address_line1 && !site.city) return undefined

  return compact({
    '@type': 'PostalAddress',
    streetAddress:
      [site.address_line1, site.address_line2].filter(Boolean).join(' ') || undefined,
    addressLocality: site.city || undefined,
    addressRegion: site.state || undefined,
    postalCode: site.postal_code || undefined,
    addressCountry: site.country || 'US',
  })
}

function geoCoordinates(site: SiteSettings): Json | undefined {
  if (site.latitude == null || site.longitude == null) return undefined
  return {
    '@type': 'GeoCoordinates',
    latitude: site.latitude,
    longitude: site.longitude,
  }
}

/**
 * Organization or LocalBusiness, driven by site.business_type.
 *
 * Use LocalBusiness (or a subtype like FinancialService, HomeAndConstructionBusiness)
 * only when the business has a real physical address serving local customers.
 * A distributed advisory firm should stay Organization — claiming
 * LocalBusiness without an address produces invalid markup.
 */
export function organizationSchema(site: SiteSettings): Json {
  const origin = siteOrigin(site)
  const address = postalAddress(site)
  const isLocal = site.business_type !== 'Organization'

  return compact({
    '@context': 'https://schema.org',
    '@type': site.business_type || 'Organization',
    '@id': organizationId(site),
    name: site.name,
    legalName: site.legal_name || undefined,
    description: site.description || undefined,
    url: origin,
    logo: site.logo_url || undefined,
    image: site.logo_url || undefined,
    email: site.email || undefined,
    telephone: site.phone || undefined,
    faxNumber: site.fax || undefined,
    foundingDate: site.founding_date || undefined,
    address,
    geo: isLocal ? geoCoordinates(site) : undefined,
    sameAs: Object.values(site.social_links || {}).filter(Boolean),
    // license_label keeps this generic across industries: "NMLS", "State
    // License #", or absent entirely.
    identifier:
      site.license_number && site.license_label
        ? { '@type': 'PropertyValue', name: site.license_label, value: site.license_number }
        : undefined,
  })
}

/** WebSite node. Enables sitelinks search box eligibility. */
export function websiteSchema(site: SiteSettings): Json {
  const origin = siteOrigin(site)

  return compact({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name: site.name,
    url: origin,
    description: site.description || undefined,
    publisher: { '@id': organizationId(site) },
  })
}

/** Person node for a team member. sameAs anchors entity resolution. */
export function personSchema(site: SiteSettings, member: TeamMember, path?: string): Json {
  const sameAs = [member.linkedin_url].filter(Boolean) as string[]

  return compact({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': path ? `${siteUrl(site, path)}#person` : undefined,
    name: member.name,
    jobTitle: member.title || undefined,
    description: member.bio || undefined,
    image: member.photo_url || undefined,
    email: member.email || undefined,
    telephone: member.phone || undefined,
    url: path ? siteUrl(site, path) : undefined,
    worksFor: { '@id': organizationId(site) },
    sameAs,
  })
}

/**
 * Article schema. Publisher and author both resolve to the client business
 * unless the post names a human author.
 */
export function articleSchema(
  site: SiteSettings,
  post: Pick<
    Post,
    | 'slug'
    | 'title'
    | 'h1'
    | 'meta_description'
    | 'excerpt'
    | 'featured_image_url'
    | 'published_at'
    | 'updated_at'
    | 'author'
    | 'word_count'
  >,
): Json {
  const url = siteUrl(site, `/resources/${post.slug}`)

  return compact({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: post.h1 || post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.featured_image_url || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    wordCount: post.word_count || undefined,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: post.author
      ? { '@type': 'Person', name: post.author }
      : { '@id': organizationId(site) },
    publisher: { '@id': organizationId(site) },
  })
}

/**
 * FAQPage. The highest-leverage AEO structure — direct question/answer pairs
 * are what answer engines quote.
 */
export function faqSchema(
  site: SiteSettings,
  path: string,
  faqs: { question: string; answer: string }[],
): Json | null {
  const valid = faqs.filter((f) => f.question?.trim() && f.answer?.trim())
  if (valid.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl(site, path)}#faq`,
    mainEntity: valid.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

/** BreadcrumbList. Improves how a URL renders in results. */
export function breadcrumbSchema(
  site: SiteSettings,
  crumbs: { name: string; path: string }[],
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: siteUrl(site, c.path),
    })),
  }
}

/** CollectionPage for a category landing page. */
export function collectionSchema(
  site: SiteSettings,
  category: Pick<Category, 'name' | 'slug' | 'description'>,
  postCount: number,
): Json {
  const url = siteUrl(site, `/resources/${category.slug}`)

  return compact({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name: category.name,
    description: category.description || undefined,
    url,
    isPartOf: { '@id': `${siteOrigin(site)}/#website` },
    publisher: { '@id': organizationId(site) },
    numberOfItems: postCount,
  })
}

/** Service node for a named offering. */
export function serviceSchema(
  site: SiteSettings,
  service: { name: string; description?: string; path?: string },
): Json {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description || undefined,
    url: service.path ? siteUrl(site, service.path) : undefined,
    provider: { '@id': organizationId(site) },
  })
}

/**
 * Serialize for a <script type="application/ld+json"> tag.
 * Escapes '<' so a string value can never terminate the script element.
 */
export function jsonLd(schema: Json | Json[] | null): string {
  if (!schema) return ''
  return JSON.stringify(schema).replace(/</g, '\\u003c')
}
