# FMP Design Upgrade — "The Ledger" direction

Reference mock: Claude Design artifact "FMP Homepage Redesign" (Michael has the link). This doc turns that mock into component-level work in this repo. Do it **after** the content phases in `docs/UPDATE_PLAN.md` (or at least Phase 1), on a branch (`design/ledger`), with a Vercel preview for Anthony.

## Diagnosis of the current site

Palette and type are already distinctive (evergreen / brass / ivory, Fraunces). The problem is execution, which is why it reads as a template:

- Everything is centered. No asymmetry, no hierarchy between sections.
- Ivory on ivory on ivory. Dark evergreen appears once (final CTA band). Brass is a hairline, never a surface.
- No imagery above the fold, no social proof, no logos, no founders' faces until 80% down the page.
- Inter body text. Thin outlined cards. No motion except the wave canvas.
- Team pages: `media_text` grid is `items-center`; the bio is ~2,400px tall so the headshot sits mid-page and the top of the page looks broken (empty left column).
- The big tally numeral is Fraunces at display size, so the `8` renders with the heavy bowl on top (Anthony: "the 8 is upside down").

## The direction

**Private-bank editorial.** Confident, dark, quiet luxury with one warm metallic accent. The ledger / statement metaphor runs through the site: ruled lines, tabular mono numerals, running totals, a "statement" card. It should feel like the firm that handles money, not the agency that sells funnels.

### Tokens (update `site_settings.theme` + `app/globals.css`)

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#1F3D32` | evergreen, buttons, headings on light |
| `--color-secondary` | `#15291F` | deep evergreen, dark sections |
| `--color-accent` | `#D4B36A` | brass light, primary CTA fill on dark, highlights |
| `--color-accent-deep` | `#B08A3F` | brass, numerals, eyebrows on light |
| `--color-background` | `#FAF7F0` | ivory |
| `--color-surface` | `#F2EDE2` | ivory-2, alternating sections |
| `--color-foreground` | `#141A17` | ink |
| `--color-muted` | `#6B7069` | |
| `--color-border` | `#E6DFCF` | |
| `--radius` | `12px` cards, `999px` buttons | |

### Type (`app/layout.tsx` — the one hard-coded place)

- Display: **Fraunces** (keep), `font-variation-settings: 'opsz' 144`, weight 500 for headings, 300 for the giant numerals. Letter-spacing -0.02em.
- Body: **Instrument Sans** (replaces Inter). 16–19px, line-height 1.6.
- Mono: **IBM Plex Mono** for eyebrows (12px, 0.18em tracking, uppercase), ledger numbers, step labels, proof-strip captions. `font-variant-numeric: tabular-nums`. **This also fixes the upside-down 8** — the `.scan-num` tally uses the mono, not Fraunces.

### Motion (one orchestrated moment, not scattered)

- Hero: staggered rise-in on eyebrow → headline → subhead → CTAs → ledger card (`animation-delay` 0 / 80 / 180 / 300 / 420ms). CSS only. Respect `prefers-reduced-motion`.
- Cards: `translateY(-4px)` + shadow on hover.
- "As heard on" strip: CSS marquee.
- Scan-reveal tally keeps its count-up; it's a good moment — just restyle it.
- Nothing else animates. Restraint is the point.

### Texture

- Grain overlay on dark sections (inline SVG `feTurbulence`, opacity .07, `mix-blend-mode: overlay`).
- Wave ribbon stays on the hero but in brass at ~0.5 opacity on the dark ground, and only there (drop it from secondary-page heroes; use the ruled-line background instead).
- Stage photos get an evergreen duotone treatment via CSS filter (`grayscale(1) sepia(.35) hue-rotate(95deg) saturate(.9)`), with a gradient fade into the section background.

## Section-by-section (home)

