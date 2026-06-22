import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For production builds (Webpack)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },

  // For local development (Turbopack)
  turbopack: {
    resolveAlias: {
      canvas: "./src/canvas-mock.ts",
    },
  },
};

export default nextConfig;
