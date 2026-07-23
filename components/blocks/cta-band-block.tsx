import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BlockProps, CtaBandContent } from './types'

/**
 * Full-width conversion strip. The layered gradients derive entirely from
 * theme tokens, so the same markup reads as a navy lender band or a sage
 * advisory band depending on site_settings.theme.
 */
export function CtaBandBlock({ content }: BlockProps<CtaBandContent>) {
  const { headline, subhead, cta } = content

  if (!headline || !cta) return null

  return (
    <section className="bg-[var(--color-background)] px-4 py-12 md:py-16">
      <div className="container mx-auto">
        <div
          className="relative mx-auto max-w-5xl overflow-hidden shadow-xl shadow-black/10"
          style={{ borderRadius: 'calc(var(--radius) * 3)' }}
        >
          {/* Base gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, var(--color-secondary) 0%, color-mix(in srgb, var(--color-secondary) 78%, black) 100%)',
            }}
          />
          {/* Radial accent glow, upper right */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(110% 120% at 88% 12%, color-mix(in srgb, var(--color-primary) 55%, transparent) 0%, transparent 58%)',
            }}
          />
          {/* Faint grid texture */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Accent top rule */}
          <div className="absolute left-0 top-0 h-1 w-full bg-[var(--color-accent)]" />

          <div className="relative z-10 flex flex-col items-center gap-7 px-6 py-14 text-center md:px-12 md:py-16">
            <div className="max-w-2xl">
              <h2 className="font-[var(--font-heading)] text-3xl font-bold tracking-tight text-[var(--color-secondary-foreground)] md:text-4xl lg:text-5xl">
                {headline}
              </h2>
              {subhead && (
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--color-secondary-foreground)]/75 md:text-lg">
                  {subhead}
                </p>
              )}
            </div>

            <Button
              asChild
              size="lg"
              className="group h-auto bg-[var(--color-accent)] px-8 py-3.5 text-base font-semibold text-[var(--color-accent-foreground)] shadow-lg shadow-black/20 transition-all hover:bg-[var(--color-accent)]/90 hover:shadow-xl"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              <Link href={cta.href}>
                {cta.label}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
