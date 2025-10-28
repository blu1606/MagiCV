import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {}, // Enable Turbopack with default config
  serverExternalPackages: ["@mastra/core", "@mastra/libsql"],
  // Exclude test files from build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Exclude Jest and test files from compilation
  webpack: (config, { isServer }) => {
    // Exclude archive folder completely
    config.module.rules.push({
      test: /archive\/.*\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });
    
    // Exclude test files from webpack compilation
    config.module.rules.push({
      test: /\.(test|spec|bench)\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });
    
    // Exclude Jest config files
    config.module.rules.push({
      test: /jest\.(config|setup)\.(js|ts)$/,
      loader: 'ignore-loader'
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        process: require.resolve("process/browser"),
      };
    }
    return config;
  },
};

export default nextConfig;
