// components/blocks/block-renderer.tsx
//
// Maps each section's (type, variant) to a registered component and passes
// its content as props.
//
// A missing registry entry is the single most common cause of "the data is
// fine but nothing renders" — it produces no error and no visible gap. In
// development that now logs loudly, so the registry is the first thing you
// check rather than the last. Production stays silent: a half-rendered page
// beats a crashed one.

import type { SiteSettings } from '@/lib/types/database'
import type { Section } from './types'
import { getBlockComponent } from './registry'

interface BlockRendererProps {
  sections: Section[]
  site: SiteSettings
}

export function BlockRenderer({ sections, site }: BlockRendererProps) {
  return (
    <>
      {sections.map((section) => {
        const Component = getBlockComponent(section.type)

        if (!Component) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(
              `[BlockRenderer] No component registered for type "${section.type}" ` +
                `(variant "${section.variant}", section ${section.id}). ` +
                `Add it to components/blocks/registry.ts.`,
            )
          }
          return null
        }

        return (
          <Component
            key={section.id}
            content={section.content}
            site={site}
            variant={section.variant}
          />
        )
      })}
    </>
  )
}
