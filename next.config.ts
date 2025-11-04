import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: '.next-build',
  eslint: {
    // Ignore ESLint errors during production builds to avoid blocking on style/strict rules
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep type checking enabled; set to true to allow builds with type errors
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    // Avoid bundling optional 'canvas' dependency pulled by pdfjs-dist in Node builds
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false as unknown as string, // tell webpack to ignore 'canvas'
      // Ensure pdf-parse doesn't execute its test harness by aliasing to the lib file
      'pdf-parse$': 'pdf-parse/lib/pdf-parse.js',
    };
    return config;
  },
};

export default nextConfig;
