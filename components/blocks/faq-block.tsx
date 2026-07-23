'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlockProps, FaqContent, FaqItem, FaqGroup } from './types'

/**
 * Variants:
 *   default | accordion — one flat list
 *   grouped             — themed sections, each with its own heading
 *
 * Emits FAQPage JSON-LD across every item regardless of variant. This is the
 * highest-leverage AEO structure on most sites: answer engines quote
 * question/answer pairs directly. Set content.emitSchema to false only when
 * the page already emits FAQPage from page.schema_json.
 */
export function FaqBlock({ content, variant = 'default' }: BlockProps<FaqContent>) {
  const { eyebrow = 'FAQs', heading, items, groups, emitSchema = true } = content
  const [openKey, setOpenKey] = useState<string | null>(null)

  const isGrouped = variant === 'grouped' && Array.isArray(groups) && groups.length > 0

  const normalizedGroups: FaqGroup[] = isGrouped
    ? groups!
    : items && items.length > 0
      ? [{ heading: '', items }]
      : []

  const allItems: FaqItem[] = normalizedGroups.flatMap((g) => g.items)

  if (allItems.length === 0) return null

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allItems
      .filter((item) => item.q?.trim() && item.a?.trim())
      .map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
  }

  return (
    <section className="bg-[var(--color-surface)] py-16 md:py-24">
      <div className="container mx-auto px-4">
        {(eyebrow || heading) && (
          <div className="mb-12 text-center">
            {eyebrow && (
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="font-[var(--font-heading)] text-4xl font-bold tracking-tight text-[var(--color-secondary)] md:text-5xl">
                {heading}
              </h2>
            )}
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-10">
          {normalizedGroups.map((group, groupIndex) => (
            <div key={group.heading || groupIndex}>
              {group.heading && (
                <div className="mb-5">
                  <h3 className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-secondary)] md:text-2xl">
                    {group.heading}
                  </h3>
                  {group.intro && (
                    <p className="mt-2 leading-relaxed text-[var(--color-muted)]">
                      {group.intro}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {group.items.map((item, index) => {
                  const key = `${groupIndex}-${index}`
                  const isOpen = openKey === key

                  return (
                    <div
                      key={key}
                      className="border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm transition-shadow hover:shadow-md"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenKey(isOpen ? null : key)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                      >
                        <span className="text-base font-semibold text-[var(--color-foreground)] md:text-lg">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={cn(
                            'h-5 w-5 shrink-0 text-[var(--color-muted)] transition-transform duration-200',
                            isOpen && 'rotate-180',
                          )}
                        />
                      </button>

                      <div
                        className={cn(
                          'grid transition-all duration-200 ease-out',
                          isOpen
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0',
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="px-6 pb-6 leading-[1.8] text-[var(--color-foreground)]/75">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {emitSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c'),
          }}
        />
      )}
    </section>
  )
}
