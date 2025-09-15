import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during production builds to avoid blocking on style/strict rules
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep type checking enabled; set to true to allow builds with type errors
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
