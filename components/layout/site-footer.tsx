import Link from 'next/link'
import Image from 'next/image'
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
} from 'lucide-react'
import type { SiteSettings, NavLink, FooterColumn } from '@/lib/types/database'

interface SiteFooterProps {
  site: SiteSettings
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
}

/**
 * Badge shape stored on site_settings.footer.badges. Industry credentials
 * (Equal Housing, BBB, trade associations, awards) are data, not markup —
 * a hardcoded badge is a business detail leaking into shared code.
 */
interface FooterBadge {
  src: string
  alt: string
  href?: string
}

export function SiteFooter({ site }: SiteFooterProps) {
  const socialLinks = Object.entries(site.social_links || {}).filter(([, url]) => url)

  const footer = site.footer || {}
  const columns: FooterColumn[] = Array.isArray(footer.columns) ? footer.columns : []
  const badges: FooterBadge[] = Array.isArray(
    (footer as Record<string, unknown>).badges,
  )
    ? ((footer as Record<string, unknown>).badges as FooterBadge[])
    : []
  const legalLinks: NavLink[] = Array.isArray(
    (footer as Record<string, unknown>).legalLinks,
  )
    ? ((footer as Record<string, unknown>).legalLinks as NavLink[])
    : []

  const addressParts = [
    site.address_line1,
    site.address_line2,
    site.city && site.state
      ? `${site.city}, ${site.state}`
      : site.city || site.state,
    site.postal_code,
  ].filter(Boolean)
  const formattedAddress = addressParts.join(', ') || null

  return (
    <footer className="bg-[var(--color-secondary)] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-10 md:py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_repeat(auto-fit,minmax(140px,1fr))]">
            {/* Identity & contact */}
            <div>
              <Link href="/" className="inline-block">
                {site.logo_url ? (
                  <Image
                    src={site.logo_url}
                    alt={site.name}
                    width={160}
                    height={44}
                    className="h-9 w-auto brightness-0 invert"
                  />
                ) : (
                  <span className="font-[var(--font-heading)] text-xl font-bold tracking-tight">
                    {site.name}
                  </span>
                )}
              </Link>

              {site.tagline && (
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
                  {site.tagline}
                </p>
              )}

              <div className="mt-5 space-y-2">
                {site.phone && (
                  <a
                    href={`tel:${site.phone}`}
                    className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4" />
                    {site.phone}
                  </a>
                )}
                {site.phone_tollfree && (
                  <a
                    href={`tel:${site.phone_tollfree}`}
                    className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4" />
                    {site.phone_tollfree} (Toll-Free)
                  </a>
                )}
                {site.email && (
                  <a
                    href={`mailto:${site.email}`}
                    className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <Mail className="h-4 w-4" />
                    {site.email}
                  </a>
                )}
                {formattedAddress && (
                  <div className="flex items-start gap-2 text-sm text-white/70">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{formattedAddress}</span>
                  </div>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div className="mt-5 flex gap-4">
                  {socialLinks.map(([platform, url]) => {
                    const Icon = socialIcons[platform.toLowerCase()]
                    if (!Icon || !url) return null
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 transition-colors hover:text-white"
                        aria-label={platform}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Link columns */}
            {columns.map((column) => (
              <div key={column.heading}>
                <h3 className="font-[var(--font-heading)] text-sm font-semibold tracking-wide text-white">
                  {column.heading}
                </h3>
                <ul className="mt-4 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Credential / award badges */}
          {badges.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
              {badges.map((badge) => {
                const img = (
                  <div className="flex items-center justify-center rounded-xl bg-white px-5 py-4 shadow-md">
                    <Image
                      src={badge.src}
                      alt={badge.alt}
                      width={160}
                      height={80}
                      className="h-14 w-auto"
                    />
                  </div>
                )
                return badge.href ? (
                  <a
                    key={badge.src}
                    href={badge.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {img}
                  </a>
                ) : (
                  <div key={badge.src}>{img}</div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-5">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-xs text-white/50">
              &copy; {new Date().getFullYear()} {site.legal_name || site.name}. All
              rights reserved.
              {site.license_label && site.license_number && (
                <>
                  {' '}
                  {site.license_label} #{site.license_number}
                </>
              )}
            </p>

            {legalLinks.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {legalLinks.map((link) => {
                  const external = link.href.startsWith('http')
                  return external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/50 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-xs text-white/50 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
