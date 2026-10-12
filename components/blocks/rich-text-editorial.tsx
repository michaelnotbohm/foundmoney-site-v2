import { Children, cloneElement, isValidElement, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { EditorialRail, type EditorialChapterLink } from './editorial-rail'

// =============================================================================
// Editorial layout for long-form markdown (rich_text variant 'editorial').
//
// Generic: works on any markdown. Structure comes from the document itself:
//   - everything before the first H2 is the lede (first paragraph in display)
//   - each H2 starts a chapter: mono index + hairline, Fraunces H2, 68ch body,
//     full-bleed bands alternating background / surface
//   - a paragraph that is entirely bold becomes a pull line
//   - a list whose every item opens with a bold label ("**Label:** text")
//     becomes ruled rows; other lists get accent dot markers
//   - xl+: a sticky rail listing the chapters, with a booking pill
//
// Chapters are split on top-level "## " lines (fenced code is skipped); the
// inline detection reads react-markdown's hast `node` for each element, so
// there is no second markdown parser.
// =============================================================================

interface HastNode {
  type: string
  tagName?: string
  value?: string
  children?: HastNode[]
  position?: { start: { line: number } }
}

interface Chapter {
  id: string
  title: string
  body: string
}

/** Children that carry content (drops whitespace-only text). */
const significant = (node?: HastNode) =>
  (node?.children ?? []).filter((c) => !(c.type === 'text' && !c.value?.trim()))

const textOf = (node?: HastNode): string =>
  node?.type === 'text' ? node.value ?? '' : (node?.children ?? []).map(textOf).join('')

const isAllBold = (node?: HastNode) => {
  const kids = significant(node)
  return kids.length === 1 && kids[0].tagName === 'strong'
}

/** The item opens with <strong> (directly, or inside a loose-list <p>). */
const opensWithBold = (li: HastNode) => {
  const first = significant(li)[0]
  if (!first) return false
  if (first.tagName === 'strong') return true
  return first.tagName === 'p' && significant(first)[0]?.tagName === 'strong'
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[*_`[\]()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'section'

/** Split into the lede and H2 chapters, ignoring "## " inside code fences. */
export function splitChapters(markdown: string): { lede: string; chapters: Chapter[] } {
  const lines = markdown.split('\n')
  const chapters: Chapter[] = []
  const lede: string[] = []
  const used = new Map<string, number>()
  let current: Chapter | null = null
  let buffer: string[] = []
  let inFence = false

  const flush = () => {
    if (current) {
      current.body = buffer.join('\n').trim()
      chapters.push(current)
    } else {
      lede.push(...buffer)
    }
    buffer = []
  }

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const h2 = !inFence && /^##\s+(.+?)\s*#*\s*$/.exec(line)
    if (h2) {
      flush()
      const title = h2[1].replace(/\*\*|__|`/g, '').trim()
      const base = slugify(title)
      const n = used.get(base) ?? 0
      used.set(base, n + 1)
      current = { id: n ? `${base}-${n + 1}` : base, title, body: '' }
    } else {
      buffer.push(line)
    }
  }
  flush()

  return { lede: lede.join('\n').trim(), chapters }
}

/** First line (1-based) of the lede's first paragraph, if it opens with one. */
function firstParagraphLine(md: string): number | null {
  const lines = md.split('\n')
  const i = lines.findIndex((l) => l.trim())
  if (i < 0) return null
  return /^\s*([-*+]\s|\d+[.)]\s|#|>|```|~~~|\|)/.test(lines[i]) ? null : i + 1
}

// ── Shared element renderers ────────────────────────────────────────────────

/** An entirely-bold paragraph: display pull line with an accent rule. */
function PullLine({ children }: { children?: ReactNode }) {
  return (
    <p className="font-heading my-12 border-l-2 border-[var(--color-accent-deep)] pl-6 text-2xl font-medium leading-[1.3] tracking-[-0.01em] text-[var(--color-primary)] [&_strong]:font-medium [&_strong]:text-inherit">
      {children}
    </p>
  )
}

