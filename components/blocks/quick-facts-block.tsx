import type { BlockProps, QuickFactsContent } from './types'

export function QuickFactsBlock({
  content,
  embedded = false,
}: BlockProps<QuickFactsContent>) {
  const { heading, facts } = content

  if (!facts || facts.length === 0) return null

  const inner = (
    <>
      {heading && (
        <h2 className="mb-8 text-center font-[var(--font-heading)] text-2xl font-bold text-[var(--color-secondary)] md:text-3xl">
          {heading}
        </h2>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact, i) => (
          <div
            key={i}
            className="border border-[var(--color-border)] bg-[var(--color-background)] p-6 text-center shadow-sm"
            style={{ borderRadius: 'calc(var(--radius) * 2)' }}
          >
            <div className="font-[var(--font-heading)] text-3xl font-bold text-[var(--color-primary)] md:text-4xl">
              {fact.value}
            </div>
            <div className="mt-2 text-sm font-semibold text-[var(--color-secondary)]">
              {fact.label}
            </div>
            {fact.detail && (
              <div className="mt-1 text-xs text-[var(--color-foreground)]/60">
                {fact.detail}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )

  if (embedded) return <div className="w-full">{inner}</div>

  return (
    <section className="bg-[var(--color-surface)] py-12 md:py-16">
      <div className="container mx-auto px-4">{inner}</div>
    </section>
  )
}
