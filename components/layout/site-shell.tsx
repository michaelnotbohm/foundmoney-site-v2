// components/layout/site-shell.tsx
//
// The wrapper every page shares: theme variables, the bordered frame, nav,
// main, footer. Previously duplicated verbatim across four route files, which
// meant a layout change had to be made four times and drifted between them.

import type { SiteSettings } from '@/lib/types/database'
import { ThemeWrapper } from '@/components/theme-wrapper'
import { SiteNav } from '@/components/layout/site-nav'
import { SiteFooter } from '@/components/layout/site-footer'
import { resolveTheme } from '@/lib/theme'

interface SiteShellProps {
  site: SiteSettings
  children: React.ReactNode
  /** Centre the nav links in their own grid column. */
  centeredNav?: boolean
  /**
   * Bordered inset frame. Defaults to the theme's `frame` token ('inset'
   * unless set to 'none'), so it can be staged in theme.draft like any token.
   */
  framed?: boolean
}

export function SiteShell({
  site,
  children,
  centeredNav = false,
  framed = resolveTheme(site.theme).frame !== 'none',
}: SiteShellProps) {
  const inner = (
    <>
      <SiteNav site={site} centered={centeredNav} />
      <main className="flex-1">{children}</main>
      <SiteFooter site={site} />
    </>
  )

  return (
    <ThemeWrapper site={site}>
      <div className="flex min-h-screen flex-col">
        {framed ? (
          <div className="m-2 flex min-h-[calc(100vh-1rem)] flex-col border border-[var(--color-border)] md:m-4 md:min-h-[calc(100vh-2rem)]">
            {inner}
          </div>
        ) : (
          <div className="flex min-h-screen flex-col">{inner}</div>
        )}
      </div>
    </ThemeWrapper>
  )
}
