import { EmbeddingService } from './embedding-service';
import { SupabaseService } from './supabase-service';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Component } from '@/lib/supabase';

/**
 * Component Embedding Service
 * Handles batch embedding generation for components without embeddings
 */
export class ComponentEmbeddingService {
  /**
   * Get components without embeddings for a user
   */
  static async getComponentsWithoutEmbeddings(
    userId: string,
    limit: number = 100
  ): Promise<Component[]> {
    try {
      console.log(`🔍 Fetching components without embeddings for user: ${userId}`);

      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('user_id', userId)
        .is('embedding', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} components without embeddings`);
      return data || [];
    } catch (error: any) {
      console.error('❌ Error fetching components without embeddings:', error.message);
      throw error;
    }
  }

  /**
   * Generate embedding for a single component
   */
  static async generateEmbeddingForComponent(component: Component): Promise<number[]> {
    try {
      // Build text for embedding
      const text = this.buildEmbeddingText(component);

      // Generate embedding
      const embedding = await EmbeddingService.embed(text);

      console.log(`✓ Generated embedding for component: ${component.id} (${component.title})`);
      return embedding;
    } catch (error: any) {
      console.error(`❌ Error generating embedding for component ${component.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Update component with embedding in database
   */
  static async updateComponentEmbedding(
    componentId: string,
    embedding: number[]
  ): Promise<void> {
    try {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from('components')
        .update({
          embedding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', componentId);

      if (error) {
        throw error;
      }

      console.log(`✓ Updated component ${componentId} with embedding`);
    } catch (error: any) {
      console.error(`❌ Error updating component ${componentId}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for all components without embeddings (batch)
   */
  static async generateEmbeddingsForUser(
    userId: string,
    options?: {
      limit?: number;
      batchSize?: number;
      onProgress?: (current: number, total: number) => void;
    }
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
    errors: Array<{ componentId: string; error: string }>;
  }> {
    const limit = options?.limit || 100;
    const batchSize = options?.batchSize || 5; // Process 5 at a time
    const onProgress = options?.onProgress;

    try {
      console.log('🚀 Starting batch embedding generation...');

      // Get components without embeddings
      const components = await this.getComponentsWithoutEmbeddings(userId, limit);

      if (components.length === 0) {
        console.log('✅ No components need embeddings');
        return {
          total: 0,
          successful: 0,
          failed: 0,
          errors: [],
        };
      }

      const total = components.length;
      let successful = 0;
      let failed = 0;
      const errors: Array<{ componentId: string; error: string }> = [];

      console.log(`📊 Processing ${total} components in batches of ${batchSize}...`);

      // Process in batches to avoid rate limits
      for (let i = 0; i < components.length; i += batchSize) {
        const batch = components.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (component) => {
            try {
              // Generate embedding
              const embedding = await this.generateEmbeddingForComponent(component);

              // Update database
              await this.updateComponentEmbedding(component.id, embedding);

              successful++;

              // Report progress
              if (onProgress) {
                onProgress(successful + failed, total);
              }
            } catch (error: any) {
              failed++;
              errors.push({
                componentId: component.id,
                error: error.message,
              });

              console.error(`❌ Failed for component ${component.id}:`, error.message);

              // Report progress
              if (onProgress) {
                onProgress(successful + failed, total);
              }
            }
          })
        );

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < components.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      console.log('✅ Batch embedding generation complete!');
      console.log(`   Total: ${total}, Successful: ${successful}, Failed: ${failed}`);

      return {
        total,
        successful,
        failed,
        errors,
      };
    } catch (error: any) {
      console.error('❌ Error in batch embedding generation:', error.message);
      throw error;
    }
  }

  /**
   * Build text for embedding from component
   */
  private static buildEmbeddingText(component: Component): string {
    const parts: string[] = [];

    // Add title
    if (component.title) {
      parts.push(component.title);
    }

    // Add organization
    if (component.organization) {
      parts.push(`at ${component.organization}`);
    }

    // Add description
    if (component.description) {
      parts.push(component.description);
    }

    // Add highlights
    if (component.highlights && component.highlights.length > 0) {
      parts.push(component.highlights.join(', '));
    }

    // Add dates for context
    if (component.start_date || component.end_date) {
      const dateRange = `${component.start_date || 'Unknown'} - ${component.end_date || 'Present'}`;
      parts.push(dateRange);
    }

    return parts.join(' - ');
  }

  /**
   * Get statistics about embeddings for a user
   */
  static async getEmbeddingStats(userId: string): Promise<{
    total: number;
    withEmbedding: number;
    withoutEmbedding: number;
    percentage: number;
  }> {
    try {
      const supabase = getSupabaseAdmin();
      
      // Get total count
      const { count: total, error: totalError } = await supabase
        .from('components')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (totalError) throw totalError;

      // Get count with embeddings
      const { count: withEmbedding, error: withError } = await supabase
        .from('components')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('embedding', 'is', null);

      if (withError) throw withError;

      const withoutEmbedding = (total || 0) - (withEmbedding || 0);
      const percentage = total ? Math.round(((withEmbedding || 0) / total) * 100) : 0;

      return {
        total: total || 0,
        withEmbedding: withEmbedding || 0,
        withoutEmbedding,
        percentage,
      };
    } catch (error: any) {
      console.error('❌ Error getting embedding stats:', error.message);
      throw error;
    }
  }
}
