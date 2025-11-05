import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseService } from '@/services/supabase-service';
import { LaTeXService } from '@/services/latex-service';
import { CVDataEnhancerService } from '@/services/cv-data-enhancer-service';
import type { MatchResult, JDMatchingResults } from '@/lib/types/jd-matching';

/**
 * POST /api/cv/generate-from-matches
 *
 * Generate CV PDF from matched components
 * Uses LLM to create optimized LaTeX content based on matches
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

    console.log('📝 Generating CV from matches...');

    // Get user profile
    const profile = await SupabaseService.getProfileById(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Filter only good matches (score >= 40)
    const goodMatches = matches.filter(m => m.score >= 40 && m.cvComponent !== null);

    if (goodMatches.length === 0) {
      return NextResponse.json(
        { error: 'No good matches found to generate CV' },
        { status: 400 }
      );
    }

    console.log(`✓ Using ${goodMatches.length} matched components`);

    // Use CVDataEnhancerService to ensure CV completeness
    // This ensures we ALWAYS include:
    // - All contact information (phone, address, email)
    // - ALL education (not just matched)
    // - Minimum number of experiences and skills
    // - Awards and certifications extracted from highlights
    // - Professional summary
    console.log('🔧 Enhancing CV data for completeness...');
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

    console.log('✓ CV data enhanced with complete information');

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

    console.log('✓ CV content generated');

    // Generate PDF using LaTeX
    let pdfBuffer: Buffer;

    try {
      // Try online compiler first (more reliable)
      const latexContent = await LaTeXService.renderTemplate('resume.tex.njk', cvData);
      pdfBuffer = await LaTeXService.generatePDFOnline(latexContent);
      console.log('✓ PDF generated (online)');
    } catch (error) {
      console.warn('⚠️ Online compiler failed, trying local...');
      // Fallback to local compiler
      pdfBuffer = await LaTeXService.generatePDF('resume.tex.njk', cvData);
      console.log('✓ PDF generated (local)');
    }

    // Return PDF as downloadable file
    // Convert Buffer to Uint8Array for NextResponse (Buffer is compatible with Uint8Array)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV_${jdMetadata.company}_${jdMetadata.title}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('❌ CV generation error:', error.message);
    return NextResponse.json(
      {
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

