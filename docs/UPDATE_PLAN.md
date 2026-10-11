# FMP Website — Update Plan from Anthony's 2026-10-09 email

Goal (Anthony's words): "get it live and looking good for now." Everything below is scoped to that. Source material is in `docs/client-input/2026-10-09-anthony/`.

Site = `foundmoney-site-v2` · Supabase `yuxwipofzxcqgtchoodz` · Vercel `foundmoney-site` (`prj_gejExZnW48wTzGEAWXxdS59jrII6`, team `team_xIm3ct80D2BwMC1z1IGSUU2p`). Content lives in `public.sections.content` (JSONB); code only changes where a block needs new behavior.

---

## Phase 0 — Before touching anything (Michael, ~10 min)

1. Save the five email attachments into `docs/client-input/2026-10-09-anthony/assets/`:
   `Found_Money_Logo_Transparent.webp`, the 3 stage PNGs, `Found-Money-Partnerships-Sample-Successes.pdf`. (Gmail MCP can read the email but not download attachments.)
2. `cd ~/Developer/foundmoney-site-v2 && vercel link --project foundmoney-site && vercel env pull .env.local` (the env file in the repo already has the public Supabase URL + anon key; `SUPABASE_SERVICE_ROLE_KEY` and `ASKABLE_*` come from Vercel).
3. `npm install && npm run dev` → confirm `http://localhost:3000` renders the current site. Run `npx tsc --noEmit` once to get the type baseline.
4. Confirm the `FeatureIndex` issue from the last session is actually resolved: the DB sections are now `type = 'feature_index'` and `registry.ts` maps `feature_index` → `FeatureIndexBlock` (commits 9f389c4/e587c71). Verify on localhost; if the old cards still show on prod it is only the Vercel build cache.

## Phase 1 — Global: booking link, socials, logo, dashes (SQL, 1 session)

All via Supabase MCP `execute_sql` on `yuxwipofzxcqgtchoodz`. **Safety ritual first:** `select name, domain from public.site_settings;` must return Found Money Partnerships.

| # | Change | Where |
|---|---|---|
| 1.1 | Nav CTA "Book a Call" → `https://link.foundmoneypartnerships.com/widget/bookings/anthony-simonie` | `site_settings.nav.cta.href` |
| 1.2 | Every `cta_band` section `cta.href` and every hero `primaryCta.href` → booking link (13 cta_bands + home hero). Label stays "Book your revenue discovery call" unless Anthony's per-service CTA label applies (Phase 3). | `sections` where `type in ('cta_band','hero')` |
| 1.3 | Team-page media_text CTAs ("Book a call with Anthony/Melanie/Matt") → booking link | 3 `media_text` sections on `/team/*` |
| 1.4 | `social_links = {"linkedin": "https://www.linkedin.com/in/anthonysimonie/", "facebook": "https://www.facebook.com/anthony.simonie.1"}` (feeds Organization `sameAs`) | `site_settings.social_links` |
| 1.5 | `team_members.linkedin_url` for Anthony = his LinkedIn (Person `sameAs`). Melanie/Matt stay null until they send theirs. | `team_members` |
| 1.6 | Upload `Found_Money_Logo_Transparent.webp` to Storage bucket `Public` (keep filename casing), set `site_settings.logo_url`. Check it on the ivory nav background; if it needs a dark variant, `logo_dark_url`. Also set `favicon_url` + theme `default_og_image` if the logo works as an OG fallback. | Storage + `site_settings` |
| 1.7 | **Dash pass** — Anthony: "Delete all long dashes, replace with short ones." One `UPDATE` over `sections.content`, `pages.meta_description`, `team_members.bio`, `site_settings.tagline/description`: replace ` — ` → ` - `, then any remaining `—` / `–` → `-`. Also grep the repo for hard-coded `—` in components (e.g. `feature-index.tsx`, footer). | DB + code |
| 1.8 | Contact page: keep the lead form, but add the booking link as the primary action. Cheapest: a `cta_band` above the form pointing at the booking link. Better (optional, one new block): a `booking_embed` block that iframes the GHL widget — see Phase 5. | `/contact` sections |

Vercel: redeploy with **"Use existing build cache" unchecked** after this batch (ISR + build cache hides JSONB changes).

## Phase 2 — Home page edits (SQL + one small code fix)

Section UUIDs are current as of 2026-10-11.

| # | Section | Change |
|---|---|---|
| 2.1 | Hero `58bd34e6-…` | `content - 'eyebrow'` (remove "Boutique Growth Partnership"); `subhead` → Anthony's new paragraph (in README). Keep headline/accent/proofItems. |
| 2.2 | Stat strip `dc2e2db4-…` | stats[1].detail → "LinkedIn strategy, capital connections, full-funnel execution" |
| 2.3 | Scan reveal `6b437d82-…` | `heading` → "Before You Chase the Next Shiny Marketing Tactic, Let's Monetize What You've Already Built."<br>Relationships col: item[1] → "Past clients ready to send business your way if you give them a reason and a way to do it."; item[0] shortened so it fits one line ("A buyers list that has never been re-engaged.").<br>Attention col: headline → "Money sitting in an audience who is watching, but hasn't taken the next step."; item[1] → "Prospects who went quiet after an initial conversation, simply because you didn't have an effective follow-up strategy."<br>Untapped col: headline → "Money sitting in channels you have access to but haven't put to work."; item[2] → "A sales process designed to speak to everyone, and as a result, connects with no one." |
| 2.4 | **"The 8 is upside down"** — code | `.scan-num` in `components/blocks/scan-reveal-block.tsx` renders the tally in Fraunces at ~3.4rem. Fraunces' optical-size axis gives the `8` a bigger top bowl at display sizes, which reads as upside-down. Fix: set `font-variation-settings: 'opsz' 9, 'WONK' 0` on `.scan-num`, or switch that one numeral to `var(--font-sans)`. Verify at desktop and mobile. |
| 2.5 | Section 4 (`rich_text` "Introducing the Found Money approach") | Keep. |
| 2.6 | Headshots (`path_cards` `bcc06675-…` on home, `c4f9ca45-…` on About) | `components/path-card.tsx` uses `aspect-[4/3] object-cover` which crops Anthony's portrait. Options, in order of effort: (a) re-crop `anthony.jpg` to 4:3 with face centered and re-upload under a new filename (cache-bust), (b) add an optional `imagePosition` (`object-position`) per card, (c) change the partner-card aspect to 3:4 / 1:1 for the team variant. Anthony also wants all three headshot backgrounds consistent — easiest is to run all three through the same background removal + a single brand-ivory/evergreen backdrop (Canva MCP `remove-background` is connected). |
| 2.7 | Company blurb | Add Anthony's "Found Money Partnerships combines the expertise…" paragraph as a `rich_text` on **About** directly under the hero (sort_order 1, shift others), and reuse the first paragraph as `site_settings.description` for the Organization schema. |
| 2.8 | Services index on home (`feature_index` `a6177bb4-…`) | Rewrite the four items to the five new services (see Phase 3) with `href`s to the new slugs. |

## Phase 3 — Services: 4 pages → 5 pages (SQL, biggest chunk)

Anthony's copy defines five services. Current site has four with different framing. Mapping:

| New service | New slug | Replaces | Final CTA label |
|---|---|---|---|
| Email Marketing | `services/email-marketing` | `services/email-conversion` | Let's Find the Money Hiding in Your Email List → |
| LinkedIn | `services/linkedin` | `services/linkedin-leverage` | Let's Find the Money Hiding in Your LinkedIn Network → |
| Paid Advertising | `services/paid-advertising` | — (new) | Uncover My Hidden Revenue Opportunities → |
| Branding | `services/branding` | — (new) | Let's Uncover Your Brand's Hidden Potential → |
| Offer Repositioning | `services/offer-repositioning` | — (new) | Let's Uncover the Hidden Value in Your Offer → |

Per page: `hero` (compact, wave-ribbon, eyebrow "What We Do", headline = Anthony's H1 split into headline/accent) → `rich_text` (markdown from `docs/client-input/.../services/0N-*.md`, H2s preserved; the "we focus on / depending on your business" bullet lists can stay as markdown lists or be lifted into a `feature_grid` `why-us` for scannability) → `cta_band` with Anthony's CTA label and the booking link. Set `pages.meta_title/meta_description` per page from the H1 + first bold line.

Decisions for Michael/Anthony (don't block on them — default in parentheses):
- `services/capital-relationships` and `services/partnership` aren't in Anthony's five. (Default: unpublish both, keep the content; fold "done-with-you" into the home process_timeline which already covers it. Ask Anthony whether capital/investor relationships is still a service or belongs on Melanie's bio.)
- Old slugs: add `redirects` in `next.config.mjs` (`/services/email-conversion` → `/services/email-marketing`, `/services/linkedin-leverage` → `/services/linkedin`, the two retired ones → `/what-we-do`). Site is still `noindex`, so this is hygiene, not SEO rescue.
- The `/what-we-do` page: `feature_index` `0d184bb7-…` → five items; `tabbed_panels` and `process_timeline` stay; lead-form `subjectTypes` on `/contact` → the five service names + "Not sure yet".
- Nav: "What We Do" can stay a single link, or become the five services + What We Do (default: keep single link; footer "Company" column lists the five).

## Phase 4 — Proof: successes, "As seen on", stage photos (content, after Phase 1–3)

- `Found-Money-Partnerships-Sample-Successes.pdf` → read it, pull 3–6 concrete results, and populate `/case-studies` (currently "Coming soon") with a `testimonials` or `quick_facts` block. Anthony said partners will add more and "we can select some of the best ones" — ship with what's in the PDF, mark the page for a second pass.
- "As seen on" strip: Anthony will send podcast links; design a small logo/screenshot row (`stat_strip`-style or a new `logo_strip` block) placed on home under the hero or above "Meet the partners". Placeholder until links arrive; don't scrape the Google search URLs he sent.
- Stage photos (3 PNGs): use on Anthony's `/team/anthony-simonie` page (media_text image or an `image` block gallery) and one as the About page hero/background candidate. Upload to `Public` bucket with lowercase, hyphenated names.

## Phase 5 — Optional code work (only if time allows before launch)

1. `booking_embed` block (type `booking_embed`, variant `iframe`): renders the GHL widget inline on `/contact`. Register in `registry.ts`, add to `types.ts`. Generic — any client with a calendar embed benefits.
2. `path-card.tsx` `imagePosition` support (2.6b).
3. Hard-coded em dashes in components.

## Phase 6 — Launch checklist (unchanged from project notes)

Contact email/phone + address decision (Organization vs LocalBusiness) still null · GA4/Pixel in `integrations` · domain + www→apex 301 · preflight (title, canonical, JSON-LD, sitemap, lead form writes a row) · flip `site_settings.noindex = false` · Vercel redeploy without build cache.

---

## Suggested Claude Code session order

1. `Phase 0` by hand, then open Claude Code in `~/Developer/foundmoney-site-v2`.
2. Session A: Phase 1 + Phase 2 (global SQL, home edits, the 8 fix, headshots). Redeploy. Send Anthony a preview.
3. Session B: Phase 3 (five service pages). Redeploy.
4. Session C: Phase 4 proof + whatever Anthony sends back; Phase 6 when he says go.

Each session: read `CLAUDE.md`, run the safety-ritual SELECT before any UPDATE, use `RETURNING id` on every UPDATE, and target sections by UUID.
