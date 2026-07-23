import ReactMarkdown from 'react-markdown'
import type { BlockProps, RichTextContent } from './types'

/**
 * Prose body — the workhorse block. Markdown rather than raw HTML so content
 * stays editable by non-technical users and safe to render.
 */
export function RichTextBlock({
  content,
  embedded = false,
}: BlockProps<RichTextContent>) {
  const { markdown, align = 'left' } = content

  if (!markdown) return null

  const headingAlign = align === 'center' ? 'text-center' : ''

  const inner = (
    <div className="mx-auto max-w-3xl">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2
              className={`mb-8 font-[var(--font-heading)] text-4xl font-bold tracking-tight text-[var(--color-secondary)] md:text-5xl ${headingAlign}`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-4 mt-10 font-[var(--font-heading)] text-2xl font-semibold tracking-tight text-[var(--color-secondary)]">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-3 mt-8 font-[var(--font-heading)] text-xl font-semibold text-[var(--color-secondary)]">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-6 text-lg leading-[1.8] text-[var(--color-foreground)]/85">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--color-foreground)]">
              {children}
            </strong>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="font-medium text-[var(--color-primary)] underline underline-offset-2"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="mb-6 list-disc space-y-2 pl-6 text-lg leading-[1.8] text-[var(--color-foreground)]/85">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 list-decimal space-y-2 pl-6 text-lg leading-[1.8] text-[var(--color-foreground)]/85">
              {children}
            </ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-8 border-l-4 border-[var(--color-primary)] py-1 pl-6 text-lg italic leading-relaxed text-[var(--color-muted)]">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-12 border-0 border-t border-[var(--color-border)]" />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )

  if (embedded) return <div className="w-full">{inner}</div>

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">{inner}</div>
    </section>
  )
}
