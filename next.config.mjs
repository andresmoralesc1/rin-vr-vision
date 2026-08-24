/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.pexels.com' }] },
};
export default nextConfig;
