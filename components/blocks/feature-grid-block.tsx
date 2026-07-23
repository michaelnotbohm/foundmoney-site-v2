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

  if (isWhyUs) {
    return (
      <section className="bg-[var(--color-background)] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            {heading && (
              <h2 className="mb-4 font-[var(--font-heading)] text-3xl font-bold text-[var(--color-secondary)] md:text-4xl">
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
                      <Icon className="h-6 w-6 shrink-0 text-[var(--color-accent)]" />
                    )}
                    <h3 className="font-[var(--font-heading)] text-lg font-bold text-[var(--color-secondary)]">
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
              <h2 className="mb-4 font-[var(--font-heading)] text-3xl font-bold text-[var(--color-foreground)] md:text-4xl">
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
                <h3 className="mb-2 font-[var(--font-heading)] text-xl font-semibold text-[var(--color-foreground)]">
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
