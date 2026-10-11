/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Retired service slugs from the 2026-10 services rework (docs/UPDATE_PLAN.md
  // Phase 3). Old pages stay in the DB; these keep shared links working.
  async redirects() {
    return [
      { source: '/services/email-conversion', destination: '/services/email-marketing', permanent: true },
      { source: '/services/linkedin-leverage', destination: '/services/linkedin', permanent: true },
      { source: '/services/capital-relationships', destination: '/what-we-do', permanent: true },
      { source: '/services/partnership', destination: '/what-we-do', permanent: true },
    ]
  },
}
export default nextConfig
