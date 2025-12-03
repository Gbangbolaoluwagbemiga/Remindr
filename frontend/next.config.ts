import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Exclude problematic packages from server components
  serverExternalPackages: ["pino", "thread-stream"],
  // Set outputFileTracingRoot to silence the workspace warning
  outputFileTracingRoot: path.join(__dirname, "../"),

  webpack: (config, { isServer }) => {
    // Ignore test files and problematic imports
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Stub Solana dependencies since we only use EVM chains
      "@solana/kit": path.resolve(__dirname, "./webpack-stubs/solana-kit.js"),
    };

    // Use IgnorePlugin to ignore optional dependencies
    const webpack = require("webpack");
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@solana\/program\/system$/,
      }),
      // Ignore React Native dependencies (not needed for web)
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      }),
      // Ignore optional pino-pretty dependency
      new webpack.IgnorePlugin({
        resourceRegExp: /^pino-pretty$/,
      })
    );

    // Ensure proper module resolution
    config.resolve.extensions = [
      ".js",
      ".jsx",
      ".mjs",
      ".ts",
      ".tsx",
      ".json",
      ...(config.resolve.extensions || []),
    ];

    // Ignore test files from node_modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /node_modules.*\.(test|spec)\.(js|ts|mjs)$/,
      use: "ignore-loader",
    });

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
