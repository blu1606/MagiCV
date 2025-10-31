// Mastra configuration
// The config is now handled by @mastra/core
// This file helps resolve crypto and other Node.js module issues

export default {
  // Add any Mastra-specific configuration here
  // This helps resolve crypto and other Node.js module issues
  bundler: {
    // Prevent circular dependency issues by excluding problematic packages
    external: [
      '@mastra/loggers',
      '@opentelemetry/api',
      '@opentelemetry/core',
      '@opentelemetry/resources',
      '@opentelemetry/sdk-trace-base',
      '@opentelemetry/instrumentation'
    ],
    // Optimize bundling to avoid self-referencing exports
    treeshake: true,
  },
} as const;
