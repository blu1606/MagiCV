import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/services/supabase-service';

/**
 * GET /api/job-descriptions/:userId - Get all job descriptions for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const jobDescriptions = await SupabaseService.getJobDescriptions(userId);
    return NextResponse.json(jobDescriptions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

