import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { BlockProps, CtaBandContent } from './types'

/**
 * Full-bleed closing band: dark secondary ground with grain and a soft
 * radial glow in the accent colour, a large display headline, one accent
 * pill, and an optional mono reassurance line. Every colour is a theme token,
 * so the same band reads as brass-on-evergreen here and something else on
 * another client's palette.
 */
export function CtaBandBlock({ content }: BlockProps<CtaBandContent>) {
  const { eyebrow, headline, subhead, cta, note } = content

  if (!headline || !cta) return null

  return (
    <section className="grain relative overflow-hidden bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] rounded-full"
        style={{
          transform: 'translate(-50%, -40%)',
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 22%, transparent) 0%, transparent 60%)',
        }}
      />

      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-7 px-5 py-24 text-center md:px-10 md:py-32">
        {eyebrow && (
          <p className="m-0 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
            {eyebrow}
          </p>
        )}

        <h2
          className="m-0 max-w-[16ch] text-[clamp(2.5rem,6vw,4.25rem)] font-medium leading-[0.98]"
          style={{ fontVariationSettings: "'opsz' 144", letterSpacing: '-0.02em' }}
        >
          {headline}
        </h2>

        {subhead && (
          <p className="m-0 max-w-[54ch] text-[17px] leading-relaxed text-[var(--color-secondary-foreground)]/75 md:text-lg">
            {subhead}
          </p>
        )}

        <Link
          href={cta.href}
          className="group inline-flex min-h-[60px] max-w-full items-center justify-center gap-2.5 px-[34px] py-3 text-center md:whitespace-nowrap text-[17px] font-semibold text-[var(--color-accent-foreground)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px"
          style={{
            background: 'var(--color-accent)',
            borderRadius: 'var(--radius-button)',
            boxShadow: '0 10px 30px color-mix(in srgb, var(--color-accent) 25%, transparent)',
          }}
        >
          {cta.label}
          <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
        </Link>

        {note && (
          <p className="m-0 font-mono text-[12.5px] tracking-[0.06em] text-[var(--color-secondary-foreground)]/50">
            {note}
          </p>
        )}
      </div>
    </section>
  )
}
