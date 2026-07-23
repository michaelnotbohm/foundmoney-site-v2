// app/resources/[slug]/page.tsx
//
// Dual-purpose route under /resources/<slug>:
//   - <slug> matches a CATEGORY  -> category landing page
//   - otherwise                  -> ARTICLE
//
// Post and category slugs share this namespace. The schema enforces
// uniqueness across both with a trigger, so a collision fails at write time
// rather than silently shadowing one of them here.
//
// Body column: posts.content holds rendered HTML and is the only body column.
// There is no content_html and no body — selecting a column that does not
// exist makes PostgREST 400, the JS client return null, and this route 404
// with no visible error.

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getSite } from '@/lib/site'
import { buildMetadata, postMetadata } from '@/lib/seo'
import {
  articleSchema,
  collectionSchema,
  breadcrumbSchema,
  jsonLd,
} from '@/lib/schema'
import { SiteShell } from '@/components/layout/site-shell'
import {
  getCategoryBySlug,
  getCategoryById,
  getCategories,
  getPostsByCategory,
  getPostBySlug,
  splitCategories,
} from '@/lib/resources/queries'
import { ResourcesCategoryBar } from '@/components/resources/resources-category-bar'
import { ResourcesPostGrid } from '@/components/resources/resources-post-grid'

export const revalidate = 60

interface RouteProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateString: string | null): string | null {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const site = await getSite()
  if (!site) return {}

  const category = await getCategoryBySlug(slug)
  if (category) {
    return buildMetadata({
      site,
      path: `/resources/${category.slug}`,
      title: category.name,
      description: category.description,
    })
  }

  const post = await getPostBySlug(slug)
  if (post) {
    return postMetadata(site, {
      ...post,
      updated_at: post.published_at ?? new Date().toISOString(),
    })
  }

  return {}
}

