// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
 
};

const withNextIntl = require('next-intl/plugin')('./src/i18n.js');

module.exports = withNextIntl(nextConfig);