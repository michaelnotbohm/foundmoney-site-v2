'use client'

import { useState, useEffect, useRef } from 'react'
import type { BlockProps, ScanRevealContent } from './types'

// =============================================================================
// components/blocks/scan-reveal-block.tsx
//
// Columns that light up in sequence as the section enters the viewport, with a
// running tally of the items revealed. Reads as an audit finding things.
//
// All copy and colours come from section content, so the same component works
// for any three-part diagnostic — sources of unclaimed revenue, stages of a
// process, categories of risk.
//
// Respects prefers-reduced-motion by rendering the finished state immediately
// rather than animating.
// =============================================================================

const SWEEP_MS = 1400

export function ScanRevealBlock({
  content,
  embedded = false,
}: BlockProps<ScanRevealContent>) {
  const { eyebrow, heading, tallyLabel, replayLabel, columns = [] } = content

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
        <div style={{ maxWidth: 620 }}>
          {eyebrow && <p className="scan-eyebrow-top">{eyebrow}</p>}
          {heading && (
            <h2 id="scan-title" className="scan-title">
              {heading}
            </h2>
          )}
        </div>

        <div className="scan-controls">
          <div className="scan-tally">
            <span className="scan-num">{count}</span>
            {tallyLabel && <span className="scan-tally-label">{tallyLabel}</span>}
          </div>
          <button
            type="button"
            className="scan-replay"
            onClick={sweep}
            disabled={running}
            aria-label="Replay the sequence"
          >
            {running ? 'Scanning…' : (replayLabel ?? 'Run again')}
          </button>
        </div>
      </div>

      <div className="scan-cols">
        {columns.map((col, i) => (
          <div
            key={col.label}
            className="scan-col"
            data-on={i <= scanned}
            style={
              {
                '--ink': col.ink || 'var(--color-primary)',
                '--tint': col.tint || 'var(--color-surface)',
              } as React.CSSProperties
            }
          >
            <span className="scan-bar" />
            <p className="scan-eyebrow">
              <span>{String(i + 1).padStart(2, '0')}</span>
              <span>{col.label}</span>
            </p>
            {col.headline && <h3 className="scan-h">{col.headline}</h3>}
            {col.items?.map((item) => (
              <div key={item} className="scan-item">
                <span className="scan-tick" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
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
              padding: clamp(2.5rem, 6vw, 5rem) clamp(1.25rem, 4vw, 3rem);
              color: var(--color-foreground);
              font-family: var(--font-body), system-ui, sans-serif;
            }
            .scan-wrap { max-width: 1140px; margin: 0 auto; }
            .scan-head {
              display: flex; flex-wrap: wrap; align-items: flex-end;
              justify-content: space-between; gap: 1.5rem;
              margin-bottom: clamp(2rem, 4vw, 3rem);
            }
            .scan-eyebrow-top {
              margin: 0 0 .8rem; font-size: .78rem; letter-spacing: .18em;
              text-transform: uppercase; color: var(--color-muted);
            }
            .scan-title {
              margin: 0; font-family: var(--font-heading), Georgia, serif;
              font-size: clamp(1.8rem, 4vw, 2.9rem); line-height: 1.15;
              font-weight: 600; letter-spacing: -.02em;
              color: var(--color-secondary);
            }
            .scan-controls { display: flex; align-items: center; gap: 1.25rem; }
            .scan-tally {
              display: flex; align-items: baseline; gap: .6rem; white-space: nowrap;
            }
            .scan-num {
              font-family: var(--font-heading), Georgia, serif;
              font-size: clamp(2.4rem, 5vw, 3.4rem); font-weight: 600;
              letter-spacing: -.03em; line-height: 1;
              font-variant-numeric: tabular-nums;
              color: var(--color-secondary);
            }
            .scan-tally-label {
              font-size: .9rem; line-height: 1.35; color: var(--color-muted);
              max-width: 140px; white-space: normal;
            }
            .scan-replay {
              border: 1px solid var(--color-border); background: transparent;
              border-radius: var(--radius-button); padding: .55rem 1.15rem;
              font: inherit; font-size: .82rem; color: var(--color-muted);
              cursor: pointer; transition: border-color .25s, color .25s;
            }
            .scan-replay:hover:not(:disabled) {
              border-color: var(--color-foreground);
              color: var(--color-foreground);
            }
            .scan-replay:disabled { opacity: .45; cursor: default; }

            .scan-cols {
              display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: clamp(1rem, 2.5vw, 2rem); position: relative;
            }
            @media (max-width: 820px) {
              .scan-cols { grid-template-columns: minmax(0, 1fr); }
            }
            .scan-col {
              position: relative; border-top: 2px solid var(--color-border);
              padding-top: 1.25rem; transition: border-color .5s ease;
            }
            .scan-col[data-on="true"] { border-top-color: var(--ink); }
            .scan-bar {
              position: absolute; top: -2px; left: 0; height: 2px; width: 0;
              background: var(--ink);
              transition: width .9s cubic-bezier(.65, 0, .35, 1);
            }
            .scan-col[data-on="true"] .scan-bar { width: 100%; }
            .scan-eyebrow {
              display: flex; align-items: baseline; gap: .6rem; margin: 0 0 .5rem;
              font-size: .75rem; letter-spacing: .18em; text-transform: uppercase;
              color: var(--color-muted); transition: color .5s ease;
            }
            .scan-col[data-on="true"] .scan-eyebrow { color: var(--ink); }
            .scan-h {
              margin: 0 0 1.4rem;
              font-family: var(--font-heading), Georgia, serif;
              font-size: clamp(1.05rem, 1.7vw, 1.25rem); line-height: 1.35;
              font-weight: 600; letter-spacing: -.01em;
              color: var(--color-muted); transition: color .5s ease;
            }
            .scan-col[data-on="true"] .scan-h { color: var(--color-secondary); }
            .scan-item {
              display: flex; gap: .7rem; padding: .85rem .9rem;
              margin-bottom: .55rem; border-radius: var(--radius);
              background: transparent; opacity: .4; transform: translateY(6px);
              transition: opacity .5s ease, transform .5s ease,
                background-color .5s ease;
              font-size: .94rem; line-height: 1.55;
              color: var(--color-foreground);
            }
            .scan-col[data-on="true"] .scan-item {
              opacity: 1; transform: none; background: var(--tint);
            }
            .scan-col[data-on="true"] .scan-item:nth-child(2) { transition-delay: .08s; }
            .scan-col[data-on="true"] .scan-item:nth-child(3) { transition-delay: .16s; }
            .scan-col[data-on="true"] .scan-item:nth-child(4) { transition-delay: .24s; }
            .scan-col[data-on="true"] .scan-item:nth-child(5) { transition-delay: .32s; }
            .scan-tick {
              flex: none; width: 16px; height: 16px; margin-top: .18em;
              border-radius: 50%; border: 1.5px solid currentColor;
              color: var(--color-border); position: relative;
              transition: color .4s ease;
            }
            .scan-col[data-on="true"] .scan-tick { color: var(--ink); }
            .scan-tick::after {
              content: ""; position: absolute; inset: 3px; border-radius: 50%;
              background: currentColor; opacity: 0;
              transition: opacity .4s ease .15s;
            }
            .scan-col[data-on="true"] .scan-tick::after { opacity: 1; }

            @media (prefers-reduced-motion: reduce) {
              .scan-item, .scan-bar, .scan-h, .scan-eyebrow, .scan-tick {
                transition: none;
              }
            }
          `,
        }}
      />
      {inner}
    </section>
  )
}
