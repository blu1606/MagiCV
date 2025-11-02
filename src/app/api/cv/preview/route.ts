import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseService } from '@/services/supabase-service';
import { LaTeXService } from '@/services/latex-service';
import { ProfessionalSummaryService } from '@/services/professional-summary-service';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

    // Get user profile
    const profile = await SupabaseService.getProfileById(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get user email
    const { email } = await SupabaseService.getUserInfo(user.id);

    // Filter only good matches (score >= 40)
    const goodMatches = matches.filter(m => m.score >= 40 && m.cvComponent !== null);

    if (goodMatches.length === 0) {
      return NextResponse.json(
        { error: 'No good matches found to generate CV' },
        { status: 400 }
      );
    }

    // Get ALL user components to ensure essential info
    const allUserComponents = await SupabaseService.getComponentsByUserId(user.id);

    // Group matched components by type
    const componentsByType = {
      experience: goodMatches.filter(m => m.cvComponent?.type === 'experience'),
      education: goodMatches.filter(m => m.cvComponent?.type === 'education'),
      skill: goodMatches.filter(m => m.cvComponent?.type === 'skill'),
      project: goodMatches.filter(m => m.cvComponent?.type === 'project'),
    };

    // Always include ALL education
    const allEducation = allUserComponents.filter(c => c.type === 'education');
    const educationIds = new Set(componentsByType.education.map(m => m.cvComponent!.id));
    const additionalEducation = allEducation.filter(edu => !educationIds.has(edu.id));

    if (additionalEducation.length > 0) {
      componentsByType.education.push(...additionalEducation.map(edu => ({
        jdComponent: { id: 'default', type: 'education' as const, title: '', description: '', highlights: [], embedding: null, created_at: '', updated_at: '' },
        cvComponent: edu,
        score: 100,
        reasoning: 'Essential education information',
      })));
    }

    // Generate professional summary
    let professionalSummary: string | undefined;
    try {
      professionalSummary = await ProfessionalSummaryService.generateFromMatches(
        goodMatches,
        jdMetadata,
        jdMetadata.seniorityLevel
      );
    } catch (error: any) {
      console.warn('⚠️ Professional summary generation failed:', error.message);
    }

    // Generate CV content (reuse from generate-from-matches logic)
    const cvData = await generateQuickCVContent(
      profile,
      email,
      componentsByType,
      jdMetadata,
      professionalSummary
    );

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

/**
 * Quick CV content generation (simplified, less LLM calls for faster preview)
 */
async function generateQuickCVContent(
  profile: any,
  email: string | null,
  componentsByType: {
    experience: MatchResult[];
    education: MatchResult[];
    skill: MatchResult[];
    project: MatchResult[];
  },
  jdMetadata: JDMatchingResults['jdMetadata'],
  professionalSummary?: string
): Promise<any> {
  // Build CV data directly without heavy LLM processing for quick preview
  const cvData: any = {
    profile: {
      name: profile.full_name || 'Your Name',
      email: email || 'email@example.com',
      phone: profile.phone || '(000) 000-0000',
      address: profile.location || 'City, Country',
      city_state_zip: profile.location || 'City, Country',
    },
    professionalSummary,
    experience: componentsByType.experience.map(m => {
      const exp = m.cvComponent!;
      return {
        title: exp.title,
        organization: exp.organization || 'Company',
        location: 'Location',
        remote: false,
        start: formatDate(exp.start_date),
        end: formatDate(exp.end_date) || 'Present',
        bullets: exp.highlights.length > 0 ? exp.highlights : [exp.description || 'No description'],
      };
    }),
    education: componentsByType.education.map(m => {
      const edu = m.cvComponent!;
      return {
        school: edu.organization || 'University',
        degree: edu.title,
        concentration: edu.description || '',
        location: 'Location',
        graduation_date: formatDate(edu.end_date) || 'N/A',
        gpa: '',
        coursework: [],
        awards: [],
      };
    }),
    skills: {
      technical: componentsByType.skill.map(m => m.cvComponent!.title),
      languages: [],
      interests: [],
    },
    margins: LaTeXService.getDefaultMargins(),
  };

  return cvData;
}

/**
 * Format date from ISO to readable format
 */
function formatDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  } catch {
    return dateStr;
  }
}
