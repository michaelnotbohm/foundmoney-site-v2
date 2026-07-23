import type { SiteSettings } from '@/lib/site'
import { getThemeStyleObject } from '@/lib/theme'

interface ThemeWrapperProps {
  site: SiteSettings
  children: React.ReactNode
}

/**
 * Injects the site's CSS custom properties so every block can reference
 * var(--color-primary), var(--font-heading), var(--radius-button) and so on
 * without hard-coding values.
 *
 * This is the seam that makes the template reusable: swapping the theme JSON
 * changes the entire visual identity with no code change.
 */
export function ThemeWrapper({ site, children }: ThemeWrapperProps) {
  const themeStyles = getThemeStyleObject(site.theme)

  return (
    <div style={themeStyles} className="min-h-screen">
      {children}
    </div>
  )
}
