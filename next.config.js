// next.config.js
const createNextIntlPlugin = require('next-intl/plugin');

// IMPORTANT: Pass the correct path to your new i18n/request.js file!
const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withNextIntl(nextConfig);