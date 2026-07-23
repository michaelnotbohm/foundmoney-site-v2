'use client'

import { useState } from 'react'
import {
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
  Check,
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
import { cn } from '@/lib/utils'
import type { BlockProps, TabbedPanelsContent } from './types'

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

/**
 * Numbered tabs over three panel shapes: prose, an icon grid, or a checklist.
 *
 * Generic replacement for the lending-specific "Loan 101" block. Panel labels,
 * count, and kinds all come from content, so the same component serves
 * "Who it's for / Benefits / Eligibility" for a lender and "Discovery / Audit
 * / Implementation" for an advisory firm.
 */
export function TabbedPanelsBlock({ content }: BlockProps<TabbedPanelsContent>) {
  const { heading, panels = [] } = content
  const [active, setActive] = useState(0)

  if (panels.length === 0) return null

  const current = panels[active] ?? panels[0]

  return (
    <section className="bg-[var(--color-surface)] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {heading && (
            <h2 className="mb-10 text-center font-[var(--font-heading)] text-3xl font-bold tracking-tight text-[var(--color-secondary)] md:text-4xl">
              {heading}
            </h2>
          )}

          <div
            className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm"
            style={{ borderRadius: 'calc(var(--radius) * 3)' }}
          >
            <div
              className="grid grid-cols-1 border-b border-[var(--color-border)]"
              style={{
                gridTemplateColumns: `repeat(${Math.min(panels.length, 4)}, minmax(0, 1fr))`,
              }}
              role="tablist"
            >
              {panels.map((panel, index) => {
                const isActive = active === index
                return (
                  <button
                    key={panel.label}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(index)}
                    className={cn(
                      'flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-5 text-left transition-colors last:border-r-0 sm:border-b-0 sm:border-r',
                      isActive
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-surface)]',
                    )}
                  >
                    <span
                      className={cn(
                        'font-[var(--font-heading)] text-2xl font-bold',
                        isActive
                          ? 'text-[var(--color-primary-foreground)]/80'
                          : 'text-[var(--color-primary)]',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-semibold">{panel.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="p-6 md:p-10" role="tabpanel">
              {current.kind === 'prose' && (
                <div>
                  {current.heading && (
                    <h3 className="mb-4 font-[var(--font-heading)] text-xl font-bold text-[var(--color-secondary)] md:text-2xl">
                      {current.heading}
                    </h3>
                  )}
                  {current.body && (
                    <p className="whitespace-pre-line text-lg leading-[1.8] text-[var(--color-foreground)]/80">
                      {current.body}
                    </p>
                  )}
                </div>
              )}

              {current.kind === 'grid' && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {(current.items ?? []).map((item, i) => {
                    const Icon = item.icon ? iconMap[item.icon] : null
                    return (
                      <div key={i} className="flex gap-4">
                        {Icon && (
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--color-primary)]/10"
                            style={{ borderRadius: 'var(--radius)' }}
                          >
                            <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                          </div>
                        )}
                        <div>
                          <h4 className="mb-1 font-semibold text-[var(--color-foreground)]">
                            {item.title}
                          </h4>
                          <p className="text-sm leading-relaxed text-[var(--color-foreground)]/75">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {current.kind === 'checklist' && (
                <ul className="space-y-3">
                  {(current.points ?? []).map((point, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-lg text-[var(--color-foreground)]/80"
                    >
                      <Check className="mt-1 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
