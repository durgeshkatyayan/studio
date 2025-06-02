import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['http://192.168.31.176:3000'],
  // Example: image optimization settings
  images: {
    domains: ['via.placeholder.com'], // add your image domains here
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental options you might want
  experimental: {
    optimizeCss: true,
  },

  // You can add rewrites or redirects if needed
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.31.176:3001/api/:path*',
      },
    ];
  }

};

export default nextConfig;
