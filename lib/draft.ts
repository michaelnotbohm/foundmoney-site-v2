// lib/draft.ts
//
// Staged changes for a shared database. Production and every preview
// deployment read the same Supabase rows, so a redesign can't be reviewed on
// a preview URL by editing live values. Instead the new values sit under a
// `draft` key that only non-production deployments apply:
//
//   site_settings.theme.draft   token overrides        (lib/theme.ts)
//   site_settings.footer.draft  footer overrides       (site-footer.tsx)
//   sections.content.draft      content overrides, plus an optional
//                               `variant` and `type` that replace the
//                               section's own (e.g. feature_index -> a
//                               feature_grid variant)
//
// Production ignores the key, so writing a draft never changes the live site.
// Promote after the code that renders it is deployed (SQL in CLAUDE.md).

/**
 * True everywhere except Vercel production. Vercel sets VERCEL_ENV to
 * 'preview' on preview deployments. Locally it is whatever `vercel env pull`
 * wrote (often 'production'), so run `VERCEL_ENV=development npm run dev` to
 * see drafts.
 */
export function showDrafts(): boolean {
  return process.env.VERCEL_ENV !== 'production'
}

/** A section's effective type, variant, and content on this deployment. */
export function resolveSectionDraft(
  type: string,
  variant: string,
  content: Record<string, unknown>,
): { type: string; variant: string; content: Record<string, unknown> } {
  const { draft, ...live } = content
  if (!draft || typeof draft !== 'object' || !showDrafts()) {
    return { type, variant, content: live }
  }
  const {
    type: draftType,
    variant: draftVariant,
    ...overrides
  } = draft as Record<string, unknown>
  return {
    type: typeof draftType === 'string' ? draftType : type,
    variant: typeof draftVariant === 'string' ? draftVariant : variant,
    content: { ...live, ...overrides },
  }
}
