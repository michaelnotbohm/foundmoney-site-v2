import dynamic from 'next/dynamic'
import type { BlockProps } from './types'

// =============================================================================
// components/blocks/registry.ts
//
// Single source of truth mapping section `type` -> block component. Both the
// top-level BlockRenderer and layout blocks (two_column) resolve children
// through this one registry, so there is never a second, drifting copy.
//
// A MISSING ENTRY HERE IS THE MOST COMMON CAUSE of "the data is fine but
// nothing renders". The renderer's null fallback produces no error and no
// visible gap. Check this file FIRST — ahead of RLS, env vars, or component
// code. BlockRenderer logs a warning in development to make that obvious.
//
// All components are dynamically imported (code-split). Adding a new block
// type = add its import plus one registry entry. Nothing else changes.
// =============================================================================

const HeroBlock = dynamic(() =>
  import('./hero-block').then((m) => m.HeroBlock),
)
const PathCardsBlock = dynamic(() =>
  import('./path-cards-block').then((m) => m.PathCardsBlock),
)
const StatStripBlock = dynamic(() =>
  import('./stat-strip-block').then((m) => m.StatStripBlock),
)
const RichTextBlock = dynamic(() =>
  import('./rich-text-block').then((m) => m.RichTextBlock),
)
const FeatureGridBlock = dynamic(() =>
  import('./feature-grid-block').then((m) => m.FeatureGridBlock),
)
const FaqBlock = dynamic(() => import('./faq-block').then((m) => m.FaqBlock))
const LeadFormBlock = dynamic(() =>
  import('./lead-form-block').then((m) => m.LeadFormBlock),
)
const CtaBandBlock = dynamic(() =>
  import('./cta-band-block').then((m) => m.CtaBandBlock),
)
const TeamGridBlock = dynamic(() =>
  import('./team-grid-block').then((m) => m.TeamGridBlock),
)
const ImageBlock = dynamic(() =>
  import('./image-block').then((m) => m.ImageBlock),
)
const MediaTextBlock = dynamic(() =>
  import('./media-text-block').then((m) => m.MediaTextBlock),
)
const TestimonialsBlock = dynamic(() =>
  import('./testimonials-block').then((m) => m.TestimonialsBlock),
)
const QuickFactsBlock = dynamic(() =>
  import('./quick-facts-block').then((m) => m.QuickFactsBlock),
)
const ProcessTimelineBlock = dynamic(() =>
  import('./process-timeline-block').then((m) => m.ProcessTimelineBlock),
)
const TabbedPanelsBlock = dynamic(() =>
  import('./tabbed-panels-block').then((m) => m.TabbedPanelsBlock),
)
const TwoColumnBlock = dynamic(() =>
  import('./two-column-block').then((m) => m.TwoColumnBlock),
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyBlockComponent = React.ComponentType<BlockProps<any>>

/**
 * Type -> component.
 *
 * Some types are aliased to one component where the old codebase had two
 * near-duplicate blocks (stats/stat_strip, testimonial/testimonials,
 * image_text/scroll_reveal). Keeping the aliases means previously seeded
 * sections keep rendering; prefer the canonical name for anything new.
 */
const registry: Record<string, AnyBlockComponent> = {
  hero: HeroBlock as AnyBlockComponent,
  rich_text: RichTextBlock as AnyBlockComponent,
  cta_band: CtaBandBlock as AnyBlockComponent,
  faq: FaqBlock as AnyBlockComponent,
  feature_grid: FeatureGridBlock as AnyBlockComponent,
  path_cards: PathCardsBlock as AnyBlockComponent,
  process_timeline: ProcessTimelineBlock as AnyBlockComponent,
  quick_facts: QuickFactsBlock as AnyBlockComponent,
  team_grid: TeamGridBlock as AnyBlockComponent,
  image: ImageBlock as AnyBlockComponent,
  lead_form: LeadFormBlock as AnyBlockComponent,
  tabbed_panels: TabbedPanelsBlock as AnyBlockComponent,
  two_column: TwoColumnBlock as AnyBlockComponent,

  // Canonical + aliases
  stat_strip: StatStripBlock as AnyBlockComponent,
  stats: StatStripBlock as AnyBlockComponent,

  testimonial: TestimonialsBlock as AnyBlockComponent,
  testimonials: TestimonialsBlock as AnyBlockComponent,

  media_text: MediaTextBlock as AnyBlockComponent,
  image_text: MediaTextBlock as AnyBlockComponent,
  scroll_reveal: MediaTextBlock as AnyBlockComponent,
}

/**
 * Blocks that may be nested inside a layout block. Excludes layout blocks
 * themselves — nesting two_column inside two_column produces unusable
 * layouts and unbounded recursion.
 */
const NON_EMBEDDABLE = new Set(['two_column', 'hero'])

/** Resolve a top-level section type. Returns null for unknown types. */
export function getBlockComponent(type: string): AnyBlockComponent | null {
  return registry[type] || null
}

/** Resolve a child block type for embedding inside a layout block. */
export function getEmbeddableComponent(type: string): AnyBlockComponent | null {
  if (NON_EMBEDDABLE.has(type)) return null
  return registry[type] || null
}

/** Every registered type. Useful for admin UI and diagnostics. */
export function registeredBlockTypes(): string[] {
  return Object.keys(registry).sort()
}
