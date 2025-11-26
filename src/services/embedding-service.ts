import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingCacheService } from './embedding-cache-service';
import pLimit from 'p-limit';

/**
 * Embedding Service using Google Gemini embedding-004 model
 * Now with caching to reduce API calls
 */
export class EmbeddingService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient() {
    if (!this.genAI) {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Generate embedding for text using Gemini text-embedding-004
   * Returns 768-dimensional vector
   * Now with caching support
   */
  static async embed(text: string, useCache: boolean = true): Promise<number[]> {
    // Check cache first
    if (useCache) {
      const cached = EmbeddingCacheService.get(text);
      if (cached) {
        return cached;
      }
    }

    const genAI = this.getClient();
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    const maxRetries = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      try {
        const result = await model.embedContent(text);
        const embedding = result.embedding;

        if (!embedding.values || embedding.values.length === 0) {
          throw new Error('No embedding values returned');
        }

        // Cache the result
        if (useCache) {
          EmbeddingCacheService.set(text, embedding.values);
        }

        return embedding.values;
      } catch (error: any) {
        lastError = error;
        const isRetriable =
          error?.status === 500 ||
          /Internal Server Error/i.test(error?.message || '') ||
          /ECONNRESET|ETIMEDOUT|ENETUNREACH|EAI_AGAIN/i.test(error?.message || '');

        if (!isRetriable || attempt === maxRetries - 1) {
          console.error('❌ Embedding error:', error.message);
          throw new Error(`Failed to generate embedding: ${error.message}`);
        }

        const backoffMs = 300 * Math.pow(2, attempt); // 300, 600, 1200
        await new Promise(res => setTimeout(res, backoffMs));
        attempt++;
      }
    }

    // Should never reach here
    throw new Error(`Failed to generate embedding after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Batch embed multiple texts with concurrency control
   * @param texts Array of texts to embed
   * @param maxConcurrent Maximum concurrent embedding requests (default: 10)
   */
  static async batchEmbed(texts: string[], maxConcurrent: number = 10): Promise<number[][]> {
    console.log(`📦 Batch embedding ${texts.length} texts with max concurrency ${maxConcurrent}`);
    const startTime = Date.now();

    // Use p-limit to control concurrency
    const limit = pLimit(maxConcurrent);

    // Create limited promises
    const embeddingPromises = texts.map((text, index) =>
      limit(async () => {
        try {
          const embedding = await this.embed(text);
          return { success: true, embedding, index };
        } catch (error: any) {
          console.error(`  ✗ Failed to embed text ${index + 1}/${texts.length}:`, error.message);
          return { success: false, embedding: null, index };
        }
      })
    );

    // Wait for all embeddings using Promise.allSettled for partial failure handling
    const results = await Promise.allSettled(embeddingPromises);

    // Collect embeddings and maintain order
    const embeddings: number[][] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success && result.value.embedding) {
        embeddings.push(result.value.embedding);
        successCount++;
      } else {
        failureCount++;
        // Return empty array for failed embeddings to maintain array length
        embeddings.push([]);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`  ✅ Batch embedding completed in ${totalTime}ms`);
    console.log(`  → Success: ${successCount}/${texts.length}, Failed: ${failureCount}/${texts.length}`);

    return embeddings;
  }

  /**
   * Embed component data - extract meaningful text from component
   */
  static async embedComponent(componentType: string, data: any): Promise<number[]> {
    const text = this.extractTextFromComponent(componentType, data);
    return this.embed(text);
  }

  /**
   * Embed Component object directly
   */
  static async embedComponentObject(component: any): Promise<number[]> {
    const text = `${component.title || ''} at ${component.organization || ''} - ${component.description || ''} ${(component.highlights || []).join(', ')}`;
    return this.embed(text);
  }

  /**
   * Extract meaningful text from component based on type
   * Updated to match new schema: experience, project, education, skill
   */
  private static extractTextFromComponent(type: string, data: any): string {
    switch (type) {
      // New schema types
      case 'experience':
        return `${data.title || ''} at ${data.organization || ''} - ${data.description || ''} ${(data.highlights || []).join(', ')}`;

      case 'project':
        return `${data.title || ''} - ${data.description || ''} ${(data.highlights || []).join(', ')}`;

      case 'education':
        return `${data.title || ''} from ${data.organization || ''} - ${data.description || ''} ${(data.highlights || []).join(', ')}`;

      case 'skill':
        return `${data.title || ''} - ${data.description || ''} ${(data.highlights || []).join(', ')}`;

      // Legacy types for backward compatibility
      case 'github_profile':
        return `${data.name || data.login} - ${data.bio || ''} ${data.company || ''} ${data.location || ''}`;

      case 'github_repository':
        return `${data.name} - ${data.description || ''} Language: ${data.language || ''} Topics: ${(data.topics || []).join(', ')}`;

      case 'youtube_channel':
        return `${data.title} - ${data.description}`;

      case 'youtube_video':
        return `${data.title} - ${data.description}`;

      case 'linkedin_profile':
        return `${data.headline || ''} ${data.summary || ''}`;

      case 'linkedin_experience':
        return `${data.title} at ${data.company} - ${data.description || ''} Skills: ${(data.skills || []).join(', ')}`;

      case 'linkedin_education':
        return `${data.degree || ''} in ${data.field || ''} from ${data.school} - ${data.description || ''}`;

      case 'linkedin_skill':
        return data.name;

      case 'linkedin_certification':
        return `${data.name} from ${data.issuer}`;

      case 'linkedin_language':
        return `${data.name} - ${data.proficiency || ''}`;

      case 'jd_requirement':
        return data.requirement || data.description || '';

      case 'jd_skill':
        return `${data.skill} - ${data.level || ''} ${data.required ? '(Required)' : ''}`;

      case 'jd_metadata':
        return `${data.title || ''} ${data.company || ''} ${data.description || ''}`;

      default:
        return JSON.stringify(data);
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

