'use client'

import { cn } from '@/lib/utils'

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Thin border frame - Gusto Wallet style */}
      <div className="pointer-events-none fixed inset-3 z-50 border border-border/40 rounded-lg" />
      
      {/* Main content */}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}
