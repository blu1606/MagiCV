/**
 * Tests for Supabase Client Module - Branch Coverage
 * Target: Cover error paths for missing environment variables
 *
 * Uncovered lines: 5, 9, 30 (error throws)
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('Supabase Client Module', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear module cache to test fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  // ============================================
  // MISSING NEXT_PUBLIC_SUPABASE_URL - Line 5
  // ============================================

  test('Given missing NEXT_PUBLIC_SUPABASE_URL, When module loads, Then throws error', () => {
    // Arrange
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Act & Assert
    expect(() => {
      require('@/lib/supabase');
    }).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL');
  });

  // ============================================
  // MISSING NEXT_PUBLIC_SUPABASE_ANON_KEY - Line 9
  // ============================================

  test('Given missing NEXT_PUBLIC_SUPABASE_ANON_KEY, When module loads, Then throws error', () => {
    // Arrange
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Act & Assert
    expect(() => {
      require('@/lib/supabase');
    }).toThrow('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  });

  test('Given both SUPABASE env vars present, When module loads, Then creates client successfully', () => {
    // Arrange
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Act & Assert - Should not throw
    expect(() => {
      const { supabase } = require('@/lib/supabase');
      expect(supabase).toBeDefined();
    }).not.toThrow();
  });

  // ============================================
  // MISSING SUPABASE_SERVICE_ROLE_KEY - Line 30
  // ============================================

  test('Given missing SUPABASE_SERVICE_ROLE_KEY, When getSupabaseAdmin called, Then throws error', () => {
    // Arrange
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Act
    const { getSupabaseAdmin } = require('@/lib/supabase');

    // Assert
    expect(() => {
      getSupabaseAdmin();
    }).toThrow('Missing SUPABASE_SERVICE_ROLE_KEY');
  });

  test('Given SUPABASE_SERVICE_ROLE_KEY present, When getSupabaseAdmin called, Then returns admin client', () => {
    // Arrange
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

    // Act
    const { getSupabaseAdmin } = require('@/lib/supabase');
    const adminClient = getSupabaseAdmin();

    // Assert
    expect(adminClient).toBeDefined();
  });

  test('Given getSupabaseAdmin called multiple times, When service role key exists, Then reuses cached client', () => {
    // Arrange
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

    // Act
    const { getSupabaseAdmin } = require('@/lib/supabase');
    const client1 = getSupabaseAdmin();
    const client2 = getSupabaseAdmin();

    // Assert - Should return same instance (singleton pattern)
    expect(client1).toBe(client2);
  });

  // ============================================
  // SINGLETON PATTERN TEST - Line 16
  // ============================================

  test('Given supabase accessed multiple times, When env vars present, Then returns same instance', () => {
    // Arrange
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Act
    const module1 = require('@/lib/supabase');
    const module2 = require('@/lib/supabase');

    // Assert - Singleton should return same client
    expect(module1.supabase).toBe(module2.supabase);
  });
});