function proseComponents(): Components {
  return {
    h3: ({ children }) => (
      <h3 className="font-heading mb-4 mt-12 text-[26px] font-medium leading-tight tracking-[-0.02em] text-[var(--color-secondary)]">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-heading mb-3 mt-8 text-xl font-medium text-[var(--color-secondary)]">
        {children}
      </h4>
    ),
    p: ({ node, children }) =>
      isAllBold(node as HastNode) ? (
        <PullLine>{children}</PullLine>
      ) : (
        <p className="mb-6 text-lg leading-[1.75] text-[var(--color-foreground)]/85">{children}</p>
      ),
    strong: ({ children }) => (
      <strong className="font-semibold text-[var(--color-foreground)]">{children}</strong>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        className="font-medium text-[var(--color-primary)] underline decoration-[var(--color-accent-deep)] underline-offset-[3px]"
      >
        {children}
      </a>
    ),
    ul: ({ node, children }) => {
      const items = significant(node as HastNode).filter((c) => c.tagName === 'li')
      const ruled = items.length > 0 && items.every(opensWithBold)
      if (ruled) {
        return (
          <ul className="my-10 list-none border-t border-[var(--color-foreground)]/10 p-0">
            {Children.map(children, (child) =>
              isValidElement(child) ? cloneElement(child as React.ReactElement<{ ruled?: boolean }>, { ruled: true }) : child,
            )}
          </ul>
        )
      }
      return <ul className="mb-8 list-none space-y-3 p-0">{children}</ul>
    },
    ol: ({ children }) => (
      <ol className="mb-8 list-decimal space-y-3 pl-6 text-lg leading-[1.7] text-[var(--color-foreground)]/85 marker:font-mono marker:text-sm marker:text-[var(--color-accent-deep)]">
        {children}
      </ol>
    ),
    li: (props) => {
      const { children, ruled } = props as { children?: ReactNode; ruled?: boolean }
      if (ruled) return <RuledRow>{children}</RuledRow>
      // Dot marker for ul items; inside an ol the native number is kept.
      return (
        <li className="relative pl-6 text-lg leading-[1.7] text-[var(--color-foreground)]/85 [ol_&]:pl-0">
          <span
            aria-hidden="true"
            className="absolute left-0 top-[0.72em] h-1.5 w-1.5 rounded-full bg-[var(--color-accent-deep)] [ol_&]:hidden"
          />
          {children}
        </li>
      )
    },
    blockquote: ({ children }) => (
      <blockquote className="my-10 border-l-2 border-[var(--color-accent-deep)] pl-6 text-lg italic leading-relaxed text-[var(--color-foreground)]/75">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-12 border-0 border-t border-[var(--color-border)]" />,
  }
}

/** "**Label:** text" -> label left (40% from lg), text right, hairline below. */
function RuledRow({ children }: { children?: ReactNode }) {
  let parts = Children.toArray(children)
  // Loose lists wrap the item in <p>; look inside it.
  if (parts.length === 1 && isValidElement(parts[0])) {
    const only = parts[0] as React.ReactElement<{ children?: ReactNode; node?: HastNode }>
    if (only.props.node?.tagName === 'p') parts = Children.toArray(only.props.children)
  }
  while (typeof parts[0] === 'string' && !parts[0].trim()) parts = parts.slice(1)

  const [first, ...rest] = parts
  const labelNode = isValidElement(first)
    ? (first as React.ReactElement<{ children?: ReactNode }>).props.children
    : first
  const label =
    typeof labelNode === 'string' ? labelNode.replace(/[:\s]+$/, '') : labelNode
  if (typeof rest[0] === 'string') rest[0] = rest[0].replace(/^[\s:]+/, '')

  return (
    <li className="grid gap-2 border-b border-[var(--color-foreground)]/10 py-5 lg:grid-cols-[40%_1fr] lg:gap-8">
      <span className="font-heading text-xl font-medium leading-snug tracking-[-0.01em] text-[var(--color-secondary)]">
        {label}
      </span>
      <span className="text-[17px] leading-[1.65] text-[var(--color-foreground)]/80">{rest}</span>
    </li>
  )
}

// ── Layout ──────────────────────────────────────────────────────────────────

/** Content column that clears the xl rail. */
const COLUMN =
  'mx-auto w-full max-w-[1240px] px-5 md:px-10 xl:pl-[calc(2.5rem+240px+4rem)]'

export function EditorialRichText({
  markdown,
  bookingHref,
}: {
  markdown: string
  bookingHref?: string
}) {
  const { lede, chapters } = splitChapters(markdown)
  const prose = proseComponents()
  const leadLine = lede ? firstParagraphLine(lede) : null

  const ledeComponents: Components = {
    ...prose,
    p: ({ node, children }) => {
      const n = node as HastNode
      if (leadLine !== null && n.position?.start.line === leadLine) {
        return (
          <p className="font-heading mb-8 text-[28px] font-normal leading-[1.3] tracking-[-0.01em] text-[var(--color-secondary)] [&_strong]:font-medium [&_strong]:text-inherit">
            {children}
          </p>
        )
      }
      if (isAllBold(n)) return <PullLine>{children}</PullLine>
      return (
        <p className="mb-5 text-[20px] leading-[1.7] text-[var(--color-foreground)]/85 md:text-[21px]">
          {children}
        </p>
      )
    },
  }

  const rail: EditorialChapterLink[] = chapters.map(({ id, title }) => ({ id, title }))

  return (
    <div className="relative">
      {lede && (
        <section className="bg-[var(--color-background)] py-16 md:py-24">
          <div className={COLUMN}>
            <div className="max-w-[60ch]">
              <ReactMarkdown components={ledeComponents}>{lede}</ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {chapters.map((chapter, i) => (
        <section
          key={chapter.id}
          data-chapter={chapter.id}
          className={`py-16 md:py-24 ${
            i % 2 === 0 ? 'bg-[var(--color-background)]' : 'bg-[var(--color-surface)]'
          } ${i === 0 && lede ? 'border-t border-[var(--color-foreground)]/[0.08]' : ''}`}
        >
          <div className={COLUMN}>
            <div className="max-w-[68ch]">
              <div className="mb-5 flex items-center gap-4" aria-hidden="true">
                <span className="font-mono text-xs tracking-[0.14em] text-[var(--color-accent-deep)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="h-px w-16 bg-[var(--color-accent-deep)]/50" />
              </div>
              <h2
                id={chapter.id}
                className="font-heading mb-10 scroll-mt-28 text-[clamp(1.875rem,4vw,2.5rem)] font-medium leading-[1.08] tracking-[-0.02em] text-[var(--color-secondary)]"
              >
                {chapter.title}
              </h2>
              {chapter.body && <ReactMarkdown components={prose}>{chapter.body}</ReactMarkdown>}
            </div>
          </div>
        </section>
      ))}

      {rail.length > 0 && (
        <aside className="pointer-events-none absolute inset-0 hidden xl:block">
          <div className="mx-auto h-full max-w-[1240px] px-10 py-16 md:py-24">
            <div className="pointer-events-auto sticky top-[100px] w-[240px]">
              <EditorialRail chapters={rail} ctaHref={bookingHref} />
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
