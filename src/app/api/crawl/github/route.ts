import { NextRequest, NextResponse } from 'next/server';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { githubTool } from '@/mastra/tools';
import { SupabaseService } from '@/services/supabase-service';

/**
 * POST /api/crawl/github - Crawl GitHub data and save to Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, includeReadme, maxRepos } = body;

    if (!userId || !username) {
      return NextResponse.json(
        { error: 'userId and username are required' },
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

    // Crawl GitHub data
    const runtimeContext = new RuntimeContext();
    const result = await githubTool.execute({
      context: { username, includeReadme, maxRepos },
      runtimeContext,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Failed to crawl GitHub data' },
        { status: 400 }
      );
    }

    // Save to Supabase
    const saved = await SupabaseService.saveGitHubData(userId, result.data);

    return NextResponse.json({
      message: 'GitHub data crawled and saved successfully',
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

