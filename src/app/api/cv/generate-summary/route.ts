import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseService } from '@/services/supabase-service';
import { ProfessionalSummaryService } from '@/services/professional-summary-service';
import type { MatchResult, JDMatchingResults } from '@/lib/types/jd-matching';
import type { Component } from '@/lib/supabase';

/**
 * POST /api/cv/generate-summary
 *
 * Generate professional summary from either:
 * 1. Matched components (from JD matching)
 * 2. Raw components (from user's library)
 *
 * Request body:
 * {
 *   // Option 1: From matches
 *   matches?: MatchResult[];
 *   jdMetadata?: JDMatchingResults['jdMetadata'];
 *
 *   // Option 2: From components
 *   experiences?: Component[];
 *   skills?: Component[];
 *   targetRole?: string;
 *   targetCompany?: string;
 * }
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

    const body = await request.json();
    const { matches, jdMetadata, experiences, skills, targetRole, targetCompany } = body;

    let summary: string;

    // Option 1: Generate from matches
    if (matches && jdMetadata) {
      console.log('📝 Generating summary from matches...');

      if (!Array.isArray(matches)) {
        return NextResponse.json(
          { error: 'matches must be an array' },
          { status: 400 }
        );
      }

      summary = await ProfessionalSummaryService.generateFromMatches(
        matches,
        jdMetadata,
        jdMetadata.seniorityLevel
      );

      // Validate summary quality
      const validation = ProfessionalSummaryService.validateSummary(summary);

      return NextResponse.json({
        summary,
        validation,
        source: 'matches',
      });
    }

    // Option 2: Generate from components
    if (experiences && skills && targetRole) {
      console.log('📝 Generating summary from components...');

      if (!Array.isArray(experiences) || !Array.isArray(skills)) {
        return NextResponse.json(
          { error: 'experiences and skills must be arrays' },
          { status: 400 }
        );
      }

      summary = await ProfessionalSummaryService.generateFromComponents(
        experiences,
        skills,
        targetRole,
        targetCompany
      );

      // Validate summary quality
      const validation = ProfessionalSummaryService.validateSummary(summary);

      return NextResponse.json({
        summary,
        validation,
        source: 'components',
      });
    }

    // Neither option provided
    return NextResponse.json(
      {
        error: 'Either (matches + jdMetadata) or (experiences + skills + targetRole) must be provided',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('❌ Summary generation error:', error.message);
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
 * GET /api/cv/generate-summary/validate
 *
 * Validate a professional summary
 *
 * Query params:
 * - summary: The summary text to validate
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const summary = searchParams.get('summary');

    if (!summary) {
      return NextResponse.json(
        { error: 'summary query parameter is required' },
        { status: 400 }
      );
    }

    const validation = ProfessionalSummaryService.validateSummary(summary);

    return NextResponse.json({
      validation,
      summary,
    });
  } catch (error: any) {
    console.error('❌ Validation error:', error.message);
    return NextResponse.json(
      {
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
