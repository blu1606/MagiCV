import { NextRequest, NextResponse } from 'next/server';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { youtubeTool } from '@/mastra/tools';
import { SupabaseService } from '@/services/supabase-service';

/**
 * POST /api/crawl/youtube - Crawl YouTube data and save to Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, channelUrl } = body;

    if (!userId || !channelUrl) {
      return NextResponse.json(
        { error: 'userId and channelUrl are required' },
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

    // Crawl YouTube data
    const runtimeContext = new RuntimeContext();
    const result = await youtubeTool.execute({
      context: { channelUrl },
      runtimeContext,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Failed to crawl YouTube data' },
        { status: 400 }
      );
    }

    // Save to Supabase
    const saved = await SupabaseService.saveYouTubeData(userId, result.data);

    return NextResponse.json({
      message: 'YouTube data crawled and saved successfully',
      crawled: result.data,
      saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

