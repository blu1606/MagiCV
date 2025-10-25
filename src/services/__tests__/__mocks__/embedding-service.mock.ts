/**
 * Jest Mock for EmbeddingService
 * 
 * Provides comprehensive mocking for EmbeddingService methods
 * with realistic embedding vectors and helper utilities
 */

import { jest } from '@jest/globals';

// ============================================
// CONSTANTS
// ============================================

/**
 * Standard embedding dimension for Google text-embedding-004
 */
export const EMBEDDING_DIMENSION = 768;

// ============================================
// MOCK DATA - Realistic Test Data
// ============================================

/**
 * Generate Normalized Mock Embedding Vector
 * @param dimension - Vector dimension (default: 768)
 * @param seed - Optional seed for reproducibility
 */
export const generateMockEmbedding = (
  dimension: number = EMBEDDING_DIMENSION,
  seed?: number
): number[] => {
  const random = seed !== undefined ? seededRandom(seed) : Math.random;
  
  // Generate random vector
  const vector = Array(dimension)
    .fill(0)
    .map(() => random() * 2 - 1); // Range: [-1, 1]
  
  // Normalize to unit length (L2 norm = 1)
  const magnitude = Math.sqrt(
    vector.reduce((sum, val) => sum + val * val, 0)
  );
  
  return vector.map((val) => val / magnitude);
};

/**
 * Seeded Random Number Generator (for reproducible tests)
 */
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Mock Embedding for "Software Engineer" query
 */
export const mockEmbeddingSoftwareEngineer = generateMockEmbedding(768, 12345);

/**
 * Mock Embedding for "Data Scientist" query
 */
export const mockEmbeddingDataScientist = generateMockEmbedding(768, 67890);

/**
 * Mock Embedding for "Product Manager" query
 */
export const mockEmbeddingProductManager = generateMockEmbedding(768, 11111);

/**
 * Mock Embedding for short text
 */
export const mockEmbeddingShortText = generateMockEmbedding(768, 22222);

/**
 * Mock Embedding for long text (>1000 chars)
 */
export const mockEmbeddingLongText = generateMockEmbedding(768, 33333);

/**
 * Zero Vector (for testing edge cases)
 */
export const mockEmbeddingZero = Array(EMBEDDING_DIMENSION).fill(0);

/**
 * Collection of Pre-generated Embeddings for Batch Testing
 */
export const mockEmbeddingsBatch = [
  generateMockEmbedding(768, 1001),
  generateMockEmbedding(768, 1002),
  generateMockEmbedding(768, 1003),
  generateMockEmbedding(768, 1004),
  generateMockEmbedding(768, 1005),
];

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Factory: Create Mock Embedding with Custom Properties
 * @param options - Configuration options
 */
export const createMockEmbedding = (options?: {
  dimension?: number;
  seed?: number;
  normalized?: boolean;
}): number[] => {
  const dimension = options?.dimension || EMBEDDING_DIMENSION;
  const seed = options?.seed;
  const normalized = options?.normalized !== false;

  if (!normalized) {
    // Return non-normalized random vector
    const random = seed !== undefined ? seededRandom(seed) : Math.random;
    return Array(dimension)
      .fill(0)
      .map(() => random());
  }

  return generateMockEmbedding(dimension, seed);
};

/**
 * Factory: Create Multiple Mock Embeddings
 * @param count - Number of embeddings to generate
 * @param dimension - Vector dimension
 */
export const createMockEmbeddings = (
  count: number,
  dimension: number = EMBEDDING_DIMENSION
): number[][] => {
  return Array(count)
    .fill(null)
    .map((_, idx) => generateMockEmbedding(dimension, 5000 + idx));
};

// ============================================
// MOCK SERVICE - Jest Mock Functions
// ============================================

/**
 * EmbeddingService Mock
 * All methods are jest.fn() with proper TypeScript typing
 */
export const EmbeddingServiceMock = {
  /**
   * Generate embedding for single text
   */
  embed: jest.fn<(text: string) => Promise<number[]>>(),

  /**
   * Generate embeddings for multiple texts (batch)
   */
  embedBatch: jest.fn<(texts: string[]) => Promise<number[][]>>(),

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity: jest.fn<(a: number[], b: number[]) => number>(),

  /**
   * Get embedding dimension
   */
  getDimension: jest.fn<() => number>(),
};

// ============================================
// SETUP HELPERS - Mock Configuration
// ============================================

/**
 * Setup EmbeddingService Mocks with Default Success Behavior
 */
