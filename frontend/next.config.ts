import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude problematic packages from server components
  serverExternalPackages: ["pino", "thread-stream"],

  webpack: (config, { isServer }) => {
    // Ignore test files and problematic imports
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Ignore patterns for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },

  // Empty turbopack config to allow webpack config
  turbopack: {},
};

export default nextConfig;
