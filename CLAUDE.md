# CLAUDE.md — foundmoney-site-v2

Client website for **Found Money Partnerships** (FMP), a boutique revenue-growth advisory founded by Anthony Simonie, Melanie Legamaro, and Matt Emershy. Built on Michael's reusable `clientsites-template` (Next.js App Router + Supabase + Vercel, block-based CMS). Single-site fork: one Supabase project, one Vercel project, no tenant_id.

Repo lives at `~/Developer/foundmoney-site-v2` (never under `~/Documents` or `~/Desktop` — iCloud sync breaks `node_modules`).

## Where things are

| Thing | Value |
|---|---|
| Supabase project | `yuxwipofzxcqgtchoodz` (always pass `project_id` explicitly to the Supabase MCP — it sees every project) |
| Storage bucket | `Public` (capital P; object names are case-sensitive and must match DB URLs exactly) |
| Vercel | project `foundmoney-site` / `prj_gejExZnW48wTzGEAWXxdS59jrII6`, team `team_xIm3ct80D2BwMC1z1IGSUU2p` |
| Domain (not pointed yet) | `foundmoneypartnerships.com` — `site_settings.noindex = true` until launch |
| Booking link (all CTAs) | `https://link.foundmoneypartnerships.com/widget/bookings/anthony-simonie` |
| Current work | `docs/UPDATE_PLAN.md` — Anthony's 2026-10-09 change request, phased. Source copy in `docs/client-input/2026-10-09-anthony/` |

## Commands

```bash
npm install            # npm (package-lock.json is committed); not pnpm
npm run dev            # next dev → http://localhost:3000
npm run build
npx tsc --noEmit       # the real typecheck — run it; Vercel builds can go green with type errors
vercel env pull .env.local   # after `vercel link --project foundmoney-site`
```

`npm run lint` is `eslint .` with no eslint config — don't cite it as passing. No test suite; verify by typecheck + loading the affected route.

Env vars used: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, in `.env.local`), `SUPABASE_SERVICE_ROLE_KEY`, `ASKABLE_WEBHOOK_SECRET`, `ASKABLE_STORAGE_BUCKET`, `ASKABLE_MIRROR_IMAGES` (pull from Vercel).

## How the site works

- **Content is data.** Every page is a `pages` row + ordered `sections` rows (`type`, `variant`, `content` JSONB, `sort_order`). Nothing business-specific belongs in code. Copy/link/image changes are SQL, not commits.
- **`components/blocks/registry.ts`** maps section `type` → component (keyed by type only; `variant` is passed as a prop and handled inside the component). A type missing from the registry renders *nothing*, silently. **Check this file first** when "data is fine but nothing renders."
- `lib/site.ts` → `getSite()` reads the single `site_settings` row (`id = true`): name, domain, logo, nav, footer, social_links, theme. SEO/schema (`lib/seo.ts`, `lib/schema.ts`) derive from it; `social_links` feeds Organization `sameAs`, `team_members.linkedin_url` feeds Person `sameAs`.
- `app/[[...slug]]/page.tsx` renders any page by slug, `revalidate = 60` (ISR). `/resources` is the Askable-fed blog (`posts` table, webhook at `app/api/askable-webhook`).
- Theme: "Heritage Ledger" — deep evergreen primary, brass-gold accent, warm ivory background; Fraunces (display) + Inter (body); pill buttons, square cards; wave-ribbon canvas behind heroes (`components/backgrounds/wave-ribbon-background.tsx`). Tokens live in `site_settings.theme`, applied as CSS variables.
- Fonts are the one hard-coded thing (`app/layout.tsx`, `next/font`). Fraunces' optical-size axis renders some numerals oddly at display sizes (the "upside-down 8") — pin `opsz`/`WONK` or use the sans for big numerals.

## Block types in the registry

`hero` (wave-ribbon) · `rich_text` (markdown) · `cta_band` · `faq` (grouped; emits FAQPage JSON-LD) · `feature_grid` (cards, why-us) · `feature_index` (editorial numbered accordion) · `path_cards` (grid, simple) · `process_timeline` · `quick_facts` · `team_grid` · `image` · `lead_form` (writes `leads`) · `tabbed_panels` · `scan_reveal` · `two_column` (layout; nests other blocks) · `stat_strip`/`stats` · `testimonial(s)` · `media_text`/`image_text`/`scroll_reveal`.

Adding a block: build it generic + theme-token-driven, add the type to `types.ts`, register in `registry.ts`, seed sections. Ask "would another client want this?" before building.

## Database rules (non-negotiable)

1. **Safety ritual before any write:** `select name, domain from public.site_settings;` must return "Found Money Partnerships". The SQL editor/MCP shows no project indicator.
2. Target sections **by UUID** (`where id = '…'`), never by joining through slugs.
3. Every `UPDATE` ends with `returning id` (or the changed field) so the affected row is visible.
4. JSONB patterns: partial field `jsonb_set(content, '{key}', '"value"')` · array replace `jsonb_set(content, '{items}', '[…]'::jsonb)` (prefer whole-array over item patches) · remove key `content - 'key'` · full rewrite `set content = '{…}'::jsonb` · find stale refs `where content::text ilike '%needle%'`.
5. Multiple statements in one `execute_sql` call, separated by `;`, work fine.
6. DDL goes through `apply_migration` with a snake_case name; `admin_users` must exist before the `is_admin()`/`is_owner()` SECURITY DEFINER functions.
7. Storage verification: join `storage.objects` + `storage.buckets` on `b.name = 'Public'`.

## Deploy rules

- A DB change does **not** show until ISR revalidates (60s) *and*, for anything cached at build, a Vercel redeploy with **"Use existing build cache" unchecked**. Tell the client this every time content changes.
- Same-filename image replacements don't bust caches; change the filename (or the extension casing) and update the DB URL.
- Don't let v0 touch `registry.ts`, `block-renderer.tsx`, or `globals.css`. v0 was for the scaffold only.

## Copy conventions (from the client)

- No em/en dashes anywhere — use `-`. Anthony asked for this explicitly (Oct 2026).
- Voice: "we're not an agency, we're a growth partner." Plain, direct, no hype. Every service page ends with its own CTA label pointing at the booking link.
- Partner cards: tight, face-centered crops; keep the three headshot backgrounds consistent.

## People

- Michael Notbohm (owner/dev, GitHub `michaelnotbohm`) · Anthony Simonie (client lead, asimonie33@gmail.com) · Matt Emershy (cc'd on client email) · Melanie Legamaro.