export const setupEmbeddingMocks = () => {
  // embed() - Return normalized vector by default
  EmbeddingServiceMock.embed.mockImplementation(async (text: string) => {
    // Return different embeddings based on text content for realistic testing
    if (text.toLowerCase().includes('software') || text.toLowerCase().includes('engineer')) {
      return mockEmbeddingSoftwareEngineer;
    }
    if (text.toLowerCase().includes('data') || text.toLowerCase().includes('scientist')) {
      return mockEmbeddingDataScientist;
    }
    if (text.toLowerCase().includes('product') || text.toLowerCase().includes('manager')) {
      return mockEmbeddingProductManager;
    }
    
    // Default: generate new embedding based on text length
    const seed = text.length + text.charCodeAt(0);
    return generateMockEmbedding(768, seed);
  });

  // embedBatch() - Return array of embeddings
  EmbeddingServiceMock.embedBatch.mockImplementation(async (texts: string[]) => {
    return texts.map((text, idx) => generateMockEmbedding(768, 6000 + idx));
  });

  // cosineSimilarity() - Calculate actual similarity
  EmbeddingServiceMock.cosineSimilarity.mockImplementation((a: number[], b: number[]) => {
    if (a.length !== b.length) {
      throw new Error('Embedding dimensions must match');
    }
    
    const dotProduct = a.reduce((sum, val, idx) => sum + val * b[idx], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magA === 0 || magB === 0) return 0;
    
    return dotProduct / (magA * magB);
  });

  // getDimension() - Return standard dimension
  EmbeddingServiceMock.getDimension.mockReturnValue(EMBEDDING_DIMENSION);
};

/**
 * Reset All EmbeddingService Mocks
 */
export const resetEmbeddingMocks = () => {
  Object.values(EmbeddingServiceMock).forEach((mockFn) => {
    if (typeof mockFn === 'function' && 'mockReset' in mockFn) {
      mockFn.mockReset();
    }
  });
};

/**
 * Set Mock to Return Success with Custom Embedding
 * @param embedding - Custom embedding vector
 */
export const setMockSuccess = (embedding: number[] = mockEmbeddingSoftwareEngineer) => {
  EmbeddingServiceMock.embed.mockResolvedValue(embedding);
};

/**
 * Set Mock to Throw Error
 * @param error - Error to throw
 */
export const setMockError = (error: Error | string) => {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  EmbeddingServiceMock.embed.mockRejectedValue(errorObj);
  EmbeddingServiceMock.embedBatch.mockRejectedValue(errorObj);
};

/**
 * Set Mock to Return Fixed Embedding (for deterministic tests)
 */
export const setMockFixedEmbedding = () => {
  EmbeddingServiceMock.embed.mockResolvedValue(mockEmbeddingSoftwareEngineer);
  EmbeddingServiceMock.embedBatch.mockResolvedValue(mockEmbeddingsBatch);
};

/**
 * Set Mock to Simulate API Rate Limit Error
 */
export const setMockRateLimitError = () => {
  const error = new Error('API rate limit exceeded');
  (error as any).code = 'RATE_LIMIT_EXCEEDED';
  EmbeddingServiceMock.embed.mockRejectedValue(error);
};

/**
 * Set Mock to Simulate Timeout Error
 */
export const setMockTimeoutError = () => {
  const error = new Error('Request timeout');
  (error as any).code = 'TIMEOUT';
  EmbeddingServiceMock.embed.mockRejectedValue(error);
};

/**
 * Set Mock to Return Zero Vector (edge case)
 */
export const setMockZeroVector = () => {
  EmbeddingServiceMock.embed.mockResolvedValue(mockEmbeddingZero);
};

// ============================================
// TEST UTILITIES
// ============================================

/**
 * Validate Embedding Vector
 * @param embedding - Vector to validate
 * @param expectedDimension - Expected dimension
 */
export const validateEmbedding = (
  embedding: number[],
  expectedDimension: number = EMBEDDING_DIMENSION
): boolean => {
  // Check dimension
  if (embedding.length !== expectedDimension) {
    return false;
  }

  // Check all values are numbers
  if (!embedding.every((val) => typeof val === 'number' && !isNaN(val))) {
    return false;
  }

  // Check not all zeros
  if (embedding.every((val) => val === 0)) {
    return false;
  }

  return true;
};

/**
 * Check if Vector is Normalized (L2 norm ≈ 1)
 * @param embedding - Vector to check
 * @param tolerance - Tolerance for floating point comparison
 */
export const isNormalized = (
  embedding: number[],
  tolerance: number = 0.001
): boolean => {
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  return Math.abs(magnitude - 1) < tolerance;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default EmbeddingServiceMock;