| # | Section | Block | Change |
|---|---|---|---|
| 1 | Nav | `site-nav.tsx` | Sticky, `backdrop-filter: blur`, ivory at 88%. Brand mark: small evergreen circle with brass ring until a real logo arrives. Links: What We Do · Services · Partners · Results. CTA pill evergreen, 46px. |
| 2 | Hero | `hero-block.tsx` — new variant `ledger` | Dark `--color-secondary` ground. Two-column: left = eyebrow with rule, 76px Fraunces headline (accent clause in brass italic), subhead, brass pill CTA + ghost CTA, mono trust line. Right = **the ledger card**: ivory, rotated -1.2°, 8 ruled rows with checks, total line "Sources of unclaimed revenue **08**" in mono brass. Content: `headline`, `headlineAccent`, `subhead`, `primaryCta`, `secondaryCta`, `trustLine`, `ledger: {title, rows[], totalLabel}`. **The ledger card is a client component and animates:** on mount (after the hero's text has risen in, ~600ms), rows reveal top-to-bottom ~120ms apart, each gets its check as it lands, and the total counts up 00 → N (N = rows.length, mono, tabular) in step with the rows. One pass, no replay control, `prefers-reduced-motion` renders the final state immediately. Reuse the IntersectionObserver + counter pattern from `scan-reveal-block.tsx`. The total is derived from the rows, never typed in. |
| 3 | Proof strip | `stat_strip` — new variant `inline` | One row, no cards: big Fraunces number + small caption, 4 up, hairline above/below. |
| 4 | As heard on | **new block** `logo_strip` | Marquee of logos/screenshots. Content: `label`, `items: [{image, alt, href?}]`. Ships with `[Podcast logo]` text placeholders until Anthony sends links. |
| 5 | Where the money hides | `scan_reveal` restyle | Left-aligned 56px headline + right-column intro paragraph. Three white cards with 64px brass numerals `01 02 03`, mono eyebrow, Fraunces h3, ruled rows for items. Tally numeral → mono. |
| 6 | Services | `feature_grid` — new variant `bento` | 6-col grid: 3 + 3 / 2 + 2 + 2. Cards 01 and 05 evergreen, the rest white. Mono index, Fraunces 28px title, one-liner, brass arrow link with the service's own CTA label. Five services per the content plan. |
| 7 | Credibility band | `media_text` — new variant `band` | Full-bleed split: duotone stage photo (left, gradient into evergreen) / copy (right) with eyebrow, 48px headline, Anthony's company blurb, three mini headshots with brass rings, "Meet the partners" link. |
| 8 | Process | `process_timeline` — new variant `columns` | Four columns, 2px evergreen top rule, mono `STEP 01`, Fraunces 24px title, body. No circles. |
| 9 | Results | `testimonials` restyle | Three white quote cards, big brass open-quote glyph, Fraunces 22px quote, attribution row. Populate from the successes PDF (Phase 4). |
| 10 | Partners | `path_cards` — new variant `portrait` | 4:5 portraits, `object-position: center 20%` (fixes Anthony's crop), brass underline tab, Fraunces name, mono role, one-liner. Whole card is the link. |
| 11 | Final CTA | `cta_band` restyle | Dark ground, radial brass glow behind, 68px headline, brass pill 60px, mono reassurance line. |
| 12 | Footer | `site-footer.tsx` | Darker evergreen `#0F1E17`, four columns incl. the five services, socials from `site_settings.social_links`. |

## Secondary pages

- **Service pages**: ruled-line hero (no wave), left-aligned H1 with brass italic accent, then the long-form copy in a 68ch measure with Fraunces H2s and brass mono section numbers; "What we focus on" lists become the ruled-row pattern; final `cta_band` with the service's own CTA label.
- **Team pages**: `media_text` → `items-start` and make the photo column `position: sticky; top: 100px`. Pull-quote heading stays. Add the stage photo gallery (`image` block, 3-up) under Anthony's bio.
- **About**: credibility band + partners grid + Anthony's company blurb as the opener.
- **Contact**: keep the form but lead with the booking embed (`booking_embed` block, optional) or a brass pill to the booking link above the fold.

## Conversion checklist baked into the above

- Primary CTA visible in nav, hero, after services, after proof, final band. One label, one destination (booking link).
- Proof within the first viewport (stat strip) and second (as-heard-on).
- Founders' faces by the third scroll.
- Every service card ends in its own CTA label (Anthony's).
- Reassurance microcopy under every CTA ("No pressure. No canned pitch.").
- Mobile: grids collapse to 1-col, hero stacks ledger card below copy, marquee still runs, nav collapses to brand + CTA.

## Order of work for Claude Code

1. Tokens + fonts (`globals.css`, `layout.tsx`, `site_settings.theme`). Fix `.scan-num` to mono. Team-page `items-start` + sticky. → PR 1, small, safe.
2. Hero `ledger` variant + nav + footer + final CTA restyle. → PR 2. Preview to Anthony.
3. Proof strip, scan-reveal restyle, services `bento`, process `columns`, partners `portrait`. → PR 3.
4. `logo_strip` block, credibility `band` variant, testimonials restyle, service-page layout. → PR 4.

Every new variant is registered in `components/blocks/registry.ts` (type-keyed; variant handled inside the component) and typed in `components/blocks/types.ts`. Generic first: another client should be able to use `ledger`, `bento`, `portrait`, `logo_strip` with their own tokens.
