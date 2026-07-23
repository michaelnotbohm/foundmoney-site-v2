// lib/seo.ts
//
// Every identity signal the site emits derives from the site_settings row.
// Nothing about the serving platform, the origin domain, or a build-time
// constant may appear in what a page renders.
//
// The canonical URL is the signal that matters most: it is computed from
// site.domain + path, never from the request host and never from a constant.
// A stored canonical_url is treated as an override only. Getting this wrong
// consolidates ranking onto the wrong domain while looking perfectly fine in
// a browser.

import type { Metadata } from 'next'
import type { SiteSettings, Page, Post } from '@/lib/types/database'
import { siteOrigin, siteUrl } from '@/lib/site'

interface BuildMetadataArgs {
  site: SiteSettings
  /** Path this page lives at, e.g. '/' or '/about' or '/resources/my-post'. */
  path: string
  title: string
  description?: string | null
  /** Stored override. Leave null to compute from site domain + path. */
  canonicalOverride?: string | null
  ogImage?: string | null
  ogType?: 'website' | 'article'
  /** Page-level flag. Combined with site.noindex — either one hides the page. */
  noindex?: boolean
  publishedTime?: string | null
  modifiedTime?: string | null
  authors?: string[]
}

/**
 * Build Next.js Metadata for any page.
 *
 * Title is passed through as-is: the root layout owns the `%s | Site Name`
 * template, so pages supply only their own part.
 */
export function buildMetadata({
  site,
  path,
  title,
  description,
  canonicalOverride,
  ogImage,
  ogType = 'website',
  noindex = false,
  publishedTime,
  modifiedTime,
  authors,
}: BuildMetadataArgs): Metadata {
  const canonical = canonicalOverride || siteUrl(site, path)
  const hidden = site.noindex || noindex

  const image = ogImage || defaultOgImage(site)

  const metadata: Metadata = {
    title,
    description: description || site.description || undefined,
    alternates: { canonical },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      siteName: site.name,
      title,
      description: description || site.description || undefined,
      url: canonical,
      images: image ? [{ url: image, width: 1200, height: 630, alt: site.name }] : [],
      ...(ogType === 'article' && {
        publishedTime: publishedTime || undefined,
        modifiedTime: modifiedTime || undefined,
        authors: authors?.length ? authors : undefined,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || site.description || undefined,
      images: image ? [image] : [],
    },
  }

  if (hidden) {
    metadata.robots = { index: false, follow: false }
  }

  return metadata
}

/** Site-wide OG fallback. Stored on the theme so it travels with the brand. */
export function defaultOgImage(site: SiteSettings): string | null {
  const fromTheme = (site.theme as Record<string, unknown>).defaultOgImage
  if (typeof fromTheme === 'string' && fromTheme) return fromTheme
  return site.logo_url || null
}

/** Metadata for a database-driven page row. */
export function pageMetadata(site: SiteSettings, page: Page): Metadata {
  const path = page.slug === '/' ? '/' : `/${page.slug.replace(/^\//, '')}`

  return buildMetadata({
    site,
    path,
    title: page.meta_title || page.title,
    description: page.meta_description,
    canonicalOverride: page.canonical_url,
    ogImage: page.og_image,
    noindex: page.noindex,
  })
}

/** Metadata for an article. */
export function postMetadata(
  site: SiteSettings,
  post: Pick<
    Post,
    | 'slug'
    | 'title'
    | 'meta_title'
    | 'meta_description'
    | 'excerpt'
    | 'canonical_url'
    | 'featured_image_url'
    | 'published_at'
    | 'updated_at'
    | 'author'
  >,
): Metadata {
  return buildMetadata({
    site,
    path: `/resources/${post.slug}`,
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    canonicalOverride: post.canonical_url,
    ogImage: post.featured_image_url,
    ogType: 'article',
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
    authors: post.author ? [post.author] : [site.name],
  })
}

/** Root layout metadata. Owns the title template and metadataBase. */
export function rootMetadata(site: SiteSettings): Metadata {
  const origin = siteOrigin(site)
  const image = defaultOgImage(site)

  const defaultTitle = site.tagline
    ? `${site.name} | ${site.tagline}`
    : site.name

  return {
    metadataBase: new URL(origin),
    title: {
      default: defaultTitle,
      template: `%s | ${site.name}`,
    },
    description: site.description || undefined,
    authors: [{ name: site.name }],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: site.name,
      url: origin,
      images: image ? [{ url: image, width: 1200, height: 630, alt: site.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: image ? [image] : [],
    },
    ...(site.noindex && { robots: { index: false, follow: false } }),
  }
}
