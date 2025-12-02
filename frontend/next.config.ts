import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress Turbopack warnings about test files in node_modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Ignore test files in node_modules during build
  transpilePackages: [],
};

export default nextConfig;
