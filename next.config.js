/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Adding configuration for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*', // Default rewrite maintains standard API route
      }
    ];
  }
};

module.exports = nextConfig;
