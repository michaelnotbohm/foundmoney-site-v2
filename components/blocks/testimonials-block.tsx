'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import type { BlockProps, TestimonialsContent, Testimonial } from './types'

/**
 * Variants: default (grid) | carousel | centered
 *
 * Merges the old testimonial and testimonials blocks. Registered under both
 * type names so existing seeded sections keep rendering.
 */
function Stars({ rating }: { rating?: number }) {
  if (!rating || rating <= 0) return null

  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? 'h-4 w-4 fill-[var(--color-accent)] text-[var(--color-accent)]'
              : 'h-4 w-4 text-[var(--color-border)]'
          }
        />
      ))}
    </div>
  )
}

function Attribution({ t, center }: { t: Testimonial; center?: boolean }) {
  return (
    <div className={center ? 'flex items-center justify-center gap-4' : ''}>
      {t.image && (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
          <Image src={t.image} alt={t.author} fill className="object-cover" />
        </div>
      )}
      <div className={center ? 'text-left' : ''}>
        <p className="font-semibold text-[var(--color-foreground)]">{t.author}</p>
        {t.attribution && (
          <p className="text-sm text-[var(--color-muted)]">{t.attribution}</p>
        )}
      </div>
    </div>
  )
}

export function TestimonialsBlock({
  content,
  variant = 'default',
  embedded = false,
}: BlockProps<TestimonialsContent>) {
  const { heading, testimonials } = content

  if (!testimonials || testimonials.length === 0) return null

  if (variant === 'carousel') {
    return (
      <TestimonialsCarousel
        heading={heading}
        testimonials={testimonials}
        embedded={embedded}
      />
    )
  }

  if (variant === 'centered') {
    const t = testimonials[0]

    const inner = (
      <div className="mx-auto max-w-3xl text-center">
        <Quote className="mx-auto mb-6 h-12 w-12 text-[var(--color-primary)]/20" />
        <blockquote className="mb-8 text-xl italic leading-relaxed text-[var(--color-foreground)] md:text-2xl">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <Attribution t={t} center />
      </div>
    )

    if (embedded) return <div className="w-full">{inner}</div>

    return (
      <section className="bg-[var(--color-surface)] py-16 md:py-24">
        <div className="container mx-auto px-4">{inner}</div>
      </section>
    )
  }

  const grid = (
    <>
      {heading && (
        <h2 className="mb-12 text-center font-[var(--font-heading)] text-3xl font-semibold tracking-tight text-[var(--color-secondary)] md:text-4xl">
          {heading}
        </h2>
      )}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, index) => (
          <div
            key={index}
            className="flex flex-col border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-sm"
            style={{ borderRadius: 'calc(var(--radius) * 2)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <Quote className="h-8 w-8 text-[var(--color-primary)]/30" />
              <Stars rating={t.rating} />
            </div>
            <blockquote className="flex-1">
              <p className="leading-relaxed text-[var(--color-foreground)]">
                &ldquo;{t.quote}&rdquo;
              </p>
            </blockquote>
            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
              <Attribution t={t} />
            </div>
          </div>
        ))}
      </div>
    </>
  )

  if (embedded) return <div className="w-full">{grid}</div>

  return (
    <section className="bg-[var(--color-surface)] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{grid}</div>
    </section>
  )
}

function TestimonialsCarousel({
  heading,
  testimonials,
  embedded,
}: {
  heading?: string
  testimonials: Testimonial[]
  embedded?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = testimonials.length

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  )

  useEffect(() => {
    if (paused || count <= 1) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReduced) return

    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000)
    return () => clearInterval(id)
  }, [paused, count])

  const current = testimonials[index]

  const inner = (
    <>
      {heading && (
        <h2 className="mb-12 text-center font-[var(--font-heading)] text-3xl font-semibold tracking-tight text-[var(--color-secondary)] md:text-4xl">
          {heading}
        </h2>
      )}

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex min-h-[260px] flex-col items-center justify-center border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center shadow-sm md:p-12"
          style={{ borderRadius: 'calc(var(--radius) * 2)' }}
        >
          <Quote className="mb-6 h-10 w-10 text-[var(--color-primary)]/30" />
          <blockquote className="mb-6">
            <p className="text-lg leading-relaxed text-[var(--color-foreground)] md:text-xl">
              &ldquo;{current.quote}&rdquo;
            </p>
          </blockquote>
          <div className="mb-3">
            <Stars rating={current.rating} />
          </div>
          <Attribution t={current} center />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="absolute left-0 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm transition-colors hover:bg-[var(--color-surface)] md:-translate-x-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm transition-colors hover:bg-[var(--color-surface)] md:translate-x-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={
                i === index
                  ? 'h-2 w-6 rounded-full bg-[var(--color-primary)] transition-all'
                  : 'h-2 w-2 rounded-full bg-[var(--color-border)] transition-all hover:bg-[var(--color-muted)]'
              }
            />
          ))}
        </div>
      )}
    </>
  )

  if (embedded) return <div className="w-full">{inner}</div>

  return (
    <section className="bg-[var(--color-surface)] py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">{inner}</div>
    </section>
  )
}
