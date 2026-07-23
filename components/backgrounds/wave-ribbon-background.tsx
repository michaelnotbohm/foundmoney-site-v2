'use client'

import { useEffect, useRef } from 'react'

// =============================================================================
// components/backgrounds/wave-ribbon-background.tsx
//
// A parametric surface rendered as a wireframe mesh on a 2D canvas. Two
// families of lines — longitudinal (along the ribbon) and lateral (across it)
// — cross to produce the lattice/moire interference. The surface is displaced
// by layered sines and projected with a mild perspective skew so the far edge
// reads as depth.
//
// Not a noise flow field: neighbouring lines stay ordered and adjacent, which
// is what makes it read as one coherent ribbon rather than scattered strands.
//
// A few KB of JS rather than a multi-megabyte video. Respects
// prefers-reduced-motion by rendering a single static frame.
// =============================================================================

export interface WaveRibbonBackgroundProps {
  /** Lines running along the ribbon. Thickens the surface. */
  longitudinalLines?: number
  /** Lines running across it — the fine cross-hatch. Primary density lever. */
  lateralLines?: number
  /** Sample points per longitudinal line. Lower this before lowering line counts if perf suffers. */
  segments?: number

  /** Vertical displacement, as a fraction of height. */
  amplitude?: number
  /** Wave cycles across the viewport. */
  frequency?: number
  /** Ribbon thickness, as a fraction of height. */
  ribbonWidth?: number
  /** How much the ribbon rolls along its length. */
  twist?: number
  /** Lateral compression toward the far edge — this is what reads as depth. */
  perspective?: number

  /** Vertical centre of the ribbon, 0..1. */
  centerY?: number
  /** Diagonal lean, as a fraction of height. */
  tilt?: number

  strokeColor?: string
  backgroundColor?: string
  lineOpacity?: number
  lineWidth?: number
  /** Fraction of each end faded to transparent. */
  edgeFade?: number

  speed?: number

  className?: string
  style?: React.CSSProperties
}

export function WaveRibbonBackground({
  longitudinalLines = 46,
  lateralLines = 150,
  segments = 150,
  amplitude = 0.16,
  frequency = 1.5,
  ribbonWidth = 0.34,
  twist = 0.55,
  perspective = 0.42,
  centerY = 0.58,
  tilt = -0.1,
  strokeColor = '#7C9086',
  backgroundColor = '#FCFCFB',
  lineOpacity = 0.26,
  lineWidth = 0.6,
  edgeFade = 0.3,
  speed = 0.00006,
  className = '',
  style,
}: WaveRibbonBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const reduceMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

    let width = 0
    let height = 0
    let running = true

    // Parse the stroke colour once so per-line alpha is cheap.
    const parseColor = (c: string): [number, number, number] => {
      const hex = c.replace('#', '')
      const full =
        hex.length === 3
          ? hex
              .split('')
              .map((ch) => ch + ch)
              .join('')
          : hex
      return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16),
      ]
    }
    const [sr, sg, sb] = parseColor(strokeColor)

    // u: 0..1 across the ribbon (short axis)
    // v: 0..1 along the ribbon (long axis, left to right)
    const point = { x: 0, y: 0 }

    const surfacePoint = (u: number, v: number, t: number) => {
      const cx = v * width * 1.35 - width * 0.18

      // Layered sines give the ribbon its organic, non-repeating roll.
      const wave =
        Math.sin(v * Math.PI * 2 * frequency + t) * 0.62 +
        Math.sin(v * Math.PI * 2 * frequency * 1.9 + t * 1.4) * 0.26 +
        Math.sin(v * Math.PI * 2 * frequency * 0.55 - t * 0.7) * 0.32

      // The short axis is scaled and sheared as a function of v, producing
      // the pinch-and-flare that reads as a 3D surface.
      const roll = Math.sin(v * Math.PI * 2 * frequency * 0.8 + t * 0.9)
      const spread = 1 - perspective * (0.5 + 0.5 * roll)

      const centered = u - 0.5
      const baseY =
        centerY * height + wave * amplitude * height + (v - 0.5) * tilt * height

      point.x = cx + centered * ribbonWidth * height * twist * roll * 0.5
      point.y = baseY + centered * ribbonWidth * height * spread
    }

    const fadeAt = (p: number) => {
      if (edgeFade <= 0) return 1
      const a = Math.min(p, 1 - p) / edgeFade
      return Math.max(0, Math.min(1, a))
    }

    const drawFrame = (time: number) => {
      const t = time * speed

      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)

      ctx.lineWidth = lineWidth
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      // Longitudinal lines
      for (let i = 0; i < longitudinalLines; i++) {
        const u = longitudinalLines === 1 ? 0.5 : i / (longitudinalLines - 1)

        // Lines near the ribbon edges are fainter, softening the silhouette.
        const edgeWeight = 0.55 + 0.45 * Math.sin(u * Math.PI)
        ctx.strokeStyle = `rgba(${sr},${sg},${sb},${lineOpacity * edgeWeight})`

        ctx.beginPath()
        for (let s = 0; s <= segments; s++) {
          surfacePoint(u, s / segments, t)
          if (s === 0) ctx.moveTo(point.x, point.y)
          else ctx.lineTo(point.x, point.y)
        }
        ctx.stroke()
      }

      // Lateral lines — the lattice
      for (let j = 0; j < lateralLines; j++) {
        const v = lateralLines === 1 ? 0.5 : j / (lateralLines - 1)

        const alpha = lineOpacity * fadeAt(v) * 0.72
        if (alpha < 0.004) continue

        ctx.strokeStyle = `rgba(${sr},${sg},${sb},${alpha})`

        ctx.beginPath()
        for (let i = 0; i <= 10; i++) {
          surfacePoint(i / 10, v, t)
          if (i === 0) ctx.moveTo(point.x, point.y)
          else ctx.lineTo(point.x, point.y)
        }
        ctx.stroke()
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Repaint synchronously so a resize never shows a blank or stretched
      // frame before the next animation tick.
      drawFrame(performance.now())
    }

    const loop = (time: number) => {
      if (!running) return
      drawFrame(time)
      frameRef.current = requestAnimationFrame(loop)
    }

    const start = () => {
      cancelAnimationFrame(frameRef.current)
      if (reduceMotionQuery.matches) {
        drawFrame(0)
      } else {
        running = true
        frameRef.current = requestAnimationFrame(loop)
      }
    }

    resize()
    start()

    const observer = new ResizeObserver(() => {
      resize()
      if (reduceMotionQuery.matches) drawFrame(0)
    })
    observer.observe(canvas)

    const onMotionChange = () => {
      running = false
      cancelAnimationFrame(frameRef.current)
      start()
    }
    reduceMotionQuery.addEventListener('change', onMotionChange)

    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
      observer.disconnect()
      reduceMotionQuery.removeEventListener('change', onMotionChange)
    }
  }, [
    longitudinalLines,
    lateralLines,
    segments,
    amplitude,
    frequency,
    ribbonWidth,
    twist,
    perspective,
    centerY,
    tilt,
    strokeColor,
    backgroundColor,
    lineOpacity,
    lineWidth,
    edgeFade,
    speed,
  ])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}
