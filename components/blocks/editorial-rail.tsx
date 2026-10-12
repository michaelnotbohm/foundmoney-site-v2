'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

export interface EditorialChapterLink {
  id: string
  title: string
}

/**
 * Sticky chapter rail for the editorial rich_text variant (xl and up).
 * Highlights the chapter currently crossing the upper part of the viewport.
 * The only motion is the colour change of the active link.
 */
export function EditorialRail({
  chapters,
  ctaHref,
  ctaLabel = 'Book a call',
}: {
  chapters: EditorialChapterLink[]
  ctaHref?: string
  ctaLabel?: string
}) {
  const [active, setActive] = useState<string | null>(chapters[0]?.id ?? null)

  useEffect(() => {
    const nodes = chapters
      .map((c) => document.getElementById(c.id)?.closest('[data-chapter]'))
      .filter((n): n is Element => Boolean(n))
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        const id = hit?.target.getAttribute('data-chapter')
        if (id) setActive(id)
      },
      // A band across the upper middle of the viewport: the chapter whose
      // section crosses it is the one being read.
      { rootMargin: '-35% 0px -60% 0px' },
    )
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [chapters])

  return (
    <nav aria-label="On this page" className="flex flex-col gap-8">
      <ol className="m-0 flex list-none flex-col gap-3 border-l border-[var(--color-border)] p-0">
        {chapters.map((c, i) => {
          const on = c.id === active
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={on ? 'true' : undefined}
                className={`-ml-px flex gap-3 border-l-2 py-0.5 pl-4 font-mono text-[12px] leading-snug tracking-[0.01em] transition-colors ${
                  on
                    ? 'border-[var(--color-accent-deep)] text-[var(--color-accent-deep)]'
                    : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <span className="shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span>{c.title}</span>
              </a>
            </li>
          )
        })}
      </ol>
      {ctaHref && (
        <a
          href={ctaHref}
          className="inline-flex h-12 w-fit items-center gap-2 whitespace-nowrap px-6 text-[15px] font-semibold text-[var(--color-accent-foreground)] transition-transform duration-200 hover:-translate-y-px"
          style={{ background: 'var(--color-accent)', borderRadius: 'var(--radius-button)' }}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </nav>
  )
}
