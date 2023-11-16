/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => [
    {
      source: '/sign-in',
      destination: '/api/auth/login', //todo
      permanent: true,
    },
    {
      source: '/sign-out',
      destination: '/api/auth/logout', //todo
      permanent: true,
    },
    {
      source: '/sign-up',
      destination: '/api/auth/register', //todo
      permanent: true,
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false

    return config
  },
}

module.exports = nextConfig
