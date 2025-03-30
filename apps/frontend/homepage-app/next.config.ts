const isDocker = process.env.NEXT_DISABLE_ESLINT === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: isDocker,
  },
  // other Next.js config...
};

export default nextConfig;
