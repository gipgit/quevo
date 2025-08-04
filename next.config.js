// next.config.js
const createNextIntlPlugin = require('next-intl/plugin');

// IMPORTANT: Pass the correct path to your new i18n/request.js file!
const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-eac238aed876421982e277e0221feebc.r2.dev',
        port: '',
        pathname: '/business/**',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);