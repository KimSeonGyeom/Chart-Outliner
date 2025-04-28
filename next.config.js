/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Adding configuration for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // Proxy API requests to Flask
      }
    ];
  }
};

module.exports = nextConfig;