export default async function ResourceSlugPage({ params }: RouteProps) {
  const { slug } = await params
  const site = await getSite()
  if (!site) notFound()

  const category = await getCategoryBySlug(slug)

  // ── CATEGORY BRANCH ───────────────────────────────────────────────────────
  if (category) {
    const [posts, allCategories] = await Promise.all([
      getPostsByCategory(category.id),
      getCategories(),
    ])
    const { locationCategories, topicCategories } = splitCategories(allCategories)

    const breadcrumbs = breadcrumbSchema(site, [
      { name: 'Home', path: '/' },
      { name: 'Resources', path: '/resources' },
      { name: category.name, path: `/resources/${category.slug}` },
    ])

    return (
      <>
        <SiteShell site={site}>
          <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="container mx-auto px-4 py-14 md:py-16">
              <nav className="mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                  <li>
                    <Link href="/" className="hover:text-[var(--color-foreground)]">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href="/resources"
                      className="hover:text-[var(--color-foreground)]"
                    >
                      Resources
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li className="text-[var(--color-foreground)]">{category.name}</li>
                </ol>
              </nav>

              <h1 className="font-[var(--font-heading)] text-4xl font-bold tracking-tight text-[var(--color-foreground)] md:text-5xl">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)]">
                  {category.description}
                </p>
              )}
              <p className="mt-4 text-sm text-[var(--color-muted)]">
                {posts.length} {posts.length === 1 ? 'article' : 'articles'}
              </p>
            </div>
          </section>

          <ResourcesCategoryBar
            locationCategories={locationCategories}
            topicCategories={topicCategories}
            currentSlug={category.slug}
          />

          <section className="bg-[var(--color-background)] py-12 md:py-16">
            <div className="container mx-auto px-4">
              {posts.length > 0 ? (
                <ResourcesPostGrid posts={posts} />
              ) : (
                <p className="text-[var(--color-muted)]">
                  No articles in this category yet.
                </p>
              )}
            </div>
          </section>
        </SiteShell>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(collectionSchema(site, category, posts.length)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
        />
      </>
    )
  }

  // ── ARTICLE BRANCH ────────────────────────────────────────────────────────
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const articleCategory = post.category_id
    ? await getCategoryById(post.category_id)
    : null

  const publishedLabel = formatDate(post.published_at)

  const breadcrumbs = breadcrumbSchema(site, [
    { name: 'Home', path: '/' },
    { name: 'Resources', path: '/resources' },
    ...(articleCategory
      ? [{ name: articleCategory.name, path: `/resources/${articleCategory.slug}` }]
      : []),
    { name: post.title, path: `/resources/${post.slug}` },
  ])

  // Askable may supply its own schema_json. Prefer it when present, but the
  // builder is the safe default — a studio-generated node can carry the
  // studio's own origin in canonical/url fields, which is exactly the
  // identity leak this layer exists to prevent. Verify before trusting it.
  const article = articleSchema(site, {
    slug: post.slug,
    title: post.title,
    h1: null,
    meta_description: post.meta_description,
    excerpt: post.excerpt,
    featured_image_url: post.featured_image_url,
    published_at: post.published_at,
    updated_at: post.published_at ?? new Date().toISOString(),
    author: post.author,
    word_count: post.word_count,
  })

  return (
    <>
      <SiteShell site={site}>
        <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="container mx-auto px-4 py-14 md:py-16">
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted)]">
                <li>
                  <Link href="/" className="hover:text-[var(--color-foreground)]">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/resources"
                    className="hover:text-[var(--color-foreground)]"
                  >
                    Resources
                  </Link>
                </li>
                {articleCategory && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li>
                      <Link
                        href={`/resources/${articleCategory.slug}`}
                        className="hover:text-[var(--color-foreground)]"
                      >
                        {articleCategory.name}
                      </Link>
                    </li>
                  </>
                )}
              </ol>
            </nav>

            <h1 className="max-w-3xl font-[var(--font-heading)] text-4xl font-bold tracking-tight text-[var(--color-foreground)] md:text-5xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
              {publishedLabel && <span>{publishedLabel}</span>}
              {publishedLabel && post.reading_time_minutes && (
                <span aria-hidden="true">·</span>
              )}
              {post.reading_time_minutes && (
                <span>{post.reading_time_minutes} min read</span>
              )}
            </div>
          </div>
        </section>

        {post.featured_image_url && (
          <section className="bg-[var(--color-background)]">
            <div className="container mx-auto px-4 pt-10 md:pt-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featured_image_url}
                alt={post.featured_image_alt || post.title}
                className="w-full rounded-lg object-cover"
              />
            </div>
          </section>
        )}

        <section className="bg-[var(--color-background)] py-10 md:py-14">
          <div className="container mx-auto px-4">
            {post.content ? (
              <article
                className="article-body mx-auto max-w-3xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="mx-auto max-w-3xl text-[var(--color-muted)]">
                {post.excerpt}
              </p>
            )}

            <div className="mx-auto mt-12 max-w-3xl">
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                ← Back to Resources
              </Link>
            </div>
          </div>
        </section>
      </SiteShell>

      {/* Scoped article typography, driven entirely by theme tokens.
          @tailwindcss/typography is deliberately not installed and
          globals.css is deliberately untouched — reuse this pattern rather
          than adding the plugin. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .article-body {
              color: var(--color-foreground);
              font-family: var(--font-body);
              font-size: 1.125rem;
              line-height: 1.8;
            }
            .article-body > *:first-child { margin-top: 0; }
            .article-body p { margin: 0 0 1.5rem; }
            .article-body h2 {
              font-family: var(--font-heading);
              color: var(--color-secondary);
              font-size: 1.875rem;
              line-height: 1.25;
              font-weight: 700;
              letter-spacing: -0.01em;
              margin: 3rem 0 1.25rem;
            }
            .article-body h3 {
              font-family: var(--font-heading);
              color: var(--color-secondary);
              font-size: 1.5rem;
              line-height: 1.3;
              font-weight: 700;
              margin: 2.5rem 0 1rem;
            }
            .article-body h4 {
              font-family: var(--font-heading);
              color: var(--color-secondary);
              font-size: 1.25rem;
              line-height: 1.35;
              font-weight: 700;
              margin: 2rem 0 0.75rem;
            }
            .article-body h2:first-child,
            .article-body h3:first-child { margin-top: 0; }
            .article-body a {
              color: var(--color-primary);
              text-decoration: underline;
              text-underline-offset: 2px;
              font-weight: 500;
            }
            .article-body a:hover { text-decoration: none; }
            .article-body strong {
              color: var(--color-secondary);
              font-weight: 700;
            }
            .article-body ul, .article-body ol {
              margin: 0 0 1.5rem;
              padding-left: 1.5rem;
            }
            .article-body ul { list-style: disc; }
            .article-body ol { list-style: decimal; }
            .article-body li { margin: 0 0 0.5rem; padding-left: 0.25rem; }
            .article-body li::marker { color: var(--color-primary); }
            .article-body blockquote {
              margin: 2rem 0;
              padding: 1rem 1.5rem;
              border-left: 4px solid var(--color-primary);
              background: color-mix(in srgb, var(--color-primary) 6%, transparent);
              font-style: italic;
              color: var(--color-muted);
            }
            .article-body blockquote p:last-child { margin-bottom: 0; }
            .article-body img {
              border-radius: 0.5rem;
              margin: 2rem 0;
              max-width: 100%;
              height: auto;
            }
            .article-body hr {
              border: 0;
              border-top: 1px solid var(--color-border);
              margin: 3rem 0;
            }
          `,
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
    </>
  )
}
