import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Embedding Service using Google Gemini embedding-004 model
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
   */
  static async embed(text: string): Promise<number[]> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

      const result = await model.embedContent(text);
      const embedding = result.embedding;

      if (!embedding.values || embedding.values.length === 0) {
        throw new Error('No embedding values returned');
      }

      return embedding.values;
    } catch (error: any) {
      console.error('❌ Embedding error:', error.message);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Batch embed multiple texts
   */
  static async batchEmbed(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      texts.map(text => this.embed(text))
    );
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

