// lib/theme.ts
//
// Maps the flat SiteTheme token shape onto CSS custom properties. Every block
// reads the variables — never these values directly — which is what allows a
// site's entire visual identity to change without a code change.

import type { SiteTheme } from '@/lib/types/database'
import type React from 'react'

const TOKEN_MAP: Record<keyof SiteTheme, string> = {
  primary:             '--color-primary',
  primaryForeground:   '--color-primary-foreground',
  secondary:           '--color-secondary',
  secondaryForeground: '--color-secondary-foreground',
  accent:              '--color-accent',
  accentForeground:    '--color-accent-foreground',
  background:          '--color-background',
  surface:             '--color-surface',
  foreground:          '--color-foreground',
  muted:               '--color-muted',
  mutedForeground:     '--color-muted-foreground',
  border:              '--color-border',
  fontHeading:         '--font-heading',
  fontBody:            '--font-body',
  radius:              '--radius',
  radiusButton:        '--radius-button',
}

/**
 * Build the inline style object injected by ThemeWrapper.
 *
 * radiusButton falls back to radius when unset, so a site that wants uniform
 * corners sets one token and a site that wants pill buttons with square cards
 * sets both.
 */
export function getThemeStyleObject(theme: SiteTheme): React.CSSProperties {
  const styles: Record<string, string> = {}

  for (const [key, cssVar] of Object.entries(TOKEN_MAP) as [
    keyof SiteTheme,
    string,
  ][]) {
    const value = theme[key]
    if (value) styles[cssVar] = value
  }

  if (!styles['--radius-button'] && styles['--radius']) {
    styles['--radius-button'] = styles['--radius']
  }

  return styles as React.CSSProperties
}

/**
 * Neutral template defaults.
 *
 * Deliberately colourless — a new site should look obviously unstyled until
 * its own theme is set, rather than silently inheriting another client's brand.
 * Every key here is overridden by site_settings.theme in practice.
 */
export const defaultTheme: SiteTheme = {
  primary:             '#1F2937',
  primaryForeground:   '#FFFFFF',
  secondary:           '#374151',
  secondaryForeground: '#FFFFFF',
  accent:              '#6B7280',
  accentForeground:    '#FFFFFF',
  background:          '#FFFFFF',
  surface:             '#F9FAFB',
  foreground:          '#111827',
  muted:               '#6B7280',
  mutedForeground:     '#9CA3AF',
  border:              '#E5E7EB',
  fontHeading:         'system-ui, sans-serif',
  fontBody:            'system-ui, sans-serif',
  radius:              '0.5rem',
  radiusButton:        '0.5rem',
}

/**
 * Found Money Partnerships — palette G (slate and sage).
 * Kept here as a worked example of a complete theme; delete or replace
 * when this template is used for another client.
 */
export const exampleTheme: SiteTheme = {
  primary:             '#1B2422',
  primaryForeground:   '#FCFCFB',
  secondary:           '#3F514D',
  secondaryForeground: '#FCFCFB',
  accent:              '#7C9086',
  accentForeground:    '#1B2422',
  background:          '#FCFCFB',
  surface:             '#F6F7F5',
  foreground:          '#1B2422',
  muted:               '#6B7472',
  mutedForeground:     '#8D9694',
  border:              '#CBD4CE',
  fontHeading:         'Fraunces',
  fontBody:            'Inter',
  radius:              '0.5rem',
  radiusButton:        '999px',
}
