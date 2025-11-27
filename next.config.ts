import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {}, // Enable Turbopack with default config
  serverExternalPackages: ["@mastra/core", "@mastra/libsql"],

  // Enable static optimization for better caching
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year for optimized images
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://vercel.live wss://*.supabase.co",
              "frame-src 'self' https://vercel.live",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Exclude test files from build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Exclude Jest and test files from compilation
  webpack: (config, { isServer }) => {
    // Exclude archive folder completely
    config.module.rules.push({
      test: /archive\/.*\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });

    // Exclude scripts folder from build
    config.module.rules.push({
      test: /scripts\/.*\.(ts|tsx|js|jsx)$/,
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

    // Fix for pdf-parse dynamic imports
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      // Allow dynamic requires for pdf-parse
      config.module.unknownContextCritical = false;
    }

    return config;
  },
};

export default nextConfig;
