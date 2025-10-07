// next.config.js
const createNextIntlPlugin = require('next-intl/plugin');

// IMPORTANT: Pass the correct path to your new i18n/request.js file!
const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN: process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN,
    NEXT_PUBLIC_CLOUDFLARE_R2_ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
  },
  
  // Bundle optimization
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-eac238aed876421982e277e0221feebc.r2.dev',
        port: '',
        pathname: '/business/**',
      },
    ],
  },
  
  // Compression
  compress: true,
  
  // Bundle analyzer (optional - for debugging)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //     };
  //   }
  //   return config;
  // },
};

module.exports = withNextIntl(nextConfig);