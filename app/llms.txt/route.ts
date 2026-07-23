// app/llms.txt/route.ts
//
// Plain-text summary of the site for AI crawlers, served at /llms.txt.
//
// Rather than making an answer engine infer what a business does from
// scattered pages, this states it directly and lists the canonical URLs worth
// reading. Every URL derives from site_settings.domain.
//
// Returns 404 while the site is noindexed.

import { getSite, getPages, siteUrl } from '@/lib/site'
import { getPostSlugs, getCategories } from '@/lib/resources/queries'

export const revalidate = 3600

function labelFor(slug: string): string {
  if (slug === '/') return 'Home'
  const last = slug.split('/').pop() || slug
  return last
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

export async function GET() {
  const site = await getSite()

  if (!site || site.noindex) {
    return new Response('Not found', { status: 404 })
  }

  const [pages, posts, categories] = await Promise.all([
    getPages(),
    getPostSlugs(),
    getCategories(),
  ])

  const lines: string[] = []

  lines.push('# ' + site.name)
  lines.push('')

  if (site.description) {
    lines.push('> ' + site.description)
    lines.push('')
  }

  lines.push(
    'The pages and articles below are the canonical, crawlable sources of truth on ' +
      site.domain +
      '.',
  )
  lines.push('')

  const visible = pages.filter((p) => !p.noindex)

  if (visible.length > 0) {
    lines.push('## Pages')
    lines.push('')
    for (const p of visible) {
      const path = p.slug === '/' ? '/' : '/' + p.slug.replace(/^\//, '')
      const label = p.title || labelFor(p.slug)
      lines.push('- [' + label + '](' + siteUrl(site, path) + ')')
    }
    lines.push('')
  }

  if (categories.length > 0) {
    lines.push('## Topics')
    lines.push('')
    for (const c of categories) {
      lines.push(
        '- [' + c.name + '](' + siteUrl(site, '/resources/' + c.slug) + ')',
      )
    }
    lines.push('')
  }

  if (posts.length > 0) {
    lines.push('## Articles')
    lines.push('')
    for (const post of posts) {
      const label = labelFor(post.slug)
      const url = siteUrl(site, '/resources/' + post.slug)
      lines.push('- [' + label + '](' + url + ')')
    }
    lines.push('')
  }

  const contact: string[] = []
  if (site.email) contact.push('Email: ' + site.email)
  if (site.phone) contact.push('Phone: ' + site.phone)

  if (contact.length > 0) {
    lines.push('## Contact')
    lines.push('')
    lines.push(...contact)
    lines.push('')
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
