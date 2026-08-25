/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // typedRoutes disabled — it requires URL literals; with NAV arrays and
  // dynamic paths the cost outweighs the safety (Route cast pattern fights
  // the data-driven nav). Re-enable once routes are fully literal.
  experimental: { typedRoutes: false },
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.pexels.com' }] },
};
export default nextConfig;
