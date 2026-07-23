'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { BlockProps, StatStripContent, Stat } from './types'

/**
 * Variants:
 *   default        — metric band on the secondary colour
 *   cards          — bordered cards on the surface colour
 *   cards-imagery  — cards with a supporting photograph per stat
 *
 * Merges the old stat_strip and stats blocks, which rendered nearly the same
 * thing through two different components.
 */
export function StatStripBlock({
  content,
  variant = 'default',
  embedded = false,
}: BlockProps<StatStripContent>) {
  const { eyebrow, heading, intro, stats } = content

  if (!stats || stats.length === 0) return null

  const withImagery = variant === 'cards-imagery'
  const asCards = variant === 'cards' || withImagery

  const header = (eyebrow || heading || intro) && (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && (
        <p
          className={`mb-3 text-sm font-semibold uppercase tracking-[0.2em] ${
            asCards
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-secondary-foreground)]/60'
          }`}
        >
          {eyebrow}
        </p>
      )}
      {heading && (
        <h2
          className={`font-[var(--font-heading)] text-3xl font-bold tracking-tight md:text-4xl ${
            asCards
              ? 'text-[var(--color-secondary)]'
              : 'text-[var(--color-secondary-foreground)]'
          }`}
        >
          {heading}
        </h2>
      )}
      {intro && (
        <p
          className={`mt-4 text-lg leading-relaxed ${
            asCards
              ? 'text-[var(--color-foreground)]/70'
              : 'text-[var(--color-secondary-foreground)]/70'
          }`}
        >
          {intro}
        </p>
      )}
    </div>
  )

  const grid = (
    <div
      className={
        withImagery
          ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
          : asCards
            ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-8'
      }
    >
      {stats.map((stat, index) => (
        <StatItem
          key={index}
          stat={stat}
          index={index}
          asCards={asCards}
          withImagery={withImagery}
        />
      ))}
    </div>
  )

  if (embedded) {
    return (
      <div className="w-full">
        {header}
        {grid}
      </div>
    )
  }

  return (
    <section
      className={
        asCards
          ? 'bg-[var(--color-surface)] py-12 md:py-16'
          : 'bg-[var(--color-secondary)] py-12 md:py-16'
      }
    >
      <div className="container mx-auto px-4">
        {header}
        {grid}
      </div>
    </section>
  )
}

function StatItem({
  stat,
  index,
  asCards,
  withImagery,
}: {
  stat: Stat
  index: number
  asCards: boolean
  withImagery: boolean
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
      { threshold: 0.1 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const value = (
    <div
      className={`font-[var(--font-heading)] font-bold leading-tight ${
        asCards
          ? 'text-3xl text-[var(--color-primary)] md:text-4xl'
          : 'mb-2 break-words text-2xl text-[var(--color-secondary-foreground)] sm:text-3xl md:text-4xl lg:text-5xl'
      } transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {stat.value}
      {stat.suffix && (
        <span className="ml-0.5 text-[0.6em] align-super">{stat.suffix}</span>
      )}
    </div>
  )

  if (withImagery) {
    return (
      <div
        ref={ref}
        className="flex flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm"
        style={{ borderRadius: 'calc(var(--radius) * 2)' }}
      >
        {stat.image && (
          <div className="relative aspect-[16/10] bg-[var(--color-surface)]">
            <Image
              src={stat.image}
              alt={stat.imageAlt || stat.label}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          {value}
          <div className="mt-2 text-sm font-semibold text-[var(--color-secondary)]">
            {stat.label}
          </div>
          {stat.detail && (
            <div className="mt-1 text-xs leading-relaxed text-[var(--color-foreground)]/60">
              {stat.detail}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (asCards) {
    return (
      <div
        ref={ref}
        className="border border-[var(--color-border)] bg-[var(--color-background)] p-6 text-center shadow-sm"
        style={{ borderRadius: 'calc(var(--radius) * 2)' }}
      >
        {value}
        <div className="mt-2 text-sm font-semibold text-[var(--color-secondary)]">
          {stat.label}
        </div>
        {stat.detail && (
          <div className="mt-1 text-xs text-[var(--color-foreground)]/60">
            {stat.detail}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className="min-w-0 text-center">
      {value}
      <div className="text-xs uppercase tracking-wide text-[var(--color-secondary-foreground)]/70 sm:text-sm">
        {stat.label}
      </div>
    </div>
  )
}
