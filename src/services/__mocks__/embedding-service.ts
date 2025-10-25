/**
 * Mock for EmbeddingService
 * Jest will automatically use this when mocking @/services/embedding-service
 */

// Generate mock embedding
export const generateMockEmbedding = (dimension: number = 768): number[] => {
  return Array(dimension).fill(0).map(() => Math.random());
};

// Mock EmbeddingService class
export class EmbeddingService {
  static async embed(text: string): Promise<number[]> {
    // Return mock embedding based on text
    return generateMockEmbedding(768);
  }

  static async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map(() => generateMockEmbedding(768));
  }

  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    const dotProduct = a.reduce((sum, val, idx) => sum + val * b[idx], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  }
}

