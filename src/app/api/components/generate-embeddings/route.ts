import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ComponentEmbeddingService } from '@/services/component-embedding-service';

/**
 * POST /api/components/generate-embeddings
 *
 * Generate embeddings for all components without embeddings
 * Supports streaming progress updates
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { limit = 100, batchSize = 5 } = body;

    console.log('🚀 Starting embedding generation for user:', user.id);

    // Generate embeddings
    const results = await ComponentEmbeddingService.generateEmbeddingsForUser(
      user.id,
      {
        limit,
        batchSize,
      }
    );

    console.log('✅ Embedding generation complete:', results);

    return NextResponse.json({
      success: true,
      message: `Successfully generated embeddings for ${results.successful} components`,
      results,
    });
  } catch (error: any) {
    console.error('❌ Embedding generation error:', error.message);
    return NextResponse.json(
      {
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/components/generate-embeddings
 *
 * Get embedding statistics for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get stats
    const stats = await ComponentEmbeddingService.getEmbeddingStats(user.id);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Error fetching embedding stats:', error.message);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
