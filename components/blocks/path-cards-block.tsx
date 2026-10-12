import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { BlockProps, PathCardsContent } from './types'

/**
 * Variants: default (image overlay) | grid (image top) | overlap (lifts into
 * the hero above) | simple (text only) | portrait (4:5 photo, accent tab,
 * name / mono role / one-liner; the whole card is the link)
 */
export function PathCardsBlock({
  content,
  variant = 'default',
}: BlockProps<PathCardsContent>) {
  const { cards, heading, ctaLabel = 'Learn more' } = content

  if (!cards || cards.length === 0) return null

  if (variant === 'portrait') return <PortraitCards content={content} />

  const cardRadius = { borderRadius: 'calc(var(--radius) * 2)' }

  const sectionHeading = heading && (
    <h2 className="mb-12 text-center font-heading text-3xl font-semibold tracking-tight text-[var(--color-secondary)] md:text-4xl">
      {heading}
    </h2>
  )

  const cardLink = (
    <span className="inline-flex items-center text-sm font-semibold text-[var(--color-accent-deep)] group-hover:underline">
      {ctaLabel}
      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </span>
  )

  if (variant === 'simple') {
    return (
      <section className="bg-[var(--color-background)] py-16 md:py-24">
        <div className="container mx-auto px-4">
          {sectionHeading}
          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group flex flex-col items-center border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center shadow-sm transition-shadow hover:shadow-md"
                style={cardRadius}
              >
                <h3 className="mb-3 font-heading text-2xl font-bold text-[var(--color-secondary)] md:text-3xl">
                  {card.label}
                </h3>
                {card.description && (
                  <p className="mb-6 flex-1 leading-relaxed text-[var(--color-foreground)]/75">
                    {card.description}
                  </p>
                )}
                {cardLink}
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'overlap') {
    return (
      <section className="relative z-20 -mt-20 pb-16 md:-mt-32 md:pb-24 lg:-mt-40">
        <div className="container mx-auto px-4">
          {sectionHeading}
          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group flex flex-col border border-[var(--color-border)] bg-[var(--color-background)] p-7 shadow-lg transition-shadow hover:shadow-xl"
                style={cardRadius}
              >
                <h3 className="mb-2 font-heading text-xl font-bold text-[var(--color-secondary)]">
                  {card.label}
                </h3>
                {card.description && (
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--color-foreground)]/75">
                    {card.description}
                  </p>
                )}
                {cardLink}
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'grid') {
    return (
      <section className="bg-[var(--color-background)] py-16 md:py-24">
        <div className="container mx-auto px-4">
          {sectionHeading}
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group flex flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm transition-shadow hover:shadow-md"
                style={cardRadius}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface)]">
                  {card.image && (
                    <Image
                      src={card.image}
                      alt={card.label}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ objectPosition: card.imagePosition }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 font-heading text-xl font-bold text-[var(--color-secondary)]">
                    {card.label}
                  </h3>
                  {card.description && (
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--color-foreground)]/75">
                      {card.description}
                    </p>
                  )}
                  {cardLink}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {sectionHeading}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className="group relative block aspect-[4/3] overflow-hidden"
              style={{ borderRadius: 'var(--radius)' }}
            >
              {card.image && (
                <Image
                  src={card.image}
                  alt={card.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: card.imagePosition }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="mb-2 font-heading text-2xl font-bold">
                  {card.label}
                </h3>
                {card.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-white/80">
                    {card.description}
                  </p>
                )}
                {cardLink}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function PortraitCards({ content }: { content: PathCardsContent }) {
  const { eyebrow, heading, intro, cards } = content

  return (
    <section className="bg-[var(--color-background)] py-20 md:py-28">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-14 px-5 md:px-10">
        {(eyebrow || heading || intro) && (
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-3.5">
              {eyebrow && (
                <p className="m-0 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent-deep)]">
                  {eyebrow}
                </p>
              )}
              {heading && (
                <h2 className="font-heading m-0 text-[clamp(2.25rem,4.6vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.02em] text-[var(--color-secondary)]">
                  {heading}
                </h2>
              )}
            </div>
            {intro && (
              <p className="m-0 max-w-[42ch] text-base leading-relaxed text-[var(--color-foreground)]/75">
                {intro}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className="group flex flex-col gap-[18px] text-[var(--color-foreground)] transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-[var(--color-border)]">
                {card.image && (
                  <Image
                    src={card.image}
                    alt={card.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ objectPosition: card.imagePosition || 'center 20%' }}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="absolute bottom-4 left-4 h-1 w-12 bg-[var(--color-accent)]"
                />
              </div>
              <div>
                <h3 className="font-heading m-0 text-[26px] font-medium tracking-[-0.02em] text-[var(--color-secondary)]">
                  {card.label}
                </h3>
                {card.role && (
                  <p className="m-0 mb-2.5 mt-1.5 font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-accent-deep)]">
                    {card.role}
                  </p>
                )}
                {card.description && (
                  <p className="m-0 text-[15px] leading-[1.55] text-[var(--color-foreground)]/75">
                    {card.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
