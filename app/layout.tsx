// app/layout.tsx
//
// Root metadata derives entirely from the site_settings row. There are no
// hardcoded domains, titles, descriptions, or OG images — that pattern is
// what puts the wrong business identity into every page of a client site.
//
// Fonts are the one thing that stays in code: next/font requires static
// imports at build time. The theme's fontHeading / fontBody tokens select
// which of these the CSS variables point at.

import type { Metadata } from 'next'
import { Fraunces, Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { getSite } from '@/lib/site'
import { rootMetadata } from '@/lib/seo'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['opsz'],
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()

  // No site row yet (fresh template, missing env vars). Return something
  // inert rather than throwing — the page itself will 404.
  if (!site) {
    return {
      title: 'Site',
      robots: { index: false, follow: false },
    }
  }

  return rootMetadata(site)
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
