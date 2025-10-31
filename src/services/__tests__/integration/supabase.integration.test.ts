/**
 * Integration Tests for SupabaseService
 * 
 * These tests use REAL Supabase database
 * Set ENABLE_INTEGRATION_TESTS=true in .env.test to run
 * 
 * WARNING: These tests will create and delete data in your test database!
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { SupabaseService } from '@/services/supabase-service';
import {
  setupTestDB,
  cleanupTestDB,
  createTestUser,
  deleteTestUser,
  createTestComponent,
  shouldRunIntegrationTests,
} from './setup';

// Skip all tests if integration tests disabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('SupabaseService - Integration Tests (Real Database)', () => {
  let testUserId: string;

  beforeAll(async () => {
    await setupTestDB();
    testUserId = await createTestUser();
    console.log(`✅ Test user created: ${testUserId}`);
  }, 30000);

  afterAll(async () => {
    await deleteTestUser(testUserId);
    await cleanupTestDB();
    console.log('✅ Test user deleted');
  }, 30000);

  // ============================================
  // COMPONENT CRUD OPERATIONS
  // ============================================

  describe('Component Operations', () => {
    test('Should save and retrieve components from real database', async () => {
      // Create test components using createComponent
      await SupabaseService.createComponent({
        user_id: testUserId,
        type: 'experience',
        title: 'Senior Software Engineer',
        organization: 'Tech Corp',
        description: 'Built scalable systems',
        highlights: ['Led team of 5', 'Increased performance 50%'],
        start_date: '2020-01-01',
        end_date: '2023-12-31',
      });

      await SupabaseService.createComponent({
        user_id: testUserId,
        type: 'skill',
        title: 'TypeScript',
        description: 'Expert level',
        highlights: [],
      });

      // Retrieve from real database
      const result = await SupabaseService.getUserComponents(testUserId);

      // Verify
      expect(result).toBeDefined();
      expect(result.components.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);

      // Verify component structure
      const experience = result.components.find(c => c.type === 'experience');
      expect(experience).toBeDefined();
      expect(experience?.title).toBe('Senior Software Engineer');
      expect(experience?.organization).toBe('Tech Corp');
    }, 15000);

    test('Should filter components by type', async () => {
      // Create test data
      await createTestComponent(testUserId, 'experience');
      await createTestComponent(testUserId, 'skill');
      await createTestComponent(testUserId, 'education');

      // Filter by type using getComponentsByType
      const result = await SupabaseService.getComponentsByType(
        testUserId,
        'experience'
      );

      // Verify only experience components returned
      expect(result.length).toBeGreaterThan(0);
      result.forEach(c => {
        expect(c.type).toBe('experience');
      });
    }, 15000);
  });

  // ============================================
  // PROFILE OPERATIONS
  // ============================================

  describe('Profile Operations', () => {
    test('Should retrieve user profile', async () => {
      const profile = await SupabaseService.getProfileById(testUserId);

      expect(profile).toBeDefined();
      expect(profile?.id).toBe(testUserId);
      expect(profile?.full_name).toBe('Test User');
      expect(profile?.profession).toBe('Software Engineer');
    });

    test('Should update user profile', async () => {
      const updates = {
        full_name: 'Updated Name',
        profession: 'Senior Engineer',
      };

      const updated = await SupabaseService.updateProfile(testUserId, updates);

      expect(updated).toBeDefined();
      expect(updated.full_name).toBe('Updated Name');
      expect(updated.profession).toBe('Senior Engineer');

      // Verify in database
      const profile = await SupabaseService.getProfileById(testUserId);
      expect(profile?.full_name).toBe('Updated Name');
    });
  });

  // ============================================
  // EMBEDDING OPERATIONS (If SQL functions exist)
  // ============================================

  describe('Embedding Operations', () => {
    test('Should search components by similarity (if SQL function exists)', async () => {
      // Create components with test data
      await createTestComponent(testUserId, 'experience', {
        title: 'React Developer',
        description: 'Built React applications',
      });

      await createTestComponent(testUserId, 'skill', {
        title: 'JavaScript',
        description: 'Expert in JavaScript',
      });

      // Generate mock embedding
      const queryEmbedding = Array(768).fill(0).map(() => Math.random());

      try {
        // Attempt similarity search
        const results = await SupabaseService.similaritySearchComponents(
          testUserId,
          queryEmbedding,
          5
        );

        // If SQL function exists, should return results
        expect(Array.isArray(results)).toBe(true);
        console.log(`✅ Similarity search returned ${results.length} results`);
      } catch (error: any) {
        // If SQL function doesn't exist, expect specific error
        if (error.message.includes('function')) {
          console.warn('⚠️ SQL function not found (expected in test environment)');
          expect(error.message).toContain('function');
        } else {
          throw error;
        }
      }
    }, 15000);
  });
});

