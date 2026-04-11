/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker — copies only the necessary files for production
  output: 'standalone',
};

export default nextConfig;
