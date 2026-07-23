import { getTeamMembers } from '@/lib/site'
import type { BlockProps, TeamGridContent } from './types'
import { TeamGridClient } from './team-grid-client'

/**
 * Reads published team_members and hands them to the client component for
 * the modal interaction. No tenant scope — this database serves one business.
 */
export async function TeamGridBlock({
  content,
  site,
}: BlockProps<TeamGridContent>) {
  const { heading, subheading, cta } = content

  const members = await getTeamMembers()
  if (members.length === 0) return null

  return (
    <TeamGridClient
      members={members}
      heading={heading}
      subheading={subheading}
      cta={cta}
      licenseLabel={site.license_label}
    />
  )
}
