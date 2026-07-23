import type { BlockProps, ProcessTimelineContent } from './types'

export function ProcessTimelineBlock({
  content,
  embedded = false,
}: BlockProps<ProcessTimelineContent>) {
  const { heading, intro, steps } = content

  if (!steps || steps.length === 0) return null

  const inner = (
    <>
      {(heading || intro) && (
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {heading && (
            <h2 className="font-[var(--font-heading)] text-3xl font-bold text-[var(--color-secondary)] md:text-4xl">
              {heading}
            </h2>
          )}
          {intro && (
            <p className="mt-4 text-lg leading-relaxed text-[var(--color-foreground)]/70">
              {intro}
            </p>
          )}
        </div>
      )}

      <ol className="mx-auto max-w-2xl">
        {steps.map((step, i) => (
          <li key={i} className="relative flex gap-6 pb-10 last:pb-0">
            {i < steps.length - 1 && (
              <div
                className="absolute left-6 top-12 h-full w-px bg-[var(--color-border)]"
                aria-hidden="true"
              />
            )}
            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-[var(--font-heading)] text-lg font-bold text-[var(--color-primary-foreground)]">
              {i + 1}
            </div>
            <div className="pt-1.5">
              <h3 className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-secondary)]">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-[var(--color-foreground)]/70">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </>
  )

  if (embedded) return <div className="w-full">{inner}</div>

  return (
    <section className="bg-[var(--color-background)] py-16 md:py-24">
      <div className="container mx-auto px-4">{inner}</div>
    </section>
  )
}
