/**
 * Error Path Tests for ComponentEmbeddingService
 * 
 * Tests error handling scenarios and edge cases
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { ComponentEmbeddingService } from '@/services/component-embedding-service';
import { EmbeddingService } from '@/services/embedding-service';

// Mock dependencies
jest.mock('@/services/embedding-service');
jest.mock('@/lib/supabase');

describe('ComponentEmbeddingService - Error Paths', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase client with proper chainable API
    const createChainableMock = () => {
      const chain = {
        select: jest.fn(),
        eq: jest.fn(),
        is: jest.fn(),
        not: jest.fn(),
        order: jest.fn(),
        limit: jest.fn(),
        update: jest.fn(),
      };

      // Make methods return chain for chaining
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.is.mockReturnValue(chain);
      chain.not.mockReturnValue(chain);
      chain.order.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      
      // Final methods return promises
      chain.limit.mockResolvedValue({ data: [], error: null });
      chain.eq.mockResolvedValue({ error: null });

      return chain;
    };

    mockSupabase = {
      from: jest.fn(() => createChainableMock()),
    };

    const { getSupabaseAdmin } = require('@/lib/supabase');
    (getSupabaseAdmin as jest.Mock).mockReturnValue(mockSupabase);
    
    // Setup default embedding mock
    (EmbeddingService.embed as jest.Mock) = jest.fn().mockResolvedValue(Array(768).fill(0.1));
  });

  test('Given database error when fetching components, When getComponentsWithoutEmbeddings called, Then throws error', async () => {
    // Arrange
    const chain = mockSupabase.from('components');
    chain.limit = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed', code: 'PGRST301' },
    });

    // Act & Assert
    await expect(
      ComponentEmbeddingService.getComponentsWithoutEmbeddings('user_123')
    ).rejects.toMatchObject({ message: 'Database connection failed' });
  });

  test('Given embedding service fails, When generateEmbeddingForComponent called, Then throws error', async () => {
    // Arrange
    const component = {
      id: 'comp_123',
      user_id: 'user_123',
      type: 'experience',
      title: 'Developer',
      highlights: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (EmbeddingService.embed as jest.Mock).mockRejectedValue(
      new Error('Embedding API rate limit')
    );

    // Act & Assert
    await expect(
      ComponentEmbeddingService.generateEmbeddingForComponent(component as any)
    ).rejects.toThrow('Embedding API rate limit');
  });

  test('Given database error when updating component, When updateComponentEmbedding called, Then throws error', async () => {
    // Arrange
    const componentId = 'comp_123';
    const embedding = Array(768).fill(0.1);

    const chain = mockSupabase.from('components');
    chain.eq = jest.fn().mockResolvedValue({
      error: { message: 'Update failed', code: '23505' },
    });

    // Act & Assert
    await expect(
      ComponentEmbeddingService.updateComponentEmbedding(componentId, embedding)
    ).rejects.toMatchObject({ message: 'Update failed' });
  });

  test('Given some components fail embedding generation, When generateEmbeddingsForUser called, Then continues processing and reports errors', async () => {
    // Arrange
    const components = [
      {
        id: 'comp_1',
        user_id: 'user_123',
        type: 'experience',
        title: 'Developer 1',
        highlights: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'comp_2',
        user_id: 'user_123',
        type: 'skill',
        title: 'React',
        highlights: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Mock getComponentsWithoutEmbeddings
    jest.spyOn(ComponentEmbeddingService, 'getComponentsWithoutEmbeddings').mockResolvedValue(
      components as any
    );

    // Mock embedding generation - first succeeds, second fails
    jest.spyOn(ComponentEmbeddingService, 'generateEmbeddingForComponent')
      .mockResolvedValueOnce(Array(768).fill(0.1))
      .mockRejectedValueOnce(new Error('Embedding API error'));

    // Mock update - first succeeds
    jest.spyOn(ComponentEmbeddingService, 'updateComponentEmbedding')
      .mockResolvedValueOnce(undefined);

    // Act
    const result = await ComponentEmbeddingService.generateEmbeddingsForUser('user_123');

    // Assert
    expect(result.total).toBe(2);
    expect(result.successful).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].componentId).toBe('comp_2');
  });

  test('Given no components without embeddings, When generateEmbeddingsForUser called, Then returns empty result', async () => {
    // Arrange
    jest.spyOn(ComponentEmbeddingService, 'getComponentsWithoutEmbeddings').mockResolvedValue([]);

    // Act
    const result = await ComponentEmbeddingService.generateEmbeddingsForUser('user_123');

    // Assert
    expect(result.total).toBe(0);
    expect(result.successful).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.errors).toEqual([]);
  });

  test('Given database error when getting stats, When getEmbeddingStats called, Then throws error', async () => {
    // Arrange
    const chain = mockSupabase.from('components');
    chain.select = jest.fn().mockResolvedValue({
      count: null,
      error: { message: 'Database error', code: 'PGRST301' },
    });

    // Act & Assert
    await expect(
      ComponentEmbeddingService.getEmbeddingStats('user_123')
    ).rejects.toMatchObject({ message: 'Database error' });
  });

  test('Given component with minimal data, When generateEmbeddingForComponent called, Then builds embedding text correctly', async () => {
    // Arrange
    const component = {
      id: 'comp_123',
      user_id: 'user_123',
      type: 'skill',
      title: 'React',
      // No description, organization, or highlights
      highlights: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (EmbeddingService.embed as jest.Mock).mockResolvedValue(Array(768).fill(0.1));

    // Act
    const result = await ComponentEmbeddingService.generateEmbeddingForComponent(component as any);

    // Assert
    expect(result).toHaveLength(768);
    expect(EmbeddingService.embed).toHaveBeenCalled();
    const calledText = (EmbeddingService.embed as jest.Mock).mock.calls[0][0];
    expect(calledText).toContain('React');
  });

  test('Given batch processing with mixed success/failure, When generateEmbeddingsForUser called, Then processes all and reports accurately', async () => {
    // Arrange
    const components = Array(5).fill(0).map((_, i) => ({
      id: `comp_${i}`,
      user_id: 'user_123',
      type: 'experience',
      title: `Job ${i}`,
      highlights: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    jest.spyOn(ComponentEmbeddingService, 'getComponentsWithoutEmbeddings').mockResolvedValue(
      components as any
    );

    // Mock - 3 succeed, 2 fail
    jest.spyOn(ComponentEmbeddingService, 'generateEmbeddingForComponent')
      .mockResolvedValueOnce(Array(768).fill(0.1))
      .mockResolvedValueOnce(Array(768).fill(0.1))
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockResolvedValueOnce(Array(768).fill(0.1))
      .mockRejectedValueOnce(new Error('Error 2'));

    jest.spyOn(ComponentEmbeddingService, 'updateComponentEmbedding')
      .mockResolvedValue(undefined);

    // Act
    const result = await ComponentEmbeddingService.generateEmbeddingsForUser('user_123', {
      batchSize: 5,
    });

    // Assert
    expect(result.total).toBe(5);
    expect(result.successful).toBe(3);
    expect(result.failed).toBe(2);
    expect(result.errors).toHaveLength(2);
  });
});

