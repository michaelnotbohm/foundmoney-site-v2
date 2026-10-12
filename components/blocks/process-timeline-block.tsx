import type { BlockProps, ProcessTimelineContent } from './types'

/**
 * Variants:
 *   default — vertical numbered timeline, centred
 *   columns — steps side by side under a 2px primary rule, mono STEP 01
 *             labels, left-aligned header; wraps to fewer columns as needed
 */
export function ProcessTimelineBlock({
  content,
  variant = 'default',
  embedded = false,
}: BlockProps<ProcessTimelineContent>) {
  const { eyebrow, heading, intro, steps } = content

  if (!steps || steps.length === 0) return null

  if (variant === 'columns') {
    const columns = (
      <div className="mx-auto flex max-w-[1240px] flex-col gap-14 px-5 md:px-10">
        {(eyebrow || heading || intro) && (
          <div className="flex max-w-3xl flex-col gap-3.5">
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
            {intro && (
              <p className="m-0 mt-1 text-[17px] leading-relaxed text-[var(--color-foreground)]/75">
                {intro}
              </p>
            )}
          </div>
        )}
        <ol className="m-0 flex list-none flex-wrap gap-8 p-0">
          {steps.map((step, i) => (
            <li
              key={i}
              className="flex min-w-0 flex-[1_1_220px] flex-col gap-3 border-t-2 border-[var(--color-primary)] pt-6"
            >
              <span className="font-mono text-[13px] text-[var(--color-accent-deep)]">
                STEP {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-heading m-0 text-2xl font-medium tracking-[-0.02em] text-[var(--color-secondary)]">
                {step.title}
              </h3>
              <p className="m-0 text-[15.5px] leading-relaxed text-[var(--color-foreground)]/75">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    )
    if (embedded) return columns
    return <section className="bg-[var(--color-background)] py-20 md:py-28">{columns}</section>
  }

  const inner = (
    <>
      {(heading || intro) && (
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {heading && (
            <h2 className="font-heading text-3xl font-bold text-[var(--color-secondary)] md:text-4xl">
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
            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-heading text-lg font-bold text-[var(--color-primary-foreground)]">
              {i + 1}
            </div>
            <div className="pt-1.5">
              <h3 className="font-heading text-xl font-bold text-[var(--color-secondary)]">
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
