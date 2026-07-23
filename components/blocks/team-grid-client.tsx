'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, X, ArrowRight, Linkedin } from 'lucide-react'
import type { TeamMember } from '@/lib/types/database'
import type { CtaLink } from './types'

interface TeamGridClientProps {
  members: TeamMember[]
  heading?: string
  subheading?: string
  cta?: CtaLink
  /**
   * From site_settings.license_label — "NMLS", "State License #", or null.
   * Never hardcode an industry's credential name here.
   */
  licenseLabel?: string | null
}

export function TeamGridClient({
  members,
  heading,
  subheading,
  cta,
  licenseLabel,
}: TeamGridClientProps) {
  const [selected, setSelected] = useState<TeamMember | null>(null)

  useEffect(() => {
    if (!selected) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [selected])

  const linkClass =
    'flex items-center gap-2 text-[var(--color-primary)] hover:underline'

  return (
    <section className="bg-[var(--color-surface)] py-16 md:py-24">
      <div className="container mx-auto px-4">
        {(heading || subheading) && (
          <div className="mb-12 text-center">
            {heading && (
              <h2 className="mb-4 font-[var(--font-heading)] text-3xl font-bold text-[var(--color-secondary)] md:text-4xl">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mx-auto max-w-2xl text-lg text-[var(--color-muted)]">
                {subheading}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setSelected(member)}
              className="group overflow-hidden border border-[var(--color-border)] bg-[var(--color-background)] text-left shadow-sm transition-shadow hover:shadow-md"
              style={{ borderRadius: 'calc(var(--radius) * 2)' }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-surface)]">
                {member.photo_url && (
                  <Image
                    src={member.photo_url}
                    alt={member.name}
                    fill
                    style={{ objectPosition: member.photo_position || 'top' }}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-[var(--font-heading)] text-lg font-bold text-[var(--color-secondary)]">
                  {member.name}
                </h3>
                {member.title && (
                  <p className="text-sm text-[var(--color-muted)]">
                    {member.title}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto bg-[var(--color-background)] shadow-2xl"
            style={{ borderRadius: 'calc(var(--radius) * 2)' }}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            >
              <X className="h-5 w-5" />
            </button>

            {selected.photo_url && (
              <div className="relative aspect-[3/2] w-full bg-[var(--color-surface)]">
                <Image
                  src={selected.photo_url}
                  alt={selected.name}
                  fill
                  style={{ objectPosition: selected.photo_position || 'top' }}
                  className="object-cover"
                  sizes="512px"
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              <h3 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-secondary)]">
                {selected.name}
              </h3>
              {selected.title && (
                <p className="mb-1 text-[var(--color-muted)]">{selected.title}</p>
              )}
              {selected.license_no && licenseLabel && (
                <p className="mb-4 text-xs text-[var(--color-muted)]">
                  {licenseLabel} #{selected.license_no}
                </p>
              )}
              {selected.bio && (
                <p className="mb-6 whitespace-pre-line leading-relaxed text-[var(--color-foreground)]/80">
                  {selected.bio}
                </p>
              )}

              <div className="mb-6 space-y-2">
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className={linkClass}>
                    <Phone className="h-4 w-4" />
                    {selected.phone}
                  </a>
                )}
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className={linkClass}>
                    <Mail className="h-4 w-4" />
                    {selected.email}
                  </a>
                )}
                {selected.linkedin_url && (
                  <a
                    href={selected.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </div>

              {cta && (
                <Link
                  href={cta.href}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary)]/90"
                  style={{ borderRadius: 'var(--radius-button)' }}
                >
                  {cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
