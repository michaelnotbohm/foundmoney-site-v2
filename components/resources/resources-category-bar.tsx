'use client'

// components/resources/resources-category-bar.tsx
//
// Filter bar for the Resources surface. ADAPTED FROM SCM Roofing's
// resources-category-bar, deliberately simplified for the Bay to Bay tenant:
//
//   - SCM grouped cities by COUNTY (COUNTY_ORDER, citiesByCounty, per-county
//     dropdown sections). Bay to Bay has no county data and chose a CITY-ONLY
//     filter, so the dropdown is a single flat list of cities. The county
//     grouping has been removed on purpose — do not treat its absence as a bug.
//   - The category discriminator is `type === 'location'` here (SCM used
//     `category_type`). The data passed in is already split by the server.
//
// URL model: "All" -> /resources, each city -> /resources/<city-slug>, each
// topic -> /resources/<topic-slug>. Articles are NOT under a city path.

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MapPin } from 'lucide-react'
import type { ResourceCategory } from '@/lib/resources/queries'

interface ResourcesCategoryBarProps {
  locationCategories: ResourceCategory[]
  topicCategories: ResourceCategory[]
  currentSlug?: string
}

export function ResourcesCategoryBar({
  locationCategories,
  topicCategories,
  currentSlug,
}: ResourcesCategoryBarProps) {
  const [citiesExpanded, setCitiesExpanded] = useState(false)

  const hasCategories =
    locationCategories.length > 0 || topicCategories.length > 0
  if (!hasCategories) return null

  const isAllSelected = !currentSlug
  const isCitySelected = locationCategories.some((c) => c.slug === currentSlug)

  return (
    <nav
      className="border-b border-border bg-muted/40 py-4 sticky top-[60px] z-30"
      aria-label="Filter articles by category"
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Main row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* All */}
          <Link
            href="/resources"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isAllSelected
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            All
          </Link>

          {/* Cities dropdown toggle */}
          {locationCategories.length > 0 && (
            <button
              onClick={() => setCitiesExpanded(!citiesExpanded)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isCitySelected
                  ? 'bg-primary text-primary-foreground'
                  : citiesExpanded
                    ? 'border border-primary/50 bg-primary/10 text-primary'
                    : 'border border-border bg-background text-foreground hover:bg-muted'
              }`}
              aria-expanded={citiesExpanded}
              aria-controls="cities-dropdown"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Cities
              <ChevronDown
                className={`h-4 w-4 transition-transform ${citiesExpanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}

          {/* Topic categories (inline pills) */}
          {topicCategories.map((category) => {
            const isSelected = currentSlug === category.slug
            return (
              <Link
                key={category.id}
                href={`/resources/${category.slug}`}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-foreground hover:bg-muted'
                }`}
              >
                {category.name}
              </Link>
            )
          })}
        </div>

        {/* Cities dropdown panel — flat city list (no county grouping) */}
        {citiesExpanded && locationCategories.length > 0 && (
          <div
            id="cities-dropdown"
            className="mt-4 rounded-lg border border-primary/30 bg-background p-4 shadow-sm"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Browse by City
            </p>
            <div className="flex flex-wrap gap-1.5">
              {locationCategories.map((city) => {
                const isSelected = currentSlug === city.slug
                return (
                  <Link
                    key={city.id}
                    href={`/resources/${city.slug}`}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {city.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
