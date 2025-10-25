/**
 * Integration Test Setup
 * 
 * This file provides utilities for integration tests with real Supabase
 * 
 * Usage:
 *   import { setupTestDB, cleanupTestDB, createTestUser } from './setup';
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Test database connection
let testSupabase: SupabaseClient | null = null;

/**
 * Get test Supabase client
 * Uses .env.test credentials
 */
export function getTestSupabase(): SupabaseClient {
  if (!testSupabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing test Supabase credentials. Check .env.test file.'
      );
    }

    testSupabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return testSupabase;
}

/**
 * Create a test user for integration tests
 * Returns userId for cleanup
 */
export async function createTestUser(email?: string): Promise<string> {
  const supabase = getTestSupabase();
  const testEmail = email || `test-${Date.now()}@example.com`;

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      email: testEmail,
      full_name: 'Test User',
      profession: 'Software Engineer',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  return data.id;
}

/**
 * Delete test user and all associated data
 */
export async function deleteTestUser(userId: string): Promise<void> {
  const supabase = getTestSupabase();

  // Delete components first (foreign key constraint)
  await supabase.from('components').delete().eq('user_id', userId);

  // Delete CVs
  await supabase.from('cvs').delete().eq('user_id', userId);

  // Delete profile
  await supabase.from('profiles').delete().eq('id', userId);
}

/**
 * Create test component for user
 */
export async function createTestComponent(
  userId: string,
  type: string,
  overrides?: any
): Promise<string> {
  const supabase = getTestSupabase();

  const component = {
    user_id: userId,
    type,
    title: `Test ${type}`,
    description: 'Test description',
    organization: 'Test Org',
    highlights: ['Test highlight'],
    start_date: '2020-01',
    end_date: '2023-12',
    ...overrides,
  };

  const { data, error } = await supabase
    .from('components')
    .insert(component)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test component: ${error.message}`);
  }

  return data.id;
}

/**
 * Setup test database
 * Call in beforeAll()
 */
export async function setupTestDB(): Promise<void> {
  console.log('🔧 Setting up test database...');
  
  // Verify connection
  const supabase = getTestSupabase();
  const { error } = await supabase.from('profiles').select('id').limit(1);

  if (error) {
    throw new Error(`Test database connection failed: ${error.message}`);
  }

  console.log('✅ Test database ready');
}

/**
 * Cleanup test database
 * Call in afterAll()
 */
export async function cleanupTestDB(): Promise<void> {
  console.log('🧹 Cleaning up test database...');
  
  // Optional: Clean up orphaned test data
  // In production, you might want to delete all test-* users
  
  console.log('✅ Test database cleaned');
}

/**
 * Check if integration tests should run
 */
export function shouldRunIntegrationTests(): boolean {
  return process.env.ENABLE_INTEGRATION_TESTS === 'true';
}

/**
 * Skip test if integration tests disabled
 */
export function skipIfIntegrationDisabled(test: any): any {
  return shouldRunIntegrationTests()
    ? test
    : test.skip;
}

