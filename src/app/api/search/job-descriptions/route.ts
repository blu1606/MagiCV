import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingService } from '@/services/embedding-service';
import { SupabaseService } from '@/services/supabase-service';

/**
 * POST /api/search/job-descriptions - Search job descriptions by text query using embeddings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, query, limit = 5 } = body;

    if (!userId || !query) {
      return NextResponse.json(
        { error: 'userId and query are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await SupabaseService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate embedding for query
    const queryEmbedding = await EmbeddingService.embed(query);

    // Search similar job descriptions
    const results = await SupabaseService.similaritySearchJobDescriptions(
      userId,
      queryEmbedding,
      limit
    );

    return NextResponse.json({
      query,
      results,
      count: results.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

