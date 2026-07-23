'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, ChevronDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { SiteSettings, NavLink, NavCta } from '@/lib/types/database'

export type { NavLink, NavCta }

interface SiteNavProps {
  site: SiteSettings
  /** Overrides site.nav.links. Normally omitted — nav is data. */
  navLinks?: NavLink[]
  /** Overrides site.nav.cta. */
  cta?: NavCta
  /**
   * Centre the link group in its own grid column. Equal-width outer columns
   * keep it optically centred regardless of logo or CTA width — flex
   * justify-between drifts whenever those differ.
   */
  centered?: boolean
}

export function SiteNav({ site, navLinks, cta, centered = false }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const links = navLinks ?? site.nav?.links ?? []
  const primaryCta = cta ?? site.nav?.cta

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20)
        ticking = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const logo = (
    <Link href="/" className="flex items-center gap-2">
      {site.logo_url ? (
        <Image
          src={site.logo_url}
          alt={site.name}
          width={224}
          height={64}
          className="h-12 w-auto md:h-14"
          priority
        />
      ) : (
        <span className="font-[var(--font-heading)] text-xl font-bold tracking-tight text-[var(--color-foreground)]">
          {site.name}
        </span>
      )}
    </Link>
  )

  const desktopLinks = (
    <div className="hidden md:flex md:items-center md:gap-1">
      {links.map((link) => (
        <NavItem
          key={link.href}
          link={link}
          pathname={pathname}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        />
      ))}
    </div>
  )

  const desktopCta = (
    <div className="hidden md:flex md:items-center md:gap-3">
      {primaryCta && (
        <Button
          size="sm"
          className="bg-[var(--color-primary)] px-6 text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90"
          style={{ borderRadius: 'var(--radius-button)' }}
          asChild
        >
          <Link href={primaryCta.href}>{primaryCta.label}</Link>
        </Button>
      )}
    </div>
  )

  const mobileTrigger = (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full max-w-sm flex-col p-0">
        <SheetHeader className="border-b border-[var(--color-border)] px-6 pb-4 pt-6">
          <SheetTitle className="text-left text-[var(--color-foreground)]">
            {site.name}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col">
            {links.map((link) => (
              <MobileNavItem key={link.href} link={link} pathname={pathname} />
            ))}
          </div>
        </div>

        {primaryCta && (
          <div className="border-t border-[var(--color-border)] px-6 pb-6 pt-4">
            <Button
              asChild
              className="w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-[var(--color-background)]/95 shadow-sm backdrop-blur-md'
          : 'bg-transparent',
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {centered ? (
          <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center">
            <div className="justify-self-start">{logo}</div>
            <div className="justify-self-center">{desktopLinks}</div>
            <div className="flex items-center justify-self-end">
              {desktopCta}
              {mobileTrigger}
            </div>
          </div>
        ) : (
          <div className="flex h-20 items-center justify-between">
            {logo}
            {desktopLinks}
            <div className="flex items-center">
              {desktopCta}
              {mobileTrigger}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

function NavItem({
  link,
  pathname,
  openDropdown,
  setOpenDropdown,
}: {
  link: NavLink
  pathname: string
  openDropdown: string | null
  setOpenDropdown: (v: string | null) => void
}) {
  const hasChildren = link.children && link.children.length > 0
  const isOpen = openDropdown === link.href

  if (!hasChildren) {
    return (
      <Link
        href={link.href}
        className={cn(
          'rounded-md px-3 py-2 text-sm font-medium transition-colors',
          pathname === link.href
            ? 'text-[var(--color-foreground)]'
            : 'text-[var(--color-muted)] hover:bg-[var(--color-muted)]/10 hover:text-[var(--color-foreground)]',
        )}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenDropdown(link.href)}
      onMouseLeave={() => setOpenDropdown(null)}
    >
      <Link
        href={link.href}
        className={cn(
          'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'text-[var(--color-muted)] hover:bg-[var(--color-muted)]/10 hover:text-[var(--color-foreground)]',
          pathname.startsWith(link.href) && 'text-[var(--color-foreground)]',
        )}
      >
        {link.label}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </Link>
      <div
        className={cn(
          'absolute left-0 top-full pt-2 transition-all duration-200',
          isOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0',
        )}
      >
        <div className="w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/95 p-2 shadow-lg backdrop-blur-md">
          <Link
            href={link.href}
            className="mb-1 flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/10"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="my-1 h-px bg-[var(--color-border)]" />
          {link.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm transition-colors',
                pathname === child.href
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-muted)]/10 hover:text-[var(--color-foreground)]',
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileNavItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const hasChildren = link.children && link.children.length > 0

  if (!hasChildren) {
    return (
      <Link
        href={link.href}
        className={cn(
          'border-b border-[var(--color-border)] py-3 text-base font-medium transition-colors',
          pathname === link.href
            ? 'text-[var(--color-primary)]'
            : 'text-[var(--color-foreground)] hover:text-[var(--color-primary)]',
        )}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value={link.href}
        className="border-b border-[var(--color-border)]"
      >
        <AccordionTrigger className="py-3 text-base font-medium text-[var(--color-foreground)] hover:no-underline">
          {link.label}
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col pl-4">
            <Link
              href={link.href}
              className="py-2 text-sm font-medium text-[var(--color-primary)]"
            >
              View All
            </Link>
            {link.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'py-2 text-sm transition-colors',
                  pathname === child.href
                    ? 'font-medium text-[var(--color-primary)]'
                    : 'text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)]',
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
