'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BlockProps, MediaTextContent } from './types'

/**
 * Copy and media split, with optional scroll reveal.
 *
 * Merges the old image_text and scroll_reveal blocks — they differed only in
 * whether the content animated in. Set content.reveal to true for the
 * animated behaviour; it respects prefers-reduced-motion.
 *
 * Distinct from two_column, which composes two other blocks. This one owns
 * its own content.
 */
export function MediaTextBlock({
  content,
  embedded = false,
}: BlockProps<MediaTextContent>) {
  const {
    eyebrow,
    heading,
    body,
    image,
    imageAlt,
    imagePosition = 'left',
    tags,
    cta,
    reveal = false,
  } = content

  const [isVisible, setIsVisible] = useState(!reveal)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!reveal) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReduced) {
      setIsVisible(true)
      return
    }

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [reveal])

  if (!image && !heading) return null

  const isRight = imagePosition === 'right'

  const media = image ? (
    <div
      className={cn(
        'relative aspect-[4/3] overflow-hidden bg-[var(--color-surface)]',
        reveal && 'transition-all duration-700 delay-150',
        reveal && (isVisible ? 'translate-x-0 opacity-100' : 'opacity-0'),
        reveal && !isVisible && (isRight ? 'translate-x-8' : '-translate-x-8'),
        isRight && 'lg:order-2',
      )}
      style={{ borderRadius: 'calc(var(--radius) * 2)' }}
    >
      <Image
        src={image}
        alt={imageAlt || heading || ''}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  ) : null

  const copy = (
    <div
      className={cn(
        'flex flex-col',
        reveal && 'transition-all duration-700',
        reveal && (isVisible ? 'translate-x-0 opacity-100' : 'opacity-0'),
        reveal && !isVisible && (isRight ? '-translate-x-8' : 'translate-x-8'),
        isRight && 'lg:order-1',
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          {eyebrow}
        </p>
      )}

      {heading && (
        <h2 className="font-[var(--font-heading)] text-3xl font-bold tracking-tight text-[var(--color-secondary)] md:text-4xl">
          {heading}
        </h2>
      )}

      {body && (
        <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-[var(--color-foreground)]/75">
          {body}
        </p>
      )}

      {tags && tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {cta && (
        <div className="mt-8">
          <Button
            asChild
            className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90"
            style={{ borderRadius: 'var(--radius-button)' }}
          >
            <Link href={cta.href}>
              {cta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )

  const grid = (
    <div
      ref={ref}
      className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
    >
      {media}
      {copy}
    </div>
  )

  if (embedded) return <div className="w-full">{grid}</div>

  return (
    <section className="overflow-hidden py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{grid}</div>
    </section>
  )
}
