'use client'

import { useState, useEffect, useRef } from 'react'
import type { BlockProps, ScanRevealContent } from './types'

// =============================================================================
// components/blocks/scan-reveal-block.tsx
//
// Columns that light up in sequence as the section enters the viewport, with a
// running tally of the items revealed. Reads as an audit finding things.
//
// All copy comes from section content, so the same component works for any
// three-part diagnostic — sources of unclaimed revenue, stages of a process,
// categories of risk. Ledger styling: header with intro and tally on the
// right, white numbered cards with ruled rows; colours are theme tokens
// (column ink/tint in content are no longer used by this layout).
//
// The replay button only renders when `replayLabel` is set in section content.
// Omit the key to remove the button entirely.
//
// Respects prefers-reduced-motion by rendering the finished state immediately
// rather than animating.
// =============================================================================

const SWEEP_MS = 1400

export function ScanRevealBlock({
  content,
  embedded = false,
}: BlockProps<ScanRevealContent>) {
  const { eyebrow, heading, intro, tallyLabel, replayLabel, columns = [] } = content

  const total = columns.reduce((n, c) => n + (c.items?.length ?? 0), 0)

  const [scanned, setScanned] = useState(-1)
  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(0)
  const hostRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const sweep = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setScanned(-1)
    setCount(0)
    setRunning(true)

    let tally = 0
    columns.forEach((col, i) => {
      timers.current.push(setTimeout(() => setScanned(i), 250 + i * SWEEP_MS))

      col.items?.forEach((_, j) => {
        timers.current.push(
          setTimeout(
            () => {
              tally += 1
              setCount(tally)
            },
            250 + i * SWEEP_MS + 260 + j * 190,
          ),
        )
      })
    })

    timers.current.push(
      setTimeout(() => setRunning(false), 250 + columns.length * SWEEP_MS),
    )
  }

  useEffect(() => {
    const el = hostRef.current
    if (!el || columns.length === 0) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()

        if (reduce) {
          setScanned(columns.length - 1)
          setCount(total)
        } else {
          sweep()
        }
      },
      { threshold: 0.25 },
    )

    io.observe(el)

    const pending = timers.current
    return () => {
      io.disconnect()
      pending.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns.length, total])

  if (columns.length === 0) return null

  const inner = (
    <div className="scan-wrap">
      <div className="scan-head">
        <div className="scan-head-main">
          {eyebrow && <p className="scan-eyebrow-top">{eyebrow}</p>}
          {heading && (
            <h2 id="scan-title" className="scan-title">
              {heading}
            </h2>
          )}
        </div>

        <div className="scan-head-side">
          {intro && <p className="scan-intro">{intro}</p>}
          <div className="scan-controls">
            <div className="scan-tally">
              <span className="scan-num">{String(count).padStart(2, '0')}</span>
              {tallyLabel && <span className="scan-tally-label">{tallyLabel}</span>}
            </div>
            {replayLabel && (
              <button
                type="button"
                className="scan-replay"
                onClick={sweep}
                disabled={running}
                aria-label="Replay the sequence"
              >
                {running ? 'Scanning…' : replayLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="scan-cols">
        {columns.map((col, i) => (
          <div key={col.label} className="scan-col" data-on={i <= scanned}>
            <span className="scan-index">{String(i + 1).padStart(2, '0')}</span>
            <p className="scan-eyebrow">{col.label}</p>
            {col.headline && <h3 className="scan-h">{col.headline}</h3>}
            <div className="scan-rows">
              {col.items?.map((item) => (
                <div key={item} className="scan-item">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <section
      ref={hostRef}
      aria-labelledby={heading ? 'scan-title' : undefined}
      className={embedded ? '' : 'scan-section'}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .scan-section {
              background: var(--color-background);
              padding: clamp(4.5rem, 9vw, 7.5rem) 0 clamp(3.5rem, 7vw, 6rem);
              color: var(--color-foreground);
            }
            .scan-wrap {
              max-width: 1240px; margin: 0 auto; padding: 0 clamp(1.25rem, 3vw, 2.5rem);
              display: flex; flex-direction: column; gap: clamp(2.5rem, 5vw, 4rem);
            }
            .scan-head {
              display: flex; flex-wrap: wrap; align-items: flex-end;
              justify-content: space-between; gap: 2rem;
            }
            .scan-head-main {
              flex: 1 1 620px; min-width: 0;
              display: flex; flex-direction: column; gap: 1.1rem;
            }
            .scan-head-side {
              flex: 0 1 360px; display: flex; flex-direction: column; gap: 1.5rem;
            }
            .scan-eyebrow-top {
              margin: 0; font-family: var(--font-mono), ui-monospace, monospace;
              font-size: .75rem; font-weight: 500; letter-spacing: .18em;
              text-transform: uppercase; color: var(--color-accent-deep);
            }
            .scan-title {
              margin: 0; max-width: 20ch;
              font-family: var(--font-heading), Georgia, serif;
              font-variation-settings: 'opsz' 144;
              font-size: clamp(2.25rem, 5vw, 3.5rem); line-height: 1.02;
              font-weight: 500; letter-spacing: -.02em;
              color: var(--color-secondary);
            }
            .scan-intro {
              margin: 0; font-size: 17px; line-height: 1.6;
              color: color-mix(in srgb, var(--color-foreground) 75%, transparent);
            }
            .scan-controls { display: flex; align-items: center; gap: 1.25rem; }
            .scan-tally { display: flex; align-items: baseline; gap: .6rem; white-space: nowrap; }
            .scan-num {
              /* Mono, not the display serif: Fraunces' optical sizing draws
                 the 8 top-heavy at this size and it reads as upside down. */
              font-family: var(--font-mono), ui-monospace, monospace;
              font-size: 2.125rem; font-weight: 500; line-height: 1;
              font-variant-numeric: tabular-nums;
              color: var(--color-accent-deep);
            }
            .scan-tally-label {
              font-size: .875rem; line-height: 1.35; color: var(--color-muted);
              max-width: 160px; white-space: normal;
            }
            .scan-replay {
              border: 1px solid var(--color-border); background: transparent;
              border-radius: var(--radius-button); padding: .55rem 1.15rem;
              font: inherit; font-size: .82rem; color: var(--color-muted);
              cursor: pointer; transition: border-color .25s, color .25s;
            }
            .scan-replay:hover:not(:disabled) {
              border-color: var(--color-foreground); color: var(--color-foreground);
            }
            .scan-replay:disabled { opacity: .45; cursor: default; }

            .scan-cols {
              display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: clamp(1.25rem, 3vw, 2.5rem);
            }
            @media (max-width: 860px) {
              .scan-cols { grid-template-columns: minmax(0, 1fr); }
            }
            .scan-col {
              display: flex; flex-direction: column; gap: 1.25rem;
              padding: 36px 32px; border-radius: 14px;
              background: var(--card, #FFFFFF); border: 1px solid var(--color-border);
              transition: transform .25s, box-shadow .25s;
            }
            .scan-col:hover { transform: translateY(-4px); box-shadow: 0 24px 50px rgba(20,26,23,.12); }
            .scan-index {
              font-family: var(--font-heading), Georgia, serif;
              font-variation-settings: 'opsz' 144;
              font-size: 64px; line-height: 1; font-weight: 300;
              color: var(--color-border); transition: color .6s ease;
            }
            .scan-col[data-on="true"] .scan-index { color: var(--color-accent-deep); }
            .scan-eyebrow {
              margin: 0; font-family: var(--font-mono), ui-monospace, monospace;
              font-size: .75rem; letter-spacing: .18em; text-transform: uppercase;
              color: var(--color-muted);
            }
            .scan-h {
              margin: 0; font-family: var(--font-heading), Georgia, serif;
              font-variation-settings: 'opsz' 144;
              font-size: 26px; line-height: 1.15; font-weight: 500; letter-spacing: -.02em;
              color: var(--color-secondary);
            }
            .scan-rows { display: flex; flex-direction: column; }
            .scan-item {
              padding: 14px 0; border-bottom: 1px solid rgba(20,26,23,.1);
              font-size: 15px; line-height: 1.5; color: var(--color-foreground);
              opacity: .35; transform: translateY(6px);
              transition: opacity .5s ease, transform .5s ease;
            }
            .scan-item:last-child { border-bottom: 0; }
            .scan-col[data-on="true"] .scan-item { opacity: 1; transform: none; }
            .scan-col[data-on="true"] .scan-item:nth-child(2) { transition-delay: .08s; }
            .scan-col[data-on="true"] .scan-item:nth-child(3) { transition-delay: .16s; }
            .scan-col[data-on="true"] .scan-item:nth-child(4) { transition-delay: .24s; }
            .scan-col[data-on="true"] .scan-item:nth-child(5) { transition-delay: .32s; }

            @media (prefers-reduced-motion: reduce) {
              .scan-item, .scan-index, .scan-col { transition: none; }
            }
          `,
        }}
      />
      {inner}
    </section>
  )
}
