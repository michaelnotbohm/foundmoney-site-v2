'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BlockProps, MediaTextContent } from './types'

/**
 * Variants:
 *   default — copy and media split, with optional scroll reveal (below)
 *   band    — full-bleed dark split: duotone photo left fading into the
 *             secondary colour, copy right with eyebrow, headline, body,
 *             round headshots (content.people), and a text link
 *
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
  variant = 'default',
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
    people,
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

  if (variant === 'band') {
    return (
      <section className="grain relative overflow-hidden bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">
        <div className="flex flex-wrap items-stretch">
          {image && (
            <div className="relative min-h-[320px] flex-[1_1_520px] overflow-hidden md:min-h-[560px]">
              <Image
                src={image}
                alt={imageAlt || ''}
                fill
                className="object-cover"
                style={{
                  filter:
                    'grayscale(1) contrast(1.05) sepia(.35) hue-rotate(95deg) saturate(.9) brightness(.9)',
                }}
                sizes="(max-width: 1040px) 100vw, 50vw"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 55%, var(--color-secondary) 100%), linear-gradient(0deg, color-mix(in srgb, var(--color-secondary) 60%, transparent), transparent 50%)',
                }}
              />
            </div>
          )}

          <div className="flex flex-[1_1_520px] flex-col justify-center gap-7 px-5 py-16 md:px-16 md:py-24">
            {eyebrow && (
              <p className="m-0 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="font-heading m-0 max-w-[18ch] text-[clamp(2rem,4.2vw,3rem)] font-medium leading-[1.04] tracking-[-0.02em]">
                {heading}
              </h2>
            )}
            {body && (
              <p className="m-0 max-w-[52ch] whitespace-pre-line text-[17px] leading-relaxed text-[var(--color-secondary-foreground)]/75">
                {body}
              </p>
            )}
            {people && people.length > 0 && (
              <ul className="m-0 mt-2 flex list-none flex-wrap gap-7 p-0">
                {people.map((person) => (
                  <li key={person.name} className="flex items-center gap-3">
                    {person.image && (
                      <Image
                        src={person.image}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover"
                        style={{
                          objectPosition: person.imagePosition,
                          boxShadow: '0 0 0 2px var(--color-accent)',
                        }}
                      />
                    )}
                    <div>
                      <div className="text-[15px] font-semibold">{person.name}</div>
                      {person.role && (
                        <div className="text-[13px] text-[var(--color-secondary-foreground)]/60">
                          {person.role}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {cta && (
              <Link
                href={cta.href}
                className="group inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--color-accent)]"
              >
                {cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>
      </section>
    )
  }

  const isRight = imagePosition === 'right'

  const media = image ? (
    <div
      className={cn(
        'relative aspect-[4/3] overflow-hidden bg-[var(--color-surface)] lg:sticky lg:top-28',
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
        <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-primary)]">
          {eyebrow}
        </p>
      )}

      {heading && (
        <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-secondary)] md:text-4xl">
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
      className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16"
    >
      {media}
      {copy}
    </div>
  )

  if (embedded) return <div className="w-full">{grid}</div>

  return (
    // overflow-x-clip, not overflow-hidden: hidden makes the section a scroll
    // container, which stops the sticky image from sticking.
    <section className="overflow-x-clip py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{grid}</div>
    </section>
  )
}
