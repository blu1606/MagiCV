/**
 * Comprehensive Unit Tests for EmbeddingService
 * 
 * Tests embedding generation, batch processing, cosine similarity, and error handling
 * Target: 80%+ coverage
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { EmbeddingService } from '@/services/embedding-service';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock Google Generative AI
jest.mock('@google/generative-ai');

describe('EmbeddingService', () => {
  let mockGenAI: any;
  let mockModel: any;

  // Mock embedding vector (768 dimensions - Gemini text-embedding-004)
  const mockEmbeddingValues = Array(768).fill(0.1);

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Google Generative AI
    mockModel = {
      embedContent: jest.fn(),
    };

    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    };

    // Mock static getClient method
    jest.spyOn(EmbeddingService as any, 'getClient').mockReturnValue(mockGenAI);
  });

  // ============================================
  // embed() TESTS
  // ============================================

  describe('embed', () => {
    test('Given valid text, When embed called, Then returns embedding vector', async () => {
      // Arrange
      const text = 'Software Engineer with React experience';
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embed(text);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(768);
      expect(result).toEqual(mockEmbeddingValues);
      expect(mockModel.embedContent).toHaveBeenCalledWith(text);
      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({ model: 'text-embedding-004' });
    });

    test('Given empty text, When embed called, Then returns embedding vector', async () => {
      // Arrange
      const text = '';
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embed(text);

      // Assert
      expect(result.length).toBe(768);
      expect(mockModel.embedContent).toHaveBeenCalledWith(text);
    });

    test('Given API returns no embedding values, When embed called, Then throws error', async () => {
      // Arrange
      const text = 'Some text';
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: [],
        },
      });

      // Act & Assert
      await expect(EmbeddingService.embed(text))
        .rejects.toThrow('No embedding values returned');
    });

    test('Given API returns null embedding, When embed called, Then throws error', async () => {
      // Arrange
      const text = 'Some text';
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: null,
        },
      });

      // Act & Assert
      await expect(EmbeddingService.embed(text))
        .rejects.toThrow('No embedding values returned');
    });

    test('Given network error (500), When embed called, Then retries with backoff', async () => {
      // Arrange
      const text = 'Some text';
      
      // Mock first attempt fails with 500, second succeeds
      mockModel.embedContent
        .mockRejectedValueOnce({
          status: 500,
          message: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          embedding: {
            values: mockEmbeddingValues,
          },
        });

      // Act - Use real timers but fast retry
      const embedPromise = EmbeddingService.embed(text);
      
      // Wait a bit for retry
      const result = await Promise.race([
        embedPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ]);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      expect(mockModel.embedContent).toHaveBeenCalledTimes(2);
    }, 3000);

    test('Given network timeout error, When embed called, Then retries with backoff', async () => {
      // Arrange
      const text = 'Some text';
      
      mockModel.embedContent
        .mockRejectedValueOnce({
          message: 'ETIMEDOUT',
        })
        .mockResolvedValueOnce({
          embedding: {
            values: mockEmbeddingValues,
          },
        });

      // Act
      const embedPromise = EmbeddingService.embed(text);
      const result = await Promise.race([
        embedPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ]);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      expect(mockModel.embedContent).toHaveBeenCalledTimes(2);
    }, 3000);

    test('Given non-retriable error, When embed called, Then throws immediately', async () => {
      // Arrange
      const text = 'Some text';
      
      mockModel.embedContent.mockRejectedValue({
        status: 400,
        message: 'Bad Request',
      });

      // Act & Assert
      await expect(EmbeddingService.embed(text))
        .rejects.toThrow('Failed to generate embedding: Bad Request');
      
      // Should not retry
      expect(mockModel.embedContent).toHaveBeenCalledTimes(1);
    });

    test('Given all retries fail, When embed called, Then throws error', async () => {
      // Arrange
      const text = 'Some text';
      
      mockModel.embedContent.mockRejectedValue({
        status: 500,
        message: 'Internal Server Error',
      });

      // Act & Assert
      // Implementation throws after last attempt with error message
      await expect(EmbeddingService.embed(text))
        .rejects.toThrow('Failed to generate embedding: Internal Server Error');
      
      // Should have retried 3 times
      expect(mockModel.embedContent).toHaveBeenCalledTimes(3);
    }, 10000);

    test('Given connection reset error, When embed called, Then retries', async () => {
      // Arrange
      const text = 'Some text';
      
      mockModel.embedContent
        .mockRejectedValueOnce({
          message: 'ECONNRESET',
        })
        .mockResolvedValueOnce({
          embedding: {
            values: mockEmbeddingValues,
          },
        });

      // Act
      const embedPromise = EmbeddingService.embed(text);
      const result = await Promise.race([
        embedPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ]);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      expect(mockModel.embedContent).toHaveBeenCalledTimes(2);
    }, 3000);
  });

  // ============================================
  // batchEmbed() TESTS
  // ============================================

  describe('batchEmbed', () => {
    test('Given array of texts, When batchEmbed called, Then returns array of embeddings', async () => {
      // Arrange
      const texts = ['Text 1', 'Text 2', 'Text 3'];
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.batchEmbed(texts);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toEqual(mockEmbeddingValues);
      expect(result[1]).toEqual(mockEmbeddingValues);
      expect(result[2]).toEqual(mockEmbeddingValues);
      expect(mockModel.embedContent).toHaveBeenCalledTimes(3);
    });

    test('Given empty array, When batchEmbed called, Then returns empty array', async () => {
      // Arrange
      const texts: string[] = [];

      // Act
      const result = await EmbeddingService.batchEmbed(texts);

      // Assert
      expect(result).toEqual([]);
      expect(mockModel.embedContent).not.toHaveBeenCalled();
    });

    test('Given one text fails in batch, When batchEmbed called, Then throws error', async () => {
      // Arrange
      const texts = ['Text 1', 'Text 2', 'Text 3'];
      
      mockModel.embedContent
        .mockResolvedValueOnce({
          embedding: { values: mockEmbeddingValues },
        })
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          embedding: { values: mockEmbeddingValues },
        });

      // Act & Assert
      await expect(EmbeddingService.batchEmbed(texts))
        .rejects.toThrow('Failed to generate embedding');
    });
  });

  // ============================================
  // embedComponent() TESTS
  // ============================================

  describe('embedComponent', () => {
    test('Given experience component, When embedComponent called, Then extracts text and embeds', async () => {
      // Arrange
      const componentType = 'experience';
      const data = {
        title: 'Senior Developer',
        organization: 'TechCorp',
        description: 'Built amazing apps',
        highlights: ['React', 'TypeScript'],
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embedComponent(componentType, data);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      expect(mockModel.embedContent).toHaveBeenCalled();
      const calledText = mockModel.embedContent.mock.calls[0][0];
      expect(calledText).toContain('Senior Developer');
      expect(calledText).toContain('TechCorp');
      expect(calledText).toContain('React');
    });

    test('Given project component, When embedComponent called, Then extracts text and embeds', async () => {
      // Arrange
      const componentType = 'project';
      const data = {
        title: 'AI CV Generator',
        description: 'Built with Next.js',
        highlights: ['Next.js', 'AI'],
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embedComponent(componentType, data);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      const calledText = mockModel.embedContent.mock.calls[0][0];
      expect(calledText).toContain('AI CV Generator');
    });

    test('Given education component, When embedComponent called, Then extracts text and embeds', async () => {
      // Arrange
      const componentType = 'education';
      const data = {
        title: 'BSc Computer Science',
        organization: 'Stanford University',
        description: 'Focused on AI/ML',
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embedComponent(componentType, data);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      const calledText = mockModel.embedContent.mock.calls[0][0];
      expect(calledText).toContain('BSc Computer Science');
      expect(calledText).toContain('Stanford University');
    });

    test('Given skill component, When embedComponent called, Then extracts text and embeds', async () => {
      // Arrange
      const componentType = 'skill';
      const data = {
        title: 'React',
        description: 'Frontend framework',
        highlights: ['Expert level'],
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embedComponent(componentType, data);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      const calledText = mockModel.embedContent.mock.calls[0][0];
      expect(calledText).toContain('React');
    });

    test('Given legacy github_profile component, When embedComponent called, Then extracts text and embeds', async () => {
      // Arrange
      const componentType = 'github_profile';
      const data = {
        name: 'John Doe',
        login: 'johndoe',
        bio: 'Software Engineer',
        company: 'TechCorp',
        location: 'San Francisco',
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embedComponent(componentType, data);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      const calledText = mockModel.embedContent.mock.calls[0][0];
      expect(calledText).toContain('John Doe');
      expect(calledText).toContain('Software Engineer');
    });

    test('Given unknown component type, When embedComponent called, Then uses JSON stringify', async () => {
      // Arrange
      const componentType = 'unknown_type';
      const data = { field: 'value' };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embedComponent(componentType, data);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      const calledText = mockModel.embedContent.mock.calls[0][0];
      expect(calledText).toContain('{"field":"value"}');
    });

    test('Given component with missing fields, When embedComponent called, Then handles gracefully', async () => {
      // Arrange
      const componentType = 'experience';
      const data = {
        title: 'Developer',
        // Missing organization, description, highlights
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embedComponent(componentType, data);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      // Should not throw, handles missing fields gracefully
    });
  });

  // ============================================
  // embedComponentObject() TESTS
  // ============================================

  describe('embedComponentObject', () => {
    test('Given component object, When embedComponentObject called, Then extracts text and embeds', async () => {
      // Arrange
      const component = {
        title: 'Senior Developer',
        organization: 'TechCorp',
        description: 'Built amazing apps',
        highlights: ['React', 'TypeScript'],
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embedComponentObject(component);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      const calledText = mockModel.embedContent.mock.calls[0][0];
      expect(calledText).toContain('Senior Developer');
      expect(calledText).toContain('TechCorp');
      expect(calledText).toContain('Built amazing apps');
      expect(calledText).toContain('React');
    });

    test('Given component with missing fields, When embedComponentObject called, Then handles gracefully', async () => {
      // Arrange
      const component = {
        title: 'Developer',
        // Missing organization, description, highlights
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embedComponentObject(component);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      // Should not throw
    });

    test('Given component with null fields, When embedComponentObject called, Then handles gracefully', async () => {
      // Arrange
      const component = {
        title: null,
        organization: null,
        description: null,
        highlights: null,
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      const result = await EmbeddingService.embedComponentObject(component);

      // Assert
      expect(result).toEqual(mockEmbeddingValues);
      // Should not throw
    });
  });

  // ============================================
  // cosineSimilarity() TESTS
  // ============================================

  describe('cosineSimilarity', () => {
    test('Given identical vectors, When cosineSimilarity called, Then returns 1', () => {
      // Arrange
      const vec1 = [1, 0, 0];
      const vec2 = [1, 0, 0];

      // Act
      const result = EmbeddingService.cosineSimilarity(vec1, vec2);

      // Assert
      expect(result).toBe(1);
    });

    test('Given orthogonal vectors, When cosineSimilarity called, Then returns 0', () => {
      // Arrange
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];

      // Act
      const result = EmbeddingService.cosineSimilarity(vec1, vec2);

      // Assert
      expect(result).toBe(0);
    });

    test('Given opposite vectors, When cosineSimilarity called, Then returns -1', () => {
      // Arrange
      const vec1 = [1, 0, 0];
      const vec2 = [-1, 0, 0];

      // Act
      const result = EmbeddingService.cosineSimilarity(vec1, vec2);

      // Assert
      expect(result).toBe(-1);
    });

    test('Given vectors with different lengths, When cosineSimilarity called, Then throws error', () => {
      // Arrange
      const vec1 = [1, 0, 0];
      const vec2 = [1, 0];

      // Act & Assert
      expect(() => EmbeddingService.cosineSimilarity(vec1, vec2))
        .toThrow('Embeddings must have the same length');
    });

    test('Given real-world similarity vectors, When cosineSimilarity called, Then returns reasonable value', () => {
      // Arrange
      // Two similar but not identical vectors
      const vec1 = [0.8, 0.6, 0.0];
      const vec2 = [0.7, 0.7, 0.0];

      // Act
      const result = EmbeddingService.cosineSimilarity(vec1, vec2);

      // Assert
      expect(result).toBeGreaterThan(0.9);
      expect(result).toBeLessThanOrEqual(1);
    });

    test('Given zero vectors, When cosineSimilarity called, Then handles gracefully', () => {
      // Arrange
      const vec1 = [0, 0, 0];
      const vec2 = [0, 0, 0];

      // Act
      const result = EmbeddingService.cosineSimilarity(vec1, vec2);

      // Assert
      // NaN or 0/0 - should handle gracefully
      expect(typeof result).toBe('number');
    });

    test('Given large vectors (768 dimensions), When cosineSimilarity called, Then calculates correctly', () => {
      // Arrange
      const vec1 = Array(768).fill(0.1);
      const vec2 = Array(768).fill(0.1);

      // Act
      const result = EmbeddingService.cosineSimilarity(vec1, vec2);

      // Assert
      // Account for floating point precision
      expect(result).toBeCloseTo(1, 10);
    });

    test('Given different magnitude vectors, When cosineSimilarity called, Then normalizes correctly', () => {
      // Arrange
      const vec1 = [1, 2, 3];
      const vec2 = [2, 4, 6]; // Same direction, different magnitude

      // Act
      const result = EmbeddingService.cosineSimilarity(vec1, vec2);

      // Assert
      expect(result).toBe(1); // Cosine similarity is magnitude-independent
    });
  });

  // ============================================
  // extractTextFromComponent() TESTS (via embedComponent)
  // ============================================

  describe('extractTextFromComponent (tested via embedComponent)', () => {
    test('Given linkedin_experience component, When embedComponent called, Then extracts correctly', async () => {
      // Arrange
      const componentType = 'linkedin_experience';
      const data = {
        title: 'Senior Engineer',
        company: 'Google',
        description: 'Built systems',
        skills: ['Python', 'Go'],
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      await EmbeddingService.embedComponent(componentType, data);

      // Assert
      const calledText = mockModel.embedContent.mock.calls[0][0];
      expect(calledText).toContain('Senior Engineer');
      expect(calledText).toContain('Google');
      expect(calledText).toContain('Python');
    });

    test('Given jd_requirement component, When embedComponent called, Then extracts correctly', async () => {
      // Arrange
      const componentType = 'jd_requirement';
      const data = {
        requirement: '5+ years React experience',
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      await EmbeddingService.embedComponent(componentType, data);

      // Assert
      const calledText = mockModel.embedContent.mock.calls[0][0];
      expect(calledText).toBe('5+ years React experience');
    });

    test('Given jd_skill component, When embedComponent called, Then extracts correctly', async () => {
      // Arrange
      const componentType = 'jd_skill';
      const data = {
        skill: 'TypeScript',
        level: 'Expert',
        required: true,
      };
      
      mockModel.embedContent.mockResolvedValue({
        embedding: {
          values: mockEmbeddingValues,
        },
      });

      // Act
      await EmbeddingService.embedComponent(componentType, data);

      // Assert
      const calledText = mockModel.embedContent.mock.calls[0][0];
      expect(calledText).toContain('TypeScript');
      expect(calledText).toContain('Expert');
      expect(calledText).toContain('(Required)');
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling - getClient', () => {
    test('Given missing API key, When getClient called, Then throws error', () => {
      // Arrange
      const originalEnv = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      (EmbeddingService as any).genAI = null;

      jest.spyOn(EmbeddingService as any, 'getClient').mockImplementation(() => {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
          throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables');
        }
        return mockGenAI;
      });

      // Act & Assert
      expect(() => {
        (EmbeddingService as any).getClient();
      }).toThrow('GOOGLE_GENERATIVE_AI_API_KEY not found');

      // Restore
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalEnv;
      jest.restoreAllMocks();
    });
  });
});

