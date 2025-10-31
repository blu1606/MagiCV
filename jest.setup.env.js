/**
 * Jest Setup - Environment Variables
 * 
 * This file runs BEFORE test environment is set up
 * Use for setting environment variables needed for tests
 */

const fs = require('fs');
const path = require('path');

// ============================================
// LOAD .env.test IF EXISTS
// ============================================

const envTestPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
  console.log('📄 Loading .env.test for integration tests...');
  const envContent = fs.readFileSync(envTestPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
  
  console.log('✅ .env.test loaded successfully');
} else {
  console.log('⚠️  .env.test not found, using mock values for unit tests');
  
  // ============================================
  // MOCK ENVIRONMENT VARIABLES (for unit tests)
  // ============================================
  
  // Supabase Configuration
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-1234567890';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key-1234567890';
  
  // Google Generative AI
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-google-ai-key-1234567890';
  
  // Next.js Configuration
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  
  // Integration Tests - disabled by default unless explicitly enabled
  if (!process.env.ENABLE_INTEGRATION_TESTS) {
    process.env.ENABLE_INTEGRATION_TESTS = 'false';
  }
}

// Always set NODE_ENV and TZ
process.env.NODE_ENV = 'test';

// ============================================
// CONSOLE SUPPRESSION (Optional)
// ============================================

// Uncomment to suppress console.log/warn/error in tests
// const originalConsole = global.console;
// global.console = {
//   ...originalConsole,
//   log: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// ============================================
// TIMEZONE (Optional)
// ============================================

// Set timezone for consistent date/time testing
process.env.TZ = 'UTC';

console.log('✅ Jest environment variables configured');

