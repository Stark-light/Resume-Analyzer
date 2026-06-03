/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@resume-analyzer/shared'],
  experimental: { typedRoutes: true },
};

module.exports = nextConfig;