/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.jianglixin.online',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '7860',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // 确保环境变量优先级最高，默认指向 CF Tunnel
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.jianglixin.online'}/api/:path*`,
      },
    ];
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require('remark-math')],
    rehypePlugins: [require('rehype-katex')],
  },
});

module.exports = withMDX(nextConfig);