import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PathCardProps {
  title: string
  description: string
  href: string
  imageSrc: string
  imageAlt: string
  className?: string
}

export function PathCard({
  title,
  description,
  href,
  imageSrc,
  imageAlt,
  className,
}: PathCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl bg-muted transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="text-xl font-semibold text-white md:text-2xl">
          {title}
        </h3>
        <p className="mt-2 text-sm text-white/80 line-clamp-2">
          {description}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
          Learn More
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
