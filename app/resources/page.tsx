// app/resources/page.tsx
//
// Resources landing page — every published article plus the category filter.
//
// Hero copy comes from site settings rather than hardcoded industry language,
// so this route works for a lender, a contractor, or an advisory firm without
// modification.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSite } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema, jsonLd } from '@/lib/schema'
import { SiteShell } from '@/components/layout/site-shell'
import {
  getAllPosts,
  getCategories,
  splitCategories,
} from '@/lib/resources/queries'
import { ResourcesCategoryBar } from '@/components/resources/resources-category-bar'
import { ResourcesPostGrid } from '@/components/resources/resources-post-grid'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()
  if (!site) return { title: 'Resources' }

  return buildMetadata({
    site,
    path: '/resources',
    title: 'Resources',
    description:
      site.description ||
      `Guides, insights, and resources from ${site.name}.`,
  })
}

export default async function ResourcesPage() {
  const site = await getSite()
  if (!site) notFound()

  const [posts, categories] = await Promise.all([getAllPosts(), getCategories()])
  const { locationCategories, topicCategories } = splitCategories(categories)

  const breadcrumbs = breadcrumbSchema(site, [
    { name: 'Home', path: '/' },
    { name: 'Resources', path: '/resources' },
  ])

  return (
    <>
      <SiteShell site={site}>
        <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="container mx-auto px-4 py-14 md:py-16">
            <h1 className="font-[var(--font-heading)] text-4xl font-bold tracking-tight text-[var(--color-foreground)] md:text-5xl">
              Resources
            </h1>
            {site.description && (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)]">
                {site.description}
              </p>
            )}
          </div>
        </section>

        <ResourcesCategoryBar
          locationCategories={locationCategories}
          topicCategories={topicCategories}
        />

        <section className="bg-[var(--color-background)] py-12 md:py-16">
          <div className="container mx-auto px-4">
            {posts.length > 0 ? (
              <ResourcesPostGrid posts={posts} />
            ) : (
              <p className="text-[var(--color-muted)]">
                No articles yet — check back soon.
              </p>
            )}
          </div>
        </section>
      </SiteShell>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
    </>
  )
}
