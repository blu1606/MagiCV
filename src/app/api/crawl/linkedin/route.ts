import { NextRequest, NextResponse } from 'next/server';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { linkedinTool } from '@/mastra/tools';
import { SupabaseService } from '@/services/supabase-service';

/**
 * POST /api/crawl/linkedin - Process LinkedIn data and save to Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profileUrl, profileData } = body;

    if (!userId || !profileUrl || !profileData) {
      return NextResponse.json(
        { error: 'userId, profileUrl, and profileData are required' },
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

    // Process LinkedIn data
    const runtimeContext = new RuntimeContext();
    const result = await linkedinTool.execute({
      context: { profileUrl, profileData },
      runtimeContext,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Failed to process LinkedIn data' },
        { status: 400 }
      );
    }

    // Save to Supabase
    const saved = await SupabaseService.saveLinkedInData(userId, result.data);

    return NextResponse.json({
      message: 'LinkedIn data processed and saved successfully',
      processed: result.data,
      saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

