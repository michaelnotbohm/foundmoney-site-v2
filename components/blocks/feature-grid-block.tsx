import Link from 'next/link'
import {
  ArrowRight,
  Home,
  DollarSign,
  Shield,
  FileText,
  Users,
  TrendingUp,
  Building,
  Key,
  Briefcase,
  Heart,
  Clock,
  Share2,
  Link2,
  Mail,
  Target,
  Handshake,
  Search,
  MessageCircle,
  BarChart3,
  Compass,
  Lightbulb,
  Award,
} from 'lucide-react'
import type { BlockProps, FeatureGridContent } from './types'

/**
 * Icon names are stored as strings in section content so a non-technical
 * editor can pick one without touching code. Add to this map rather than
 * importing icons at the call site.
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  dollar: DollarSign,
  shield: Shield,
  file: FileText,
  users: Users,
  trending: TrendingUp,
  building: Building,
  key: Key,
  briefcase: Briefcase,
  heart: Heart,
  clock: Clock,
  share: Share2,
  link: Link2,
  mail: Mail,
  target: Target,
  handshake: Handshake,
  search: Search,
  message: MessageCircle,
  chart: BarChart3,
  compass: Compass,
  idea: Lightbulb,
  award: Award,
}

export function FeatureGridBlock({
  content,
  variant = 'default',
}: BlockProps<FeatureGridContent>) {
  const { heading, subheading, intro, items } = content

  if (!items || items.length === 0) return null

  const isCards = variant === 'cards'
  const isWhyUs = variant === 'why-us'

  if (variant === 'bento') return <BentoGrid content={content} />

  if (isWhyUs) {
    return (
      <section className="bg-[var(--color-background)] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            {heading && (
              <h2 className="mb-4 font-heading text-3xl font-bold text-[var(--color-secondary)] md:text-4xl">
                {heading}
              </h2>
            )}
            {(intro || subheading) && (
              <p className="text-lg leading-relaxed text-[var(--color-foreground)]/70">
                {intro || subheading}
              </p>
            )}
          </div>

          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const Icon = item.icon ? iconMap[item.icon] : null
              return (
                <div key={index} className="flex flex-col">
                  <div className="mb-3 flex items-center gap-3">
                    {Icon && (
                      <Icon className="h-6 w-6 shrink-0 text-[var(--color-accent-deep)]" />
                    )}
                    <h3 className="font-heading text-lg font-bold text-[var(--color-secondary)]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="leading-relaxed text-[var(--color-foreground)]/70">
                    {item.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {(heading || subheading) && (
          <div className="mb-12 text-center">
            {heading && (
              <h2 className="mb-4 font-heading text-3xl font-bold text-[var(--color-foreground)] md:text-4xl">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mx-auto max-w-2xl text-lg text-[var(--color-muted)]">
                {subheading}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon ? iconMap[item.icon] : null

            const cardContent = (
              <>
                {Icon && (
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center bg-[var(--color-primary)]/10"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <Icon className="h-6 w-6 text-[var(--color-primary)]" />
                  </div>
                )}
                <h3 className="mb-2 font-heading text-xl font-semibold text-[var(--color-foreground)]">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-[var(--color-muted)]">
                  {item.body}
                </p>
                {item.href && (
                  <span className="inline-flex items-center text-sm font-medium text-[var(--color-primary)] group-hover:underline">
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </>
            )

            const cardClassName = `group p-6 transition-all ${
              isCards
                ? 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-lg'
                : 'hover:bg-[var(--color-surface)]'
            } ${item.href ? 'cursor-pointer' : ''}`

            if (item.href) {
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cardClassName}
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  {cardContent}
                </Link>
              )
            }

            return (
              <div
                key={index}
                className={cardClassName}
                style={{ borderRadius: 'var(--radius)' }}
              >
                {cardContent}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/**
 * Bento: a 6-column grid. The first two items span 3 columns, the rest span
 * 2, so five items read 3+3 / 2+2+2. Items 1 and 5 (every fourth from the
 * first) sit on the primary colour, the rest on white. Mono index, Fraunces
 * title, one-liner, and the item's own link label. Stacks to one column on
 * small screens.
 */
function BentoGrid({ content }: { content: FeatureGridContent }) {
  const { eyebrow, heading, intro, subheading, items, ctaLabel = 'Learn more' } = content
  const lede = intro || subheading

  return (
    <section className="bg-[var(--color-surface)] py-20 md:py-[104px]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-12 px-5 md:px-10">
        {(eyebrow || heading || lede) && (
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
            {lede && (
              <p className="m-0 max-w-[40ch] text-base leading-relaxed text-[var(--color-foreground)]/75">
                {lede}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
          {items.map((item, i) => {
            const dark = i % 4 === 0
            const span = i < 2 ? 'md:col-span-3' : 'md:col-span-2'
            const label = item.ctaLabel || ctaLabel
            const card = (
              <>
                <div>
                  <span
                    className={`font-mono text-xs tracking-[0.14em] ${
                      dark ? 'text-[var(--color-accent)]' : 'text-[var(--color-accent-deep)]'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className={`font-heading mb-2 mt-3 text-[28px] font-medium leading-[1.1] tracking-[-0.02em] ${
                      dark ? '' : 'text-[var(--color-secondary)]'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`m-0 text-[15.5px] leading-[1.55] ${
                      dark ? 'opacity-80' : 'text-[var(--color-foreground)]/75'
                    }`}
                  >
                    {item.body}
                  </p>
                </div>
                {item.href && (
                  <span
                    className={`mt-6 flex items-center gap-2 text-sm font-semibold ${
                      dark ? 'text-[var(--color-accent)]' : 'text-[var(--color-primary)]'
                    }`}
                  >
                    {label}
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </>
            )
            const className = `group flex min-h-[300px] flex-col justify-between rounded-[12px] p-8 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(20,26,23,.12)] ${span} ${
              dark
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                : 'border border-[var(--color-border)] bg-white text-[var(--color-foreground)]'
            }`
            return item.href ? (
              <Link key={i} href={item.href} className={className}>
                {card}
              </Link>
            ) : (
              <div key={i} className={className}>
                {card}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
