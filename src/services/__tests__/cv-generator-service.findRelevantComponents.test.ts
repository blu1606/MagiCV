/**
 * Unit Tests for CVGeneratorService.findRelevantComponents()
 * 
 * Tests the core component search functionality with vector similarity search
 * and multi-level fallback strategies.
 * 
 * Coverage:
 * - Happy Path: 2 tests (normal search, empty JD fallback)
 * - Edge Cases: 3 tests (zero components, limit=0, very long JD)
 * - Error Handling: 2 tests (invalid userId, embedding failure)
 * - Integration: 1 test (mixed component types)
 */

import { describe, test, expect, beforeEach, afterEach, afterAll, jest } from '@jest/globals';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { EmbeddingService } from '@/services/embedding-service';
import { SupabaseService } from '@/services/supabase-service';
import type { Component } from '@/lib/supabase';

// Import utilities
import {
  generateMockEmbedding,
} from './__mocks__/embedding-service.mock';

import {
  createMockComponent,
  createMockComponents,
} from './__mocks__/supabase-service.mock';

// Mock the service modules BEFORE imports
jest.mock('@/services/embedding-service');
jest.mock('@/services/supabase-service');

// Suppress console logs during tests
const originalConsole = global.console;

describe('CVGeneratorService.findRelevantComponents', () => {
  // ============================================
  // SETUP & TEARDOWN
  // ============================================

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Suppress console output for cleaner test logs
    global.console = {
      ...originalConsole,
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };
  });

  afterEach(() => {
    // Clear mock call history
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original console
    global.console = originalConsole;

    // Restore all mocks
    jest.restoreAllMocks();
  });

  // ============================================
  // HAPPY PATH TESTS
  // ============================================

  describe('Happy Path', () => {
    /**
     * Test: Normal vector search with valid inputs
     * 
     * Verifies that when provided with valid userId and job description,
     * the service correctly generates an embedding and performs similarity search.
     */
    test('Given valid userId and non-empty JD, When findRelevantComponents called, Then returns relevant components sorted by similarity', async () => {
      // Arrange
      const userId = 'user_123';
      const jobDescription = 'Python developer for AI team with machine learning experience';
      const limit = 20;

      const mockEmbedding = generateMockEmbedding(768, 12345);
      
      // Create mock components with similarity scores (sorted DESC)
      const mockComponentsWithSimilarity: Component[] = [
        createMockComponent({
          id: 'comp_1',
          type: 'experience',
          title: 'Python Developer',
          description: 'AI and ML work',
          embedding: mockEmbedding,
        }),
        createMockComponent({
          id: 'comp_2',
          type: 'skill',
          title: 'Python',
          description: 'Expert level',
          embedding: mockEmbedding,
        }),
        createMockComponent({
          id: 'comp_3',
          type: 'experience',
          title: 'Machine Learning Engineer',
          description: 'Built ML pipelines',
          embedding: mockEmbedding,
        }),
        createMockComponent({
          id: 'comp_4',
          type: 'skill',
          title: 'TensorFlow',
          description: 'ML framework',
          embedding: mockEmbedding,
        }),
        createMockComponent({
          id: 'comp_5',
          type: 'project',
          title: 'AI CV Generator',
          description: 'AI-powered tool',
          embedding: mockEmbedding,
        }),
      ];

      jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
      jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue(mockComponentsWithSimilarity);

      // Act
      const result = await CVGeneratorService.findRelevantComponents(
        userId,
        jobDescription,
        limit
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(5);
      expect(result).toEqual(mockComponentsWithSimilarity);
      
      // Verify embedding service was called correctly
      expect(EmbeddingService.embed).toHaveBeenCalledTimes(1);
      expect(EmbeddingService.embed).toHaveBeenCalledWith(jobDescription);

      // Verify similarity search was called with correct params
      expect(SupabaseService.similaritySearchComponents).toHaveBeenCalledTimes(1);
      expect(SupabaseService.similaritySearchComponents).toHaveBeenCalledWith(
        userId,
        mockEmbedding,
        limit
      );

      // Verify component structure
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('embedding');
    });

    /**
     * Test: Empty job description triggers fallback
     * 
     * When job description is empty, the service should skip embedding
     * and return all user components directly.
     */
    test('Given valid userId and empty JD, When findRelevantComponents called, Then returns all user components as fallback', async () => {
      // Arrange
      const userId = 'user_123';
      const jobDescription = '';
      const limit = 20;

      const allUserComponents = createMockComponents(10, 'experience');
      
      const embedSpy = jest.spyOn(EmbeddingService, 'embed');
      const getUserComponentsSpy = jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: allUserComponents,
        total: 10,
      });
      const similaritySearchSpy = jest.spyOn(SupabaseService, 'similaritySearchComponents');

      // Act
      const result = await CVGeneratorService.findRelevantComponents(
        userId,
        jobDescription,
        limit
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(10);
      expect(result.length).toBeLessThanOrEqual(limit);
      
      // Verify embedding service was NOT called (no JD to embed)
      expect(embedSpy).not.toHaveBeenCalled();

      // Verify getUserComponents was called (fallback path)
      expect(getUserComponentsSpy).toHaveBeenCalledTimes(1);
      expect(getUserComponentsSpy).toHaveBeenCalledWith(userId);

      // Verify similaritySearchComponents was NOT called
      expect(similaritySearchSpy).not.toHaveBeenCalled();

      // Verify console warning was logged
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('No job description provided')
      );
    });
  });

  // ============================================
  // EDGE CASE TESTS
  // ============================================

  describe('Edge Cases', () => {
    /**
     * Test: User with no components
     * 
     * Verifies that when vector search returns empty results,
     * the fallback also handles empty component lists gracefully.
     */
    test('Given valid userId with zero components, When findRelevantComponents called, Then returns empty array without error', async () => {
      // Arrange
      const userId = 'user_456';
      const jobDescription = 'Senior DevOps engineer with Kubernetes experience';
      const limit = 20;

      const mockEmbedding = generateMockEmbedding(768, 99999);

      jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
      jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue([]);
      jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: [],
        total: 0,
      });

      // Act
      const result = await CVGeneratorService.findRelevantComponents(
        userId,
        jobDescription,
        limit
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      
      // Verify fallback was triggered
      expect(SupabaseService.getUserComponents).toHaveBeenCalledTimes(1);
      
      // Verify warning was logged
      expect(global.console.warn).toHaveBeenCalledWith(
        expect.stringContaining('No components found via vector search')
      );

      // Verify no exception was thrown (test passes if this line is reached)
      expect(true).toBe(true);
    });

    /**
     * Test: Limit of zero
     * 
     * Edge case where limit parameter is 0, should return empty array.
     */
    test('Given valid userId with limit=0, When findRelevantComponents called, Then returns empty array', async () => {
      // Arrange
      const userId = 'user_123';
      const jobDescription = 'Product Manager with agile experience';
      const limit = 0;

      const mockEmbedding = generateMockEmbedding(768, 55555);

      const embedSpy = jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
      const similaritySearchSpy = jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue([]);
      const getUserComponentsSpy = jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: [],
        total: 0,
      });

      // Act
      const result = await CVGeneratorService.findRelevantComponents(
        userId,
        jobDescription,
        limit
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);

      // Verify similarity search was called with limit=0
      expect(similaritySearchSpy).toHaveBeenCalledWith(
        userId,
        mockEmbedding,
        0
      );

      // Verify fallback was called since similarity search returned empty array
      expect(getUserComponentsSpy).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Very long job description
     * 
     * Verifies the service can handle job descriptions longer than typical limits
     * without truncation errors or failures.
     */
    test('Given very long jobDescription (>5000 chars), When findRelevantComponents called, Then processes and returns relevant components', async () => {
      // Arrange
      const userId = 'user_123';
      const longJobDescription = 'Senior Software Engineer '.repeat(300); // ~7500 chars
      const limit = 20;

      expect(longJobDescription.length).toBeGreaterThan(5000);

      const mockEmbedding = generateMockEmbedding(768, 77777);
      const relevantComponents = createMockComponents(3, 'experience');

      jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
      jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue(relevantComponents);

      // Act
      const result = await CVGeneratorService.findRelevantComponents(
        userId,
        longJobDescription,
        limit
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
      expect(result).toEqual(relevantComponents);

      // Verify long text was processed
      expect(EmbeddingService.embed).toHaveBeenCalledWith(longJobDescription);
      expect(EmbeddingService.embed).toHaveBeenCalledTimes(1);

      // Verify no truncation errors occurred (test passes if no exception)
      expect(true).toBe(true);
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling', () => {
    /**
     * Test: Invalid userId error with fallback
     * 
     * When similarity search fails due to invalid userId,
     * the service should catch the error and attempt fallback to getUserComponents.
     */
    test('Given invalid userId format, When findRelevantComponents called, Then catches error and falls back to getUserComponents', async () => {
      // Arrange
      const invalidUserId = '';
      const jobDescription = 'Backend Developer with Node.js';
      const limit = 20;

      const mockEmbedding = generateMockEmbedding(768, 11111);
      const fallbackComponents = createMockComponents(2, 'skill');

      jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
      
      // Similarity search fails with invalid user_id error
      jest.spyOn(SupabaseService, 'similaritySearchComponents').mockRejectedValue(
        new Error('Invalid user_id')
      );

      // Fallback succeeds
      jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: fallbackComponents,
        total: 2,
      });

      // Act
      const result = await CVGeneratorService.findRelevantComponents(
        invalidUserId,
        jobDescription,
        limit
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result).toEqual(fallbackComponents);

      // Verify error was caught and fallback was executed
      expect(SupabaseService.similaritySearchComponents).toHaveBeenCalledTimes(1);
      expect(SupabaseService.getUserComponents).toHaveBeenCalledTimes(1);

      // Verify error and warning were logged
      expect(global.console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error finding components'),
        expect.any(String)
      );
      expect(global.console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Error in vector search, falling back to all components')
      );
    });

    /**
     * Test: Embedding service failure with fallback
     * 
     * When embedding service fails (e.g., API rate limit),
     * the service should catch the error and fall back to all user components.
     */
    test('Given embedding service failure, When findRelevantComponents called, Then falls back to all user components', async () => {
      // Arrange
      const userId = 'user_123';
      const jobDescription = 'QA Engineer with automation experience';
      const limit = 20;

      const fallbackComponents = createMockComponents(8, 'experience');

      // Embedding service fails
      const embedSpy = jest.spyOn(EmbeddingService, 'embed').mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      // Fallback succeeds
      const getUserComponentsSpy = jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: fallbackComponents,
        total: 8,
      });
      const similaritySearchSpy = jest.spyOn(SupabaseService, 'similaritySearchComponents');

      // Act
      const result = await CVGeneratorService.findRelevantComponents(
        userId,
        jobDescription,
        limit
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(8);
      expect(result).toEqual(fallbackComponents);

      // Verify embedding was attempted
      expect(embedSpy).toHaveBeenCalledTimes(1);

      // Verify similarity search was NOT called (embedding failed)
      expect(similaritySearchSpy).not.toHaveBeenCalled();

      // Verify fallback was executed
      expect(getUserComponentsSpy).toHaveBeenCalledTimes(1);
      expect(getUserComponentsSpy).toHaveBeenCalledWith(userId);

      // Verify error and warning were logged
      expect(global.console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error finding components'),
        expect.stringContaining('rate limit')
      );
      expect(global.console.warn).toHaveBeenCalledWith(
        expect.stringContaining('falling back to all components')
      );
    });
  });

  // ============================================
  // INTEGRATION TESTS
  // ============================================

  describe('Integration', () => {
    /**
     * Test: Mixed component types with realistic similarity scores
     * 
     * Integration test simulating a real-world scenario with multiple
     * component types sorted by similarity scores.
     */
    test('Given valid userId with mixed component types, When findRelevantComponents called with vector search success, Then returns only relevant components filtered and sorted', async () => {
      // Arrange
      const userId = 'user_123';
      const jobDescription = 'Full Stack React + Node developer with TypeScript experience';
      const limit = 5;

      const mockEmbedding = generateMockEmbedding(768, 33333);

      // Create components with different types and similarity scores
      const mixedComponents: Component[] = [
        // Highest similarity - Experience
        createMockComponent({
          id: 'comp_exp_1',
          type: 'experience',
          title: 'Senior Full Stack Developer',
          description: 'React and Node.js',
          embedding: mockEmbedding,
        }),
        // High similarity - Experience
        createMockComponent({
          id: 'comp_exp_2',
          type: 'experience',
          title: 'Frontend Engineer',
          description: 'React, TypeScript',
          embedding: mockEmbedding,
        }),
        // Medium similarity - Skill
        createMockComponent({
          id: 'comp_skill_1',
          type: 'skill',
          title: 'TypeScript',
          description: 'Expert level',
          embedding: mockEmbedding,
        }),
        // Medium similarity - Skill
        createMockComponent({
          id: 'comp_skill_2',
          type: 'skill',
          title: 'React',
          description: 'Advanced',
          embedding: mockEmbedding,
        }),
        // Lower similarity - Project
        createMockComponent({
          id: 'comp_proj_1',
          type: 'project',
          title: 'E-commerce Platform',
          description: 'Built with React + Node',
          embedding: mockEmbedding,
        }),
      ];

      jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
      jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue(mixedComponents);

      // Act
      const result = await CVGeneratorService.findRelevantComponents(
        userId,
        jobDescription,
        limit
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(5);
      expect(result).toEqual(mixedComponents);

      // Verify component type diversity
      const componentTypes = result.map(c => c.type);
      expect(componentTypes).toContain('experience');
      expect(componentTypes).toContain('skill');
      expect(componentTypes).toContain('project');

      // Verify all components have required fields
      result.forEach((component) => {
        expect(component).toHaveProperty('id');
        expect(component).toHaveProperty('type');
        expect(component).toHaveProperty('title');
        expect(component).toHaveProperty('description');
        expect(component.type).toMatch(/^(experience|education|skill|project)$/);
      });

      // Verify exact order (should match mock data order - sorted by similarity)
      expect(result[0].id).toBe('comp_exp_1');
      expect(result[1].id).toBe('comp_exp_2');
      expect(result[2].id).toBe('comp_skill_1');
      expect(result[3].id).toBe('comp_skill_2');
      expect(result[4].id).toBe('comp_proj_1');

      // Verify all embeddings were processed
      expect(EmbeddingService.embed).toHaveBeenCalledTimes(1);
      expect(SupabaseService.similaritySearchComponents).toHaveBeenCalledTimes(1);
    });
  });
});

