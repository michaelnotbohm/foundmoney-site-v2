// components/resources/resources-post-grid.tsx
//
// Card grid for the Resources listings (All view + category pages). Article
// links are FLAT: /resources/<post.slug> — the city is shown as a badge, not a
// path segment, matching the SCM URL model.

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'
import type { ResourcePost } from '@/lib/resources/queries'

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ResourcesPostGrid({ posts }: { posts: ResourcePost[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => {
        const date = formatDate(post.published_at)
        return (
          <article
            key={post.id}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-shadow hover:shadow-md"
          >
            <Link href={`/resources/${post.slug}`} className="block">
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {post.featured_image_url ? (
                  <Image
                    src={post.featured_image_url}
                    alt={post.featured_image_alt || post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : null}
              </div>
            </Link>

            <div className="flex flex-1 flex-col p-5">
              {post.target_city && (
                <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {post.target_city}, FL
                </span>
              )}

              <h3 className="font-serif text-lg leading-snug text-foreground">
                <Link
                  href={`/resources/${post.slug}`}
                  className="transition-colors hover:text-primary"
                >
                  {post.title}
                </Link>
              </h3>

              {post.excerpt && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-4 flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                {date && <time dateTime={post.published_at || undefined}>{date}</time>}
                {post.reading_time_minutes ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {post.reading_time_minutes} min
                  </span>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
