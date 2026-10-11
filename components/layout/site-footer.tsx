import Link from 'next/link'
import Image from 'next/image'
import type { SiteSettings, NavLink, FooterColumn } from '@/lib/types/database'
import { showDrafts } from '@/lib/draft'

interface SiteFooterProps {
  site: SiteSettings
}

/** Display names for site_settings.social_links keys. */
const socialLabels: Record<string, string> = {
  facebook: 'Facebook',
  twitter: 'X',
  x: 'X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
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

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href)

function FooterLink({ link, className }: { link: NavLink; className: string }) {
  return isExternal(link.href) ? (
    <a
      href={link.href}
      className={className}
      {...(link.href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  )
}

/**
 * Ledger footer: identity column, then the link columns from
 * site_settings.footer.columns, then a Connect column assembled from
 * social_links, email/phone, and the nav CTA. Ground is the secondary colour
 * pushed darker, so it sits below a dark final CTA band.
 */
export function SiteFooter({ site }: SiteFooterProps) {
  // footer.draft overrides apply off production, like theme.draft (lib/draft.ts).
  const { draft, ...liveFooter } = (site.footer || {}) as Record<string, unknown>
  const footer =
    draft && typeof draft === 'object' && showDrafts()
      ? { ...liveFooter, ...(draft as Record<string, unknown>) }
      : liveFooter
  const columns: FooterColumn[] = Array.isArray(footer.columns)
    ? (footer.columns as FooterColumn[])
    : []
  const badges: FooterBadge[] = Array.isArray(footer.badges)
    ? (footer.badges as FooterBadge[])
    : []
  const legalLinks: NavLink[] = Array.isArray(footer.legalLinks)
    ? (footer.legalLinks as NavLink[])
    : []
  const blurb =
    (typeof footer.blurb === 'string' && footer.blurb) || site.tagline || null

  const connect: NavLink[] = [
    ...Object.entries(site.social_links || {})
      .filter(([, url]) => url)
      .map(([platform, url]) => ({
        label: socialLabels[platform.toLowerCase()] ?? platform,
        href: url as string,
      })),
    ...(site.email ? [{ label: site.email, href: `mailto:${site.email}` }] : []),
    ...(site.phone ? [{ label: site.phone, href: `tel:${site.phone}` }] : []),
    ...(site.nav?.cta ? [site.nav.cta] : []),
  ]

  const addressParts = [
    site.address_line1,
    site.address_line2,
    site.city && site.state ? `${site.city}, ${site.state}` : site.city || site.state,
    site.postal_code,
  ].filter(Boolean)
  const formattedAddress = addressParts.join(', ') || null

  const linkClass =
    'text-sm text-[var(--color-secondary-foreground)]/70 transition-colors hover:text-[var(--color-accent)]'
  const headingClass =
    'mb-1 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]'

  return (
    <footer
      className="pb-8 pt-14 text-[var(--color-secondary-foreground)]/70"
      style={{ background: 'color-mix(in srgb, var(--color-secondary) 72%, black)' }}
    >
      <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-10 px-5 md:px-10">
        {/* Identity */}
        <div className="flex flex-[1_1_280px] flex-col gap-3">
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
              <span
                className="text-[22px] font-semibold text-[var(--color-secondary-foreground)]"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontVariationSettings: "'opsz' 144",
                  letterSpacing: '-0.02em',
                }}
              >
                {site.name}
              </span>
            )}
          </Link>
          {blurb && <p className="m-0 max-w-[36ch] text-sm leading-relaxed">{blurb}</p>}
          {formattedAddress && <p className="m-0 text-sm">{formattedAddress}</p>}
        </div>

        {/* Link columns + Connect */}
        <div className="flex flex-wrap gap-x-16 gap-y-10">
          {columns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-2.5">
              <span className={headingClass}>{column.heading}</span>
              {column.links.map((link) => (
                <FooterLink key={link.href} link={link} className={linkClass} />
              ))}
            </div>
          ))}
          {connect.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span className={headingClass}>Connect</span>
              {connect.map((link) => (
                <FooterLink key={link.href} link={link} className={linkClass} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Credential / award badges */}
      {badges.length > 0 && (
        <div className="mx-auto mt-10 flex max-w-[1240px] flex-wrap items-center gap-4 px-5 md:px-10">
          {badges.map((badge) => {
            const img = (
              <div className="flex items-center justify-center rounded-xl bg-white px-5 py-4 shadow-md">
                <Image src={badge.src} alt={badge.alt} width={160} height={80} className="h-14 w-auto" />
              </div>
            )
            return badge.href ? (
              <a key={badge.src} href={badge.href} target="_blank" rel="noopener noreferrer">
                {img}
              </a>
            ) : (
              <div key={badge.src}>{img}</div>
            )
          })}
        </div>
      )}

      {/* Bottom bar */}
      <div className="mx-auto mt-12 flex max-w-[1240px] flex-wrap justify-between gap-3 px-5 md:px-10">
        <div className="flex w-full flex-wrap justify-between gap-3 border-t border-[var(--color-secondary-foreground)]/10 pt-5 text-[12.5px] text-[var(--color-secondary-foreground)]/45">
          <span>
            &copy; {new Date().getFullYear()} {site.legal_name || site.name}
            {site.license_label && site.license_number && (
              <>
                {' '}
                &middot; {site.license_label} #{site.license_number}
              </>
            )}
          </span>
          {legalLinks.length > 0 && (
            <span className="flex gap-5">
              {legalLinks.map((link) => (
                <FooterLink
                  key={link.href}
                  link={link}
                  className="transition-colors hover:text-[var(--color-secondary-foreground)]"
                />
              ))}
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}
