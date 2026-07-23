// app/[[...slug]]/page.tsx
//
// Renders any published page from the pages + sections tables.
//
// All SEO identity flows through lib/seo.ts and all JSON-LD through
// lib/schema.ts, so there is exactly one place where a canonical URL or a
// business identity is constructed.

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSite, getPage } from '@/lib/site'
import { pageMetadata } from '@/lib/seo'
import {
  organizationSchema,
  websiteSchema,
  breadcrumbSchema,
  jsonLd,
} from '@/lib/schema'
import { SiteShell } from '@/components/layout/site-shell'
import { BlockRenderer } from '@/components/blocks/block-renderer'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export const revalidate = 60

function resolveSlug(slug?: string[]): string {
  return slug?.join('/') || '/'
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const site = await getSite()
  if (!site) return { title: 'Not Found' }

  const page = await getPage(resolveSlug(slug))
  if (!page) return { title: 'Not Found' }

  return pageMetadata(site, page)
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params
  const pageSlug = resolveSlug(slug)

  const site = await getSite()
  if (!site) notFound()

  const page = await getPage(pageSlug)
  if (!page) notFound()

  const isHome = pageSlug === '/'

  // Organization + WebSite are emitted once, on the home page. Every other
  // schema node on the site references the organization by @id rather than
  // repeating it, which is what lets a crawler resolve them to one entity.
  const globalSchema = isHome
    ? [organizationSchema(site), websiteSchema(site)]
    : []

  const breadcrumbs = isHome
    ? null
    : breadcrumbSchema(site, [
        { name: 'Home', path: '/' },
        { name: page.title, path: `/${pageSlug}` },
      ])

  // Page-level schema_json is an escape hatch for anything the builders
  // don't cover — a Service list, a bespoke Product node.
  const customSchema = page.schema_json ?? null

  return (
    <>
      <SiteShell site={site}>
        <BlockRenderer sections={page.sections ?? []} site={site} />
      </SiteShell>

      {globalSchema.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />
      ))}

      {breadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
        />
      )}

      {customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(customSchema) }}
        />
      )}
    </>
  )
}
