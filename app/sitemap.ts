// app/sitemap.ts
//
// Generated from site.domain, never from the request host or a constant.
// An origin URL leaking in here re-introduces the canonical problem the whole
// SEO layer exists to prevent.
//
// Respects both site-level and page-level noindex: a hidden page must not
// appear in the sitemap, or the noindex tag and the sitemap contradict
// each other.

import type { MetadataRoute } from 'next'
import { getSite, getPages, siteUrl } from '@/lib/site'
import { getPostSlugs, getCategories } from '@/lib/resources/queries'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite()

  // No site configured, or the whole site is hidden during build.
  if (!site || site.noindex) return []

  const [pages, posts, categories] = await Promise.all([
    getPages(),
    getPostSlugs(),
    getCategories(),
  ])

  const entries: MetadataRoute.Sitemap = []

  for (const page of pages) {
    if (page.noindex) continue

    const path = page.slug === '/' ? '/' : `/${page.slug.replace(/^\//, '')}`
    const isHome = path === '/'

    entries.push({
      url: siteUrl(site, path),
      lastModified: new Date(page.updated_at),
      changeFrequency: isHome ? 'weekly' : 'monthly',
      priority: isHome ? 1 : 0.8,
    })
  }

  if (posts.length > 0) {
    entries.push({
      url: siteUrl(site, '/resources'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  for (const category of categories) {
    entries.push({
      url: siteUrl(site, `/resources/${category.slug}`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  for (const post of posts) {
    entries.push({
      url: siteUrl(site, `/resources/${post.slug}`),
      lastModified: new Date(post.updated_at || post.published_at || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return entries
}
