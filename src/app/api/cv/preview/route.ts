import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseService } from '@/services/supabase-service';
import { LaTeXService } from '@/services/latex-service';
import { CVDataEnhancerService } from '@/services/cv-data-enhancer-service';
import type { MatchResult, JDMatchingResults } from '@/lib/types/jd-matching';

/**
 * POST /api/cv/preview
 *
 * Generate CV preview (returns PDF in response for viewing, not download)
 * Same logic as generate-from-matches but with inline display headers
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
    const { matches, jdMetadata, customizedData } = body as {
      matches: MatchResult[];
      jdMetadata: JDMatchingResults['jdMetadata'];
      customizedData?: any;
    };

    if (!matches || !Array.isArray(matches)) {
      return NextResponse.json(
        { error: 'matches array is required' },
        { status: 400 }
      );
    }

    console.log('👀 Generating CV preview...');

    // Filter only good matches (score >= 40)
    const goodMatches = matches.filter(m => m.score >= 40 && m.cvComponent !== null);

    if (goodMatches.length === 0) {
      return NextResponse.json(
        { error: 'No good matches found to generate CV' },
        { status: 400 }
      );
    }

    // Use CVDataEnhancerService to ensure CV completeness (same as generate-from-matches)
    console.log('🔧 Enhancing CV data for preview...');
    const enhancedData = await CVDataEnhancerService.enhanceCVData(
      user.id,
      goodMatches,
      jdMetadata,
      {
        minimumExperiences: 2,
        minimumSkills: 5,
        includeAllEducation: true,
      }
    );

    // Prepare cvData for LaTeX template
    const cvData = {
      profile: enhancedData.profile,
      professionalSummary: enhancedData.professionalSummary,
      experience: enhancedData.experiences,
      education: enhancedData.education,
      skills: enhancedData.skills,
      projects: enhancedData.projects,
      awards: enhancedData.awards,
      certifications: enhancedData.certifications,
      margins: LaTeXService.getDefaultMargins(),
    };

    console.log('✓ CV content generated for preview');

    // Generate PDF
    let pdfBuffer: Buffer;

    try {
      const latexContent = await LaTeXService.renderTemplate('resume.tex.njk', cvData);
      pdfBuffer = await LaTeXService.generatePDFOnline(latexContent);
      console.log('✓ PDF preview generated (online)');
    } catch (error) {
      console.warn('⚠️ Online compiler failed for preview, trying local...');
      pdfBuffer = await LaTeXService.generatePDF('resume.tex.njk', cvData);
      console.log('✓ PDF preview generated (local)');
    }

    // Return PDF for inline viewing (not download)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="CV_Preview_${jdMetadata.company}_${jdMetadata.title}.pdf"`, // inline instead of attachment
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('❌ CV preview error:', error.message);
    return NextResponse.json(
      {
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

