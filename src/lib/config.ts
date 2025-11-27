/**
 * Application Configuration
 * Centralized configuration for magic numbers and constants
 */

/**
 * CV Generation Configuration
 */
export const CV_CONFIG = {
  /** Default number of components to retrieve */
  DEFAULT_COMPONENT_LIMIT: 20,

  /** Maximum number of experiences to include in CV */
  MAX_EXPERIENCES: 20,

  /** Maximum number of additional skills to include */
  MAX_ADDITIONAL_SKILLS: 10,

  /** Number of components to fetch for comprehensive CV */
  COMPREHENSIVE_COMPONENT_LIMIT: 50,

  /** Minimum summary length for quality score */
  MIN_SUMMARY_LENGTH: 50,
} as const;

/**
 * Parallel Processing Configuration
 */
export const PARALLEL_CONFIG = {
  /** Default number of skill categories to process */
  DEFAULT_CATEGORIES_LIMIT: 10,

  /** Default number of top matches per category */
  DEFAULT_TOP_K_PER_CATEGORY: 5,

  /** Maximum concurrent API requests */
  MAX_CONCURRENT_REQUESTS: 10,

  /** Maximum technologies to include per category query */
  MAX_TECHNOLOGIES_PER_QUERY: 10,
} as const;

/**
 * Scoring Configuration
 */
export const SCORING_CONFIG = {
  /** Maximum possible CV score */
  MAX_SCORE: 100,

  /** Score weights for different sections */
  WEIGHTS: {
    /** Experience weight multiplier */
    EXPERIENCE: 10,
    /** Maximum experience score */
    EXPERIENCE_MAX: 40,

    /** Education weight multiplier */
    EDUCATION: 15,
    /** Maximum education score */
    EDUCATION_MAX: 30,

    /** Skill weight multiplier */
    SKILL: 2,
    /** Maximum skill score */
    SKILL_MAX: 30,

    /** Minimum skills threshold */
    SKILL_THRESHOLD: 10,
  },

  /** Points awarded for profile completeness */
  PROFILE_POINTS: 20,

  /** Points awarded for summary */
  SUMMARY_POINTS: 10,

  /** Points awarded for education */
  EDUCATION_POINTS: 20,

  /** Points awarded for projects */
  PROJECT_POINTS: 15,
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  /** Cache TTL in milliseconds (5 minutes) */
  TTL: 5 * 60 * 1000,

  /** Maximum cache size (entries) */
  MAX_SIZE: 100,
} as const;

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
  /** Maximum requests per window */
  MAX_REQUESTS: 100,

  /** Time window in milliseconds (15 minutes) */
  WINDOW_MS: 15 * 60 * 1000,

  /** Maximum requests per user per window */
  MAX_REQUESTS_PER_USER: 50,
} as const;

/**
 * Toast Notification Configuration
 */
export const TOAST_CONFIG = {
  /** Success toast duration (ms) */
  SUCCESS_DURATION: 3000,

  /** Error toast duration (ms) */
  ERROR_DURATION: 5000,

  /** Info toast duration (ms) */
  INFO_DURATION: 4000,

  /** Warning toast duration (ms) */
  WARNING_DURATION: 4000,

  /** Maximum concurrent toasts */
  MAX_TOASTS: 3,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  /** Skeleton loaders count */
  SKELETON_COUNT: 3,

  /** Maximum file size for uploads (5MB) */
  MAX_FILE_SIZE: 5 * 1024 * 1024,

  /** Supported file extensions */
  SUPPORTED_FILE_TYPES: ['.pdf', '.docx', '.txt'] as const,
} as const;

/**
 * Progress Steps Configuration
 */
export const PROGRESS_CONFIG = {
  STEPS: [
    { progress: 20, message: "Analyzing job description..." },
    { progress: 40, message: "Selecting relevant experience..." },
    { progress: 60, message: "Optimizing content with AI..." },
    { progress: 80, message: "Generating PDF..." },
  ],
  /** Progress update interval (ms) */
  UPDATE_INTERVAL: 1000,
} as const;

/**
 * Environment-specific configuration
 */
export const ENV_CONFIG = {
  /** Is production environment */
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  /** Is development environment */
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

  /** Is test environment */
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

/**
 * Get configuration value safely
 */
export function getConfig<T extends keyof typeof CONFIG>(
  section: T
): typeof CONFIG[T] {
  return CONFIG[section];
}

/**
 * All configuration sections combined
 */
export const CONFIG = {
  CV: CV_CONFIG,
  PARALLEL: PARALLEL_CONFIG,
  SCORING: SCORING_CONFIG,
  CACHE: CACHE_CONFIG,
  RATE_LIMIT: RATE_LIMIT_CONFIG,
  TOAST: TOAST_CONFIG,
  UI: UI_CONFIG,
  PROGRESS: PROGRESS_CONFIG,
  ENV: ENV_CONFIG,
} as const;

export default CONFIG;
