/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-username-spaces.hf.space'],
  },
  // For development with backend on different port
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7860'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;