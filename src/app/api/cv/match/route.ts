import { NextRequest, NextResponse } from 'next/server';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';

/**
 * POST /api/cv/match - Calculate match score between CV components and JD
 * 
 * Body:
 * {
 *   userId: string,
 *   jobDescription: string,
 *   detailed?: boolean (return detailed analysis)
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

    console.log('📊 Calculating match score for user:', userId);

    // Calculate match score
    const matchResult = await CVGeneratorService.calculateMatchScore(
      userId,
      jobDescription
    );

    let detailedAnalysis = null;

    if (detailed) {
      // Get relevant components for detailed view
      const components = await CVGeneratorService.findRelevantComponents(
        userId,
        jobDescription,
        20
      );

      // Group by type
      const componentsByType = {
        experience: components.filter(c => c.type === 'experience'),
        education: components.filter(c => c.type === 'education'),
        skill: components.filter(c => c.type === 'skill'),
        project: components.filter(c => c.type === 'project'),
      };

      detailedAnalysis = {
        totalComponents: components.length,
        componentsByType: {
          experience: componentsByType.experience.length,
          education: componentsByType.education.length,
          skill: componentsByType.skill.length,
          project: componentsByType.project.length,
        },
        topComponents: {
          experience: componentsByType.experience.slice(0, 3).map(c => ({
            id: c.id,
            title: c.title,
            organization: c.organization,
            description: c.description?.substring(0, 100),
          })),
          skills: componentsByType.skill.slice(0, 5).map(c => ({
            id: c.id,
            title: c.title,
            description: c.description?.substring(0, 50),
          })),
        },
      };
    }

    return NextResponse.json({
      ...matchResult,
      detailed: detailedAnalysis,
      profile: {
        name: profile.full_name,
        profession: profile.profession,
      },
    });
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

