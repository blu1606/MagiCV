/**
 * Jest Setup - After Environment
 * 
 * This file runs AFTER test environment is set up
 * Use for:
 * - Extending Jest matchers
 * - Global test utilities
 * - Custom assertions
 */

// ============================================
// EXTENDED MATCHERS (Optional)
// ============================================

// Add custom matchers if needed
// import '@testing-library/jest-dom'; // For React component testing

// ============================================
// GLOBAL TEST UTILITIES
// ============================================

/**
 * Global test helper: Create mock Component
 */
global.createMockComponent = (overrides = {}) => ({
  id: 'comp_123',
  user_id: 'user_123',
  type: 'experience',
  title: 'Software Engineer',
  organization: 'Tech Corp',
  description: 'Built amazing features',
  highlights: ['Achievement 1', 'Achievement 2'],
  start_date: '2020-01',
  end_date: '2023-12',
  embedding: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Global test helper: Create mock Profile
 */
global.createMockProfile = (overrides = {}) => ({
  id: 'user_123',
  full_name: 'John Doe',
  profession: 'Software Engineer',
  bio: 'Passionate developer',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Global test helper: Create mock embedding vector
 */
global.createMockEmbedding = (dimension = 768) => {
  return Array(dimension).fill(0).map(() => Math.random());
};

/**
 * Global test helper: Create mock LLM response
 */
global.createMockLLMResponse = (format = 'json') => {
  const data = {
    experiences: [
      {
        id: 'comp_1',
        title: 'Senior Developer',
        organization: 'Tech Corp',
        location: 'San Francisco, CA',
        remote: false,
        start: 'Jan 2020',
        end: 'Present',
        bullets: ['Led team of 5', 'Increased performance by 50%'],
      },
    ],
    education: [
      {
        id: 'comp_2',
        school: 'Stanford University',
        degree: 'BSc Computer Science',
        concentration: 'AI/ML',
        location: 'Stanford, CA',
        graduation_date: 'May 2019',
        gpa: '3.8/4.0',
        coursework: ['Algorithms', 'Machine Learning'],
        awards: ['Dean\'s List'],
      },
    ],
    skills: {
      technical: ['TypeScript', 'React', 'Node.js'],
      languages: [{ name: 'English', level: 'Native' }],
      interests: ['AI', 'Open Source'],
    },
    projects: [
      {
        id: 'comp_3',
        title: 'AI CV Generator',
        organization: 'Personal',
        location: 'Remote',
        start: 'Jan 2023',
        end: 'Dec 2023',
        bullets: ['Built with Next.js', 'Integrated AI'],
      },
    ],
  };

  if (format === 'json') {
    return JSON.stringify(data);
  } else if (format === 'markdown') {
    return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
  } else if (format === 'invalid') {
    return 'This is not valid JSON { invalid }';
  }

  return JSON.stringify(data);
};

/**
 * Global test helper: Suppress console methods
 */
global.suppressConsole = () => {
  const originalConsole = global.console;
  
  beforeAll(() => {
    global.console = {
      ...originalConsole,
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
  });

  afterAll(() => {
    global.console = originalConsole;
  });
};

// ============================================
// GLOBAL MOCKS
// ============================================

// Mock Buffer if needed (for PDF testing)
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// ============================================
// ERROR HANDLING
// ============================================

// Catch unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

// ============================================
// SETUP COMPLETE
// ============================================

console.log('✅ Jest setup complete - Global test utilities loaded');

