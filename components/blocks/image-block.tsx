import Image from 'next/image'
import type { BlockProps, ImageContent } from './types'

const aspectMap: Record<string, string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  wide: 'aspect-[21/9]',
}

export function ImageBlock({ content, embedded = false }: BlockProps<ImageContent>) {
  const { src, alt, caption, aspect = 'video', position } = content

  if (!src) return null

  const figure = (
    <figure className={embedded ? 'w-full' : 'mx-auto max-w-4xl'}>
      <div
        className={`relative overflow-hidden ${aspectMap[aspect] ?? aspectMap.video}`}
        style={{ borderRadius: 'var(--radius)' }}
      >
        <Image
          src={src}
          alt={alt || ''}
          fill
          className="object-cover"
          style={{ objectPosition: position }}
          sizes={embedded ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 896px) 100vw, 896px'}
        />
      </div>
      {caption && (
        <figcaption className="mt-4 text-center text-sm text-[var(--color-muted)]">
          {caption}
        </figcaption>
      )}
    </figure>
  )

  if (embedded) return figure

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">{figure}</div>
    </section>
  )
}
