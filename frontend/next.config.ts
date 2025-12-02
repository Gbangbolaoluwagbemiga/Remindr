import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Turbopack (Next.js 16 default)
  turbopack: {
    // Turbopack configuration if needed
  },
  // Suppress workspace root warning
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
