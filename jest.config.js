/**
 * Jest Configuration for Next.js 15 + TypeScript Project
 * MagicCV - CV Generator with AI
 * 
 * This configuration enables:
 * - TypeScript testing with ts-jest
 * - Module path aliases (@/ -> src/)
 * - Coverage reporting with strict thresholds
 * - Next.js-specific mocks
 */

const nextJest = require('next/jest');

// Create Jest config preset for Next.js
// This automatically handles Next.js internals (SWC, webpack, etc.)
const createJestConfig = nextJest({
  // Path to Next.js app directory
  dir: './',
});

// Custom Jest configuration
const customJestConfig = {
  // ============================================
  // TEST ENVIRONMENT
  // ============================================
  
  /**
   * Test environment: node
   * Use 'node' for API routes and services
   * Use 'jsdom' if testing React components (we're testing services only)
   */
  testEnvironment: 'node',

  // ============================================
  // MODULE RESOLUTION
  // ============================================

  /**
   * Module name mapper for path aliases and static assets
   * Maps import paths to actual file locations
   */
  moduleNameMapper: {
    // Path alias: @/ -> src/
    '^@/(.*)$': '<rootDir>/src/$1',
    
    // Mock static file imports (images, styles)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Mock Next.js specific modules
    '^next/navigation$': '<rootDir>/__mocks__/next-navigation.js',
    '^next/router$': '<rootDir>/__mocks__/next-router.js',
  },

  /**
   * Module paths to search for imports
   * Allows absolute imports from these directories
   */
  modulePaths: ['<rootDir>/src'],

  /**
   * File extensions Jest should recognize
   */
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // ============================================
  // TEST FILE PATTERNS
  // ============================================

  /**
   * Patterns for test files
   * Matches any file with .test.ts, .test.tsx, .spec.ts, .spec.tsx
   */
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/?(*.)+(test|spec).[jt]s?(x)',
  ],

  // ============================================
  // IGNORE PATTERNS
  // ============================================

  /**
   * Paths to ignore when searching for test files
   */
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/dist/',
    '/.vercel/',
    '/e2e/',              // Exclude Playwright E2E tests
    // Conditionally exclude integration tests
    ...(process.env.ENABLE_INTEGRATION_TESTS !== 'true' ? ['/integration/'] : []),
  ],

  /**
   * Module paths to ignore during transformation
   */
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // ============================================
  // SETUP FILES
  // ============================================

  /**
   * Files to run before test suite starts
   * Use for global test setup (e.g., environment variables)
   */
  setupFiles: ['<rootDir>/jest.setup.env.js'],

  /**
   * Files to run after test environment is set up
   * Use for test framework configuration (e.g., extending matchers)
   */
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // ============================================
  // COVERAGE CONFIGURATION
  // ============================================

  /**
   * Enable coverage collection
   */
  collectCoverage: false, // Set to true when running npm test -- --coverage

  /**
   * Patterns for files to collect coverage from
   * Only collect coverage from source files
   */
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/types/**',
    '!src/**/index.ts', // Barrel exports
  ],

  /**
   * Directory where coverage reports will be saved
   */
  coverageDirectory: 'coverage',

  /**
   * Coverage reporters to use
   * - html: Interactive HTML report (coverage/index.html)
   * - lcov: LCOV format for CI/CD tools
   * - text-summary: Brief summary in terminal
   * - text: Detailed table in terminal
   */
  coverageReporters: [
    'html',
    'lcov',
    'text-summary',
    'text',
  ],

  /**
   * Minimum coverage thresholds
   * Tests will FAIL if coverage is below these thresholds
   */
  coverageThreshold: {
    global: {
      lines: 80,      // 80% of lines must be covered
      functions: 80,  // 80% of functions must be covered
      branches: 75,   // 75% of branches must be covered
      statements: 80, // 80% of statements must be covered
    },
    // Stricter thresholds for critical services
    './src/services/cv-generator-service.ts': {
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90,
    },
    './src/services/supabase-service.ts': {
      lines: 85,
      functions: 85,
      branches: 80,
      statements: 85,
    },
  },

  /**
   * Paths to ignore for coverage collection
   */
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/dist/',
    '/__tests__/',
    '/__mocks__/',
    '/test-',
    '.test.',
    '.spec.',
  ],

  // ============================================
  // TRANSFORMATION
  // ============================================

  /**
   * Transform configuration for TypeScript files
   * Note: Next.js preset handles this automatically with SWC
   */
  // transform: {
  //   '^.+\\.(ts|tsx)$': ['ts-jest', {
  //     tsconfig: {
  //       jsx: 'react',
  //       esModuleInterop: true,
  //     },
  //   }],
  // },

  // ============================================
  // PERFORMANCE
  // ============================================

  /**
   * Maximum number of workers to use for parallel test execution
   * - number: exact number of workers
   * - string: percentage of CPUs (e.g., '50%')
   * - undefined: defaults to number of CPUs - 1
   */
  maxWorkers: '50%',

  /**
   * Clear mock calls and instances between every test
   * Ensures test isolation
   */
  clearMocks: true,

  /**
   * Restore mock state between every test
   * Automatically calls jest.restoreAllMocks()
   */
  restoreMocks: true,

  /**
   * Reset mock state between every test
   * Automatically calls jest.resetAllMocks()
   */
  resetMocks: true,

  // ============================================
  // OUTPUT & REPORTING
  // ============================================

  /**
   * Display individual test results
   */
  verbose: true,

  /**
   * Notify on test completion (requires notifier support)
   */
  notify: false,

  /**
   * Notify only on failure
   */
  notifyMode: 'failure-change',

  /**
   * Bail out after N test failures
   * Set to 0 to run all tests regardless of failures
   */
  bail: 0,

  // ============================================
  // TIMEOUT
  // ============================================

  /**
   * Default timeout for tests (in milliseconds)
   * Increase if testing slow operations (e.g., LLM API calls)
   */
  testTimeout: 10000, // 10 seconds

  // ============================================
  // GLOBALS
  // ============================================

  /**
   * Global variables available in all test files
   */
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },

  // ============================================
  // WATCH MODE
  // ============================================

  /**
   * Patterns to ignore in watch mode
   */
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/dist/',
  ],

  /**
   * Watch plugins for enhanced watch mode experience
   */
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};

// Export Jest config with Next.js preset applied
// This merges our custom config with Next.js defaults
module.exports = createJestConfig(customJestConfig);

