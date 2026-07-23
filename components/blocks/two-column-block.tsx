import type { BlockProps, TwoColumnContent, ChildBlock } from './types'
import { getEmbeddableComponent } from './registry'

// =============================================================================
// components/blocks/two-column-block.tsx
//
// Generic layout primitive: renders two child blocks side by side. Each child
// resolves through the shared registry and renders in EMBEDDED mode (no outer
// section chrome), so this block owns the section padding, optional heading,
// container, and the responsive grid.
//
// Industry-agnostic and reusable: any two embeddable blocks compose — a
// calculator beside a form, a testimonial beside an image, an FAQ beside a
// media_text. Children are defined inline in this block's content JSON, so
// adding a composition needs no schema change.
//
// On mobile the columns stack, left on top. Unknown child types render
// nothing rather than crashing, matching the top-level renderer's behaviour.
// =============================================================================

const RATIO_CLASS: Record<NonNullable<TwoColumnContent['ratio']>, string> = {
  '1:1': 'lg:grid-cols-2',
  '5:7': 'lg:grid-cols-[5fr_7fr]',
  '7:5': 'lg:grid-cols-[7fr_5fr]',
  '4:6': 'lg:grid-cols-[4fr_6fr]',
  '6:4': 'lg:grid-cols-[6fr_4fr]',
}

const ALIGN_CLASS: Record<NonNullable<TwoColumnContent['align']>, string> = {
  start: 'items-start',
  center: 'items-center',
  stretch: 'items-stretch',
}

export function TwoColumnBlock({ content, site }: BlockProps<TwoColumnContent>) {
  const { heading, subheading, left, right, ratio = '1:1', align = 'stretch' } =
    content

  const ratioClass = RATIO_CLASS[ratio] ?? RATIO_CLASS['1:1']
  const alignClass = ALIGN_CLASS[align] ?? ALIGN_CLASS.stretch

  const renderChild = (child: ChildBlock | undefined) => {
    if (!child?.type) return null

    const Component = getEmbeddableComponent(child.type)

    if (!Component) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[TwoColumnBlock] No embeddable component registered for type "${child.type}". ` +
            `Add it to components/blocks/registry.ts.`,
        )
      }
      return null
    }

    return (
      <Component
        content={child.content}
        site={site}
        variant={child.variant}
        embedded
      />
    )
  }

  return (
    <section className="bg-[var(--color-surface)] py-16 md:py-24">
      <div className="container mx-auto px-4">
        {(heading || subheading) && (
          <div className="mx-auto mb-10 max-w-2xl text-center">
            {heading && (
              <h2 className="font-[var(--font-heading)] text-3xl font-bold text-[var(--color-secondary)] md:text-4xl">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mt-4 text-lg leading-relaxed text-[var(--color-foreground)]/70">
                {subheading}
              </p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-8 ${ratioClass} ${alignClass}`}>
          <div className="min-w-0">{renderChild(left)}</div>
          <div className="min-w-0">{renderChild(right)}</div>
        </div>
      </div>
    </section>
  )
}
