# Client input — Anthony Simonie, "FMP Website" email, 2026-10-09

Source: Gmail thread `1a121d82b472b3a5` (asimonie33@gmail.com → michael@chatradar.ai, cc Memershy@gmail.com).
Anthony's note: "We can make more changes later if needed, but want to get it live and looking good for now."

## Facts / assets supplied

| Item | Value |
|---|---|
| Booking link (all CTAs, nav "Book a Call", end of every service page) | `https://link.foundmoneypartnerships.com/widget/bookings/anthony-simonie` |
| LinkedIn (use for the firm for now) | `https://www.linkedin.com/in/anthonysimonie/` |
| Facebook (use for the firm for now) | `https://www.facebook.com/anthony.simonie.1` |
| Logo | `Found_Money_Logo_Transparent.webp` attached, but **not the correct logo** (Michael, 2026-10-11) - do not use; correct logo still outstanding |
| Stage photos (3) | `Dynamic Keynote Speaker on Blue-Lit Stage.png`, `Blue-Lit Stage Meet-and-Greet.png`, `Conference Speaker on Branded Stage (1).png` (attachments — save to `assets/`) |
| Sample successes | `Found-Money-Partnerships-Sample-Successes.pdf` (attachment — save to `assets/`; partners will add more, best ones get picked) |
| Podcast appearances | Anthony will send links; idea: "As seen on" strip with logos/screenshots |
| Headshot | Anthony's headshot is being cropped — fit without cutting off; keep all three headshot backgrounds consistent if possible |

Melanie's and Matt's social links: not yet supplied — use Anthony's for the firm until they arrive.

## Company blurb (verbatim, "add somewhere")

> **Found Money Partnerships** combines the expertise of three seasoned professionals: **Anthony Simonie, Melanie Legamaro, and Matt Emershy**.
>
> Together, we bring decades of experience in business growth, strategic relationships, marketing, capital formation, and client acquisition, helping businesses uncover opportunities they may never have realized existed.
>
> Between us, we've built and scaled multiple companies, worked alongside Fortune 500 executives and organizations, advised entrepreneurs and investors, and developed proven systems for attracting ideal clients, referral partners, and high-net-worth investors.
>
> Our experience spans Wall Street, finance, business development, investor relations, sales, digital marketing, organizational growth, and brand positioning.
>
> Together, we help business owners create meaningful connections, strengthen their market positioning, and unlock "found money" opportunities through strategic partnerships, trusted relationships, and scalable growth strategies.

## Home page changes (verbatim from Anthony, with our reading)

**Headshots** — "Please adjust Anthony's headshot to fit without cutting off. Keep all headshot backgrounds same if possible."

**Section 1 (hero)** — Take out the "Boutique Growth Partnership" tagline (eyebrow). Replace the subhead with:

> We offer a customized growth partnership - we're not an agency. We're a growth partner that works alongside you to find revenue you may already be sitting on in the relationships you've built, the audience that knows you but hasn't bought yet, and the growth strategies you haven't tapped into. Then we help you turn those opportunities into more referrals, closed business, and revenues.

**Section 2 (stat strip)** — the "3 / Disciplines under one roof" stat detail becomes:
> LinkedIn strategy, capital connections, full-funnel execution

**Section 3 (scan reveal / "sources of unclaimed revenue")**
- "The 8 is upside down" — the tally numeral renders wrong (see plan: Fraunces 8 glyph).
- Heading changes from "You are not missing an audience. You are missing a system to monetize the one you already have." to:
  > Before You Chase the Next Shiny Marketing Tactic, Let's Monetize What You've Already Built.
- Delete all long dashes site-wide; replace with short ones.
- Relationships column: move "re-engaged" item onto one line; second item becomes:
  > Past clients ready to send business your way if you give them a reason and a way to do it.
- Attention column: headline becomes
  > Money sitting in an audience who is watching, but hasn't taken the next step.
  second item becomes
  > Prospects who went quiet after an initial conversation, simply because you didn't have an effective follow-up strategy.
- Untapped column: headline becomes
  > Money sitting in channels you have access to but haven't put to work.
  third item becomes
  > A sales process designed to speak to everyone, and as a result, connects with no one.

**Section 4** — Keep.

## Services section

Anthony supplied full long-form copy for **five** services (see `services/`):

1. Email Marketing — `services/01-email-marketing.md`
2. LinkedIn — `services/02-linkedin.md`
3. Paid Advertising — `services/03-paid-advertising.md`
4. Branding — `services/04-branding.md`
5. Offer Repositioning — `services/05-offer-repositioning.md`

Each ends with a named CTA that should be a button to the booking link.

## Getting the attachments onto the site

1. In Gmail, open the "FMP Website" email → download the 3 stage photos + the PDF (skip the logo) → move them into this folder's `assets/`.
2. Pull env once: `vercel env pull .env.local` (needs `SUPABASE_SERVICE_ROLE_KEY`).
3. Upload: `node --env-file=.env.local scripts/upload-assets.mjs docs/client-input/2026-10-09-anthony/assets/*`
   The script normalizes names to lowercase-kebab and prints each public URL.
4. Point the DB at them (Phase 1.6 / Phase 4 of `docs/UPDATE_PLAN.md`):
   - stage photos → `media_text.image` on `/team/anthony-simonie`, or an `image` block
   - successes PDF → read it, then write the results into `/case-studies` sections (don't link the raw PDF)
