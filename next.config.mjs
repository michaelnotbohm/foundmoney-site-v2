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
  async redirects() {
    return [
      // GoHighLevel funnel paths that used to live on go.foundmoneypartnerships.com
      // before that host was pointed at this site (2026-10-15). The GHL pages still
      // exist on the apex, so send printed QR codes / old links there. Host-scoped so
      // nothing fires on clientsites.dev or the apex. Temporary (307) on purpose: if
      // go. is handed back to GHL later, nothing is cached as permanent.
      {
        source: '/photo--opt-in',
        has: [{ type: 'host', value: 'go.foundmoneypartnerships.com' }],
        destination: 'https://foundmoneypartnerships.com/photo--opt-in',
        permanent: false,
      },
      // Add further GHL paths from Anthony here, same shape:
      // {
      //   source: '/some-funnel-page',
      //   has: [{ type: 'host', value: 'go.foundmoneypartnerships.com' }],
      //   destination: 'https://foundmoneypartnerships.com/some-funnel-page',
      //   permanent: false,
      // },

      // Retired service slugs from the 2026-10 services rework (docs/UPDATE_PLAN.md
      // Phase 3). Old pages stay in the DB; these keep shared links working.
      { source: '/services/email-conversion', destination: '/services/email-marketing', permanent: true },
      { source: '/services/linkedin-leverage', destination: '/services/linkedin', permanent: true },
      { source: '/services/capital-relationships', destination: '/what-we-do', permanent: true },
      { source: '/services/partnership', destination: '/what-we-do', permanent: true },
    ]
  },
}
export default nextConfig
