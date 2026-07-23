'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ScrollRevealSectionProps {
  imageSrc: string
  imageAlt: string
  heading: string
  description: string
  imagePosition?: 'left' | 'right'
  className?: string
  children?: React.ReactNode
}

export function ScrollRevealSection({
  imageSrc,
  imageAlt,
  heading,
  description,
  imagePosition = 'left',
  className,
  children,
}: ScrollRevealSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={cn('py-16 lg:py-24 overflow-hidden', className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'grid gap-8 lg:grid-cols-2 lg:gap-16 items-center',
            imagePosition === 'right' && 'lg:[&>*:first-child]:order-2'
          )}
        >
          {/* Image */}
          <div
            className={cn(
              'relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted transition-all duration-700 ease-out',
              isVisible
                ? 'opacity-100 translate-x-0'
                : imagePosition === 'left'
                ? 'opacity-0 -translate-x-8'
                : 'opacity-0 translate-x-8'
            )}
            style={{
              transitionDelay: '0.1s',
            }}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Content */}
          <div
            className={cn(
              'flex flex-col transition-all duration-700 ease-out',
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            )}
            style={{
              transitionDelay: '0.2s',
            }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              {heading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
            {children && <div className="mt-6">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}
