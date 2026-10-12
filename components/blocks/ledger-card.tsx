'use client'

import { useEffect, useRef, useState } from 'react'
import type { LedgerCardContent } from './types'

// A "statement" card: ruled rows, each checked off as it lands, with a running
// total in the mono face. One pass on first view, after the surrounding copy
// has risen in; no replay. prefers-reduced-motion renders the final state.
//
// The total is rows.length — never a typed-in number — so the card can't
// disagree with itself. Colours are theme tokens; the card is ivory on any
// ground.

const ROW_INTERVAL_MS = 120

interface LedgerCardProps extends LedgerCardContent {
  /** Delay before the first row, so the card's own rise-in finishes first. */
  startDelay?: number
  className?: string
}

export function LedgerCard({
  title,
  tag,
  rows,
  totalLabel,
  startDelay = 600,
  className,
}: LedgerCardProps) {
  const total = rows.length
  const [shown, setShown] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node || total === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(total)
      return
    }

    let startTimer: ReturnType<typeof setTimeout> | undefined
    let stepTimer: ReturnType<typeof setInterval> | undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        startTimer = setTimeout(() => {
          let count = 0
          stepTimer = setInterval(() => {
            count += 1
            setShown(count)
            if (count >= total) clearInterval(stepTimer)
          }, ROW_INTERVAL_MS)
        }, startDelay)
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      clearTimeout(startTimer)
      clearInterval(stepTimer)
    }
  }, [total, startDelay])

  if (total === 0) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div
      ref={ref}
      className={className}
      style={{
        background: 'var(--color-background)',
        color: 'var(--color-foreground)',
        borderRadius: 14,
        padding: '30px 32px 24px',
        boxShadow:
          '0 40px 80px rgba(0,0,0,.35), 0 0 0 1px color-mix(in srgb, var(--color-accent) 35%, transparent)',
        transform: 'rotate(-1.2deg)',
      }}
    >
      {(title || tag) && (
        <div
          className="flex items-baseline justify-between pb-3"
          style={{ borderBottom: '2px solid var(--color-secondary)' }}
        >
          {title && (
            <span
              className="font-heading text-xl font-semibold"
            >
              {title}
            </span>
          )}
          {tag && (
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {tag}
            </span>
          )}
        </div>
      )}

      <ul className="m-0 list-none p-0">
        {rows.map((row, i) => {
          const on = i < shown
          return (
            <li
              key={`${i}-${row}`}
              className="flex items-baseline justify-between gap-4 py-3.5 text-[15px] leading-snug"
              style={{
                borderBottom:
                  i < total - 1 ? '1px solid rgba(20,26,23,.1)' : undefined,
                opacity: on ? 1 : 0,
                transform: on ? 'none' : 'translateY(6px)',
                transition: 'opacity .35s ease, transform .35s ease',
              }}
            >
              <span>{row}</span>
              <span
                aria-hidden="true"
                className="font-mono text-[var(--color-primary)]"
                style={{
                  display: 'inline-block',
                  opacity: on ? 1 : 0,
                  transform: on ? 'scale(1)' : 'scale(.4)',
                  transition:
                    'opacity .25s ease .12s, transform .3s cubic-bezier(.2,1.6,.4,1) .12s',
                }}
              >
                &#10003;
              </span>
            </li>
          )
        })}
      </ul>

      <div
        className="mt-1.5 flex items-baseline justify-between pt-3.5"
        style={{ borderTop: '2px solid var(--color-secondary)' }}
      >
        {totalLabel && <span className="font-semibold">{totalLabel}</span>}
        <span
          className="ml-auto font-mono text-[34px] font-medium tabular-nums text-[var(--color-accent-deep)]"
          aria-label={String(total)}
        >
          {pad(shown)}
        </span>
      </div>
    </div>
  )
}
