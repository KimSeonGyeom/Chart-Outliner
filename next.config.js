/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force Next.js to use SWC for compilation even with a custom Babel config
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  }
};

module.exports = nextConfig;
