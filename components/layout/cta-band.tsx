import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTABandProps {
  heading?: string
  subheading?: string
  primaryCta?: {
    text: string
    href: string
  }
  secondaryCta?: {
    text: string
    href: string
  }
  className?: string
}

export function CTABand({
  heading = "Ready to Get Started?",
  subheading = "Take the first step toward your new home. Our team is here to help.",
  primaryCta = { text: "Apply Now", href: "/apply" },
  secondaryCta = { text: "Contact Us", href: "/connect" },
  className,
}: CTABandProps) {
  return (
    <section className={cn('bg-primary py-16 lg:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl text-balance">
            {heading}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
            {subheading}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-8"
              asChild
            >
              <Link href={primaryCta.href}>
                {primaryCta.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link href={secondaryCta.href}>
                {secondaryCta.text}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
