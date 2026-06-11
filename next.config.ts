import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/tsconfig.tsbuildinfo',
          '**/.git/**',
          '**/next.config.*',
        ],
      }
    }
    return config
  },
}

export default nextConfig
