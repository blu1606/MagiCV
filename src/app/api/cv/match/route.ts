import { NextRequest, NextResponse } from 'next/server';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';
import { MatchScoreOptimizerService } from '@/services/match-score-optimizer-service';

/**
 * POST /api/cv/match - Calculate match score between CV components and JD
 *
 * NOTE: This endpoint now uses the optimized weighted scoring algorithm
 * for consistency across the application.
 *
 * Body:
 * {
 *   userId: string,
 *   jobDescription: string,
 *   detailed?: boolean (return detailed analysis with breakdown)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, jobDescription, detailed = false } = body;

    if (!userId || !jobDescription) {
      return NextResponse.json(
        { error: 'userId and jobDescription are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const profile = await SupabaseService.getProfileById(userId);
    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('📊 Calculating optimized match score for user:', userId);

    // Use optimized weighted scoring algorithm
    const optimizedResult = await MatchScoreOptimizerService.calculateOptimizedMatchScore(
      userId,
      jobDescription,
      {
        useCache: true,
        topK: 50,
      }
    );

    // Format response to match legacy format
    const response: any = {
      score: optimizedResult.score,
      summary: optimizedResult.suggestions[0] || `Your profile matches ${Math.round(optimizedResult.score)}% with this job`,
      profile: {
        name: profile.full_name,
        profession: profile.profession,
      },
    };

    // Add detailed breakdown if requested
    if (detailed) {
      response.detailed = {
        breakdown: optimizedResult.breakdown,
        missingSkills: optimizedResult.missingSkills,
        suggestions: optimizedResult.suggestions,
        topMatches: {
          experience: optimizedResult.topMatchedComponents.experience?.slice(0, 3),
          skills: optimizedResult.topMatchedComponents.skills?.slice(0, 5),
          education: optimizedResult.topMatchedComponents.education?.slice(0, 2),
          projects: optimizedResult.topMatchedComponents.projects?.slice(0, 3),
        },
        metadata: optimizedResult.metadata,
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Match calculation error:', error.message);
    return NextResponse.json(
      { 
        error: error.message,
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cv/match?userId=xxx&cvId=yyy
 * Get match score for a saved CV
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const cvId = searchParams.get('cvId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (cvId) {
      // Get specific CV
      const cv = await SupabaseService.getCVById(cvId);
      if (!cv) {
        return NextResponse.json(
          { error: 'CV not found' },
          { status: 404 }
        );
      }

      if (cv.user_id !== userId) {
        return NextResponse.json(
          { error: 'CV does not belong to this user' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        cv: {
          id: cv.id,
          title: cv.title,
          match_score: cv.match_score,
          job_description: cv.job_description?.substring(0, 200) + '...',
          created_at: cv.created_at,
        },
      });
    } else {
      // Get all CVs with match scores
      const cvs = await SupabaseService.getCVsByUserId(userId);
      
      const cvsWithScores = cvs.map(cv => ({
        id: cv.id,
        title: cv.title,
        match_score: cv.match_score,
        created_at: cv.created_at,
      }));

      return NextResponse.json({
        total: cvs.length,
        cvs: cvsWithScores,
      });
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

