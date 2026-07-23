import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WaveRibbonBackground } from '@/components/backgrounds/wave-ribbon-background'
import type { BlockProps, HeroContent, CtaLink } from './types'

/**
 * Variants:
 *   centered        — default, prose over the page background
 *   wave-ribbon     — animated canvas mesh behind the copy
 *   solid           — layered gradient band on the secondary colour
 *   full-bleed      — background photograph with an overlay
 *   split-image     — copy left, image right
 *   minimal         — compact, no chrome
 *   video-contained — inset rounded video card
 *   video-fullbleed — edge-to-edge video
 *   video-16x9      — video above, copy below
 *
 * Nothing business-specific belongs in here. Ornament (accent rules, marks)
 * comes from theme tokens or content, never from a hardcoded asset URL.
 */
export function HeroBlock({
  content,
  variant = 'centered',
}: BlockProps<HeroContent>) {
  const {
    eyebrow,
    headline,
    headlineAccent,
    subhead,
    primaryCta,
    secondaryCta,
    proofItems,
    image,
    imageAlt,
    videoUrl,
    iframeUrl,
    poster,
    size = 'full',
    background,
  } = content

  const isWaveRibbon = variant === 'wave-ribbon'
  const isSplitImage = variant === 'split-image'
  const isFullBleed = variant === 'full-bleed'
  const isMinimal = variant === 'minimal'
  const isVideo = variant === 'video-fullbleed'
  const isVideo169 = variant === 'video-16x9'
  const isVideoContained = variant === 'video-contained'
  const isSolid = variant === 'solid'

  const heightClass =
    size === 'compact'
      ? 'min-h-[40vh]'
      : size === 'medium'
        ? 'min-h-[55vh]'
        : 'min-h-[88vh]'

  // ── Shared pieces ─────────────────────────────────────────────────────────

  const renderCtas = (onDark: boolean) => {
    if (!primaryCta && !secondaryCta) return null

    return (
      <div
        className={cn(
          'flex flex-wrap gap-4',
          !isSplitImage && 'justify-center',
        )}
      >
        {primaryCta && (
          <Button
            asChild
            size="lg"
            className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90"
            style={{ borderRadius: 'var(--radius-button)' }}
          >
            <Link href={primaryCta.href}>
              {primaryCta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
        {secondaryCta && (
          <Button
            asChild
            variant="outline"
            size="lg"
            className={cn(
              'bg-transparent',
              onDark
                ? 'border border-white/60 text-white hover:bg-white/10 hover:text-white'
                : 'border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface)]',
            )}
            style={{ borderRadius: 'var(--radius-button)' }}
          >
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        )}
      </div>
    )
  }

  const renderProof = (onDark: boolean) => {
    if (!proofItems || proofItems.length === 0) return null

    return (
      <div
        className={cn(
          'mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm',
          onDark ? 'text-white/70' : 'text-[var(--color-muted)]',
        )}
      >
        {proofItems.map((item, i) => (
          <span key={item} className="flex items-center gap-3">
            {i > 0 && (
              <span aria-hidden="true" className="opacity-50">
                ·
              </span>
            )}
            {item}
          </span>
        ))}
      </div>
    )
  }

  const renderHeadline = (onDark: boolean, className?: string) => (
    <h1
      className={cn(
        'font-[var(--font-heading)] font-bold tracking-tight',
        onDark ? 'text-white' : 'text-[var(--color-foreground)]',
        className,
      )}
    >
      {headline}
      {headlineAccent && (
        <>
          {' '}
          <em
            className={cn(
              'font-normal italic',
              onDark ? 'text-white/70' : 'text-[var(--color-muted)]',
            )}
          >
            {headlineAccent}
          </em>
        </>
      )}
    </h1>
  )

  const renderEyebrow = (onDark: boolean) =>
    eyebrow && (
      <p
        className={cn(
          'mb-4 text-xs font-semibold uppercase tracking-[0.18em]',
          onDark ? 'text-white/70' : 'text-[var(--color-muted)]',
        )}
      >
        {eyebrow}
      </p>
    )

  // ── Wave ribbon ───────────────────────────────────────────────────────────

  if (isWaveRibbon) {
    return (
      <section
        className={cn(
          'relative isolate flex items-center overflow-hidden',
          size === 'compact' ? 'min-h-[45vh]' : 'min-h-[82vh]',
        )}
      >
        <WaveRibbonBackground {...(background ?? {})} />

        <div className="container relative z-10 mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            {renderEyebrow(false)}
            {renderHeadline(
              false,
              'text-4xl md:text-5xl lg:text-6xl leading-[1.15]',
            )}
            {subhead && (
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">
                {subhead}
              </p>
            )}
            <div className="mt-8">{renderCtas(false)}</div>
            {renderProof(false)}
          </div>
        </div>
      </section>
    )
  }

  // ── Video contained ───────────────────────────────────────────────────────

  if (isVideoContained) {
    return (
      <section className="bg-[var(--color-secondary)] px-3 py-3 md:px-4 md:py-4">
        <div
          className="relative mx-auto aspect-[16/10] max-h-[72vh] w-full overflow-hidden shadow-2xl md:aspect-[16/9]"
          style={{ borderRadius: 'calc(var(--radius) * 3)' }}
        >
          {videoUrl ? (
            <video
              className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={poster || image || undefined}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : iframeUrl ? (
            <div className="absolute left-1/2 top-1/2 aspect-video min-h-full w-full min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2">
              <iframe
                src={iframeUrl}
                loading="lazy"
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : null}

          {(poster || image) && (
            <Image
              src={poster || image || ''}
              alt={imageAlt || ''}
              fill
              priority
              className={cn(
                'object-cover',
                videoUrl ? 'hidden motion-reduce:block' : 'block',
              )}
            />
          )}

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-x-0 top-[6%] hidden px-6 text-center md:block">
            {renderHeadline(
              true,
              'mx-auto max-w-3xl text-4xl drop-shadow-md md:text-5xl lg:text-6xl',
            )}
          </div>

          {(subhead || primaryCta || secondaryCta) && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-8 text-center md:pb-12">
              <div className="mx-auto max-w-3xl px-6">
                {subhead && (
                  <p className="mx-auto hidden max-w-xl text-lg leading-relaxed text-white/90 drop-shadow md:block md:text-xl">
                    {subhead}
                  </p>
                )}
                <div className="mt-6">{renderCtas(true)}</div>
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  // ── Solid ─────────────────────────────────────────────────────────────────

  if (isSolid) {
    return (
      <section className="relative overflow-hidden bg-[var(--color-secondary)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, var(--color-secondary) 0%, color-mix(in srgb, var(--color-secondary) 80%, black) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 85% 15%, color-mix(in srgb, var(--color-primary) 45%, transparent) 0%, transparent 55%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        {/* Accent rule from the theme, not a hardcoded brand colour. */}
        <div className="absolute left-0 top-0 h-1 w-full bg-[var(--color-accent)]" />

        <div className="container relative z-10 mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            {/* Optional decorative mark, supplied by content. */}
            {image && (
              <div className="mx-auto mb-6 flex justify-center">
                <Image
                  src={image}
                  alt={imageAlt || ''}
                  width={120}
                  height={48}
                  className="h-12 w-auto opacity-90"
                />
              </div>
            )}
            {renderEyebrow(true)}
            {renderHeadline(true, 'text-4xl md:text-5xl lg:text-6xl')}
            {subhead && (
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
                {subhead}
              </p>
            )}
            <div className="mt-8">{renderCtas(true)}</div>
            {renderProof(true)}
          </div>
        </div>
      </section>
    )
  }

  // ── Video 16:9 ────────────────────────────────────────────────────────────

  if (isVideo169) {
    return (
      <section className="bg-[var(--color-secondary)]">
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              loading="lazy"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : videoUrl ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={poster || image || undefined}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : null}
        </div>

        <div className="container mx-auto px-4 py-12 text-center md:py-16">
          <div className="mx-auto max-w-3xl">
            {renderEyebrow(true)}
            {renderHeadline(true, 'mb-5 text-4xl md:text-5xl lg:text-6xl')}
            {subhead && (
              <p className="mb-8 text-lg leading-relaxed text-white/85 md:text-xl">
                {subhead}
              </p>
            )}
            {renderCtas(true)}
          </div>
        </div>
      </section>
    )
  }

  // ── Video full bleed ──────────────────────────────────────────────────────

  if (isVideo) {
    const posterSrc = poster || image || undefined

    return (
      <section
        className={cn(
          'relative flex items-center justify-center overflow-hidden',
          heightClass,
        )}
      >
        <div className="absolute inset-0 z-0 overflow-hidden bg-[var(--color-secondary)]">
          {iframeUrl ? (
            <div className="absolute left-1/2 top-1/2 aspect-video min-h-full w-full min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2">
              <iframe
                src={iframeUrl}
                loading="lazy"
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : videoUrl ? (
            <video
              className="h-full w-full object-cover motion-reduce:hidden"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={posterSrc}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : null}

          {!iframeUrl && posterSrc && (
            <Image
              src={posterSrc}
              alt={imageAlt || ''}
              fill
              priority
              className={cn(
                'object-cover',
                videoUrl ? 'hidden motion-reduce:block' : 'block',
              )}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        </div>

        <div className="container pointer-events-none relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            {renderEyebrow(true)}
            {renderHeadline(
              true,
              'mb-6 text-4xl drop-shadow-sm md:text-5xl lg:text-7xl',
            )}
            {subhead && (
              <p className="mb-8 text-lg leading-relaxed text-white/90 md:text-xl">
                {subhead}
              </p>
            )}
            <div className="pointer-events-auto">{renderCtas(true)}</div>
          </div>
        </div>
      </section>
    )
  }

  // ── Default / full-bleed / split-image / minimal ───────────────────────────

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        isFullBleed ? heightClass : 'py-16 md:py-24 lg:py-32',
        isFullBleed && 'flex items-center',
        isMinimal && 'py-12 md:py-16',
      )}
    >
      {isFullBleed && image && (
        <div className="absolute inset-0 z-0">
          <Image
            src={image}
            alt={imageAlt || ''}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[var(--color-secondary)]/70" />
        </div>
      )}

      <div
        className={cn(
          'container relative z-10 mx-auto w-full px-4',
          isSplitImage && 'grid items-center gap-12 lg:grid-cols-2',
        )}
      >
        <div
          className={cn('max-w-3xl', !isSplitImage && 'mx-auto text-center')}
        >
          {renderEyebrow(isFullBleed)}
          {renderHeadline(
            isFullBleed,
            'mb-6 text-4xl md:text-5xl lg:text-6xl',
          )}

          {subhead && (
            <p
              className={cn(
                'mb-8 text-lg leading-relaxed md:text-xl',
                isFullBleed ? 'text-white/90' : 'text-[var(--color-muted)]',
              )}
            >
              {subhead}
            </p>
          )}

          {renderCtas(isFullBleed)}
          {renderProof(isFullBleed)}
        </div>

        {isSplitImage && image && (
          <div
            className="relative aspect-[4/3] overflow-hidden"
            style={{ borderRadius: 'calc(var(--radius) * 2)' }}
          >
            <Image
              src={image}
              alt={imageAlt || ''}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        )}
      </div>
    </section>
  )
}
