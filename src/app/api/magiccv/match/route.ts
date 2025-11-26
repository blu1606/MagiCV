import { NextRequest, NextResponse } from 'next/server';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';
import { MatchScoreOptimizerService } from '@/services/match-score-optimizer-service';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/magiccv/match - Calculate match score between CV components and JD
 * 
 * Real-time match score calculation for CV editor
 * Automatically gets userId from session
 * 
 * Body:
 * {
 *   jobDescription: string,
 *   detailed?: boolean (return detailed analysis with breakdown)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();
    const { jobDescription, detailed = false } = body;

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'jobDescription is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const profile = await SupabaseService.getProfileById(userId);
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    console.log('📊 Calculating real-time match score for user:', userId);

    // Use optimized weighted scoring algorithm
    const optimizedResult = await MatchScoreOptimizerService.calculateOptimizedMatchScore(
      userId,
      jobDescription,
      {
        useCache: true,
        topK: 50,
      }
    );

    // Format response to match CV editor expectations
    const response: any = {
      score: optimizedResult.score,
      summary: optimizedResult.suggestions[0] || `Your profile matches ${Math.round(optimizedResult.score)}% with this job`,
      categoryScores: {
        experience: optimizedResult.breakdown.experienceMatch || 0,
        skills: optimizedResult.breakdown.skillsMatch || 0,
        education: optimizedResult.breakdown.educationMatch || 0,
        projects: optimizedResult.breakdown.projectsMatch || 0,
      },
      suggestions: optimizedResult.suggestions,
    };

    // Add detailed breakdown if requested
    if (detailed) {
      response.topMatches = {
        experience: optimizedResult.topMatchedComponents.experience?.slice(0, 5),
        skills: optimizedResult.topMatchedComponents.skills?.slice(0, 5),
        education: optimizedResult.topMatchedComponents.education?.slice(0, 2),
        projects: optimizedResult.topMatchedComponents.projects?.slice(0, 5),
      };
      response.breakdown = optimizedResult.breakdown;
      response.missingSkills = optimizedResult.missingSkills;
      response.metadata = optimizedResult.metadata;
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

