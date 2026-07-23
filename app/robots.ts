// app/robots.ts
//
// While site.noindex is true (the default during a build), this disallows
// everything. Combined with the noindex,nofollow meta tag from lib/seo.ts,
// that keeps an in-progress site out of the index without relying on
// obscurity.
//
// AI crawlers are allowed explicitly once the site is live. Blocking them is
// the single fastest way to lose AEO visibility — an answer engine that
// cannot read the site cannot cite it.

import type { MetadataRoute } from 'next'
import { getSite, siteUrl } from '@/lib/site'

export const revalidate = 3600

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
]

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite()

  if (!site || site.noindex) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
      ...AI_CRAWLERS.map((agent) => ({
        userAgent: agent,
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      })),
    ],
    sitemap: siteUrl(site, '/sitemap.xml'),
    host: siteUrl(site, '/'),
  }
}
