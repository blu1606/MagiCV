import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseService } from '@/services/supabase-service';
import { LaTeXService } from '@/services/latex-service';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
    const { matches, jdMetadata } = body as {
      matches: MatchResult[];
      jdMetadata: JDMatchingResults['jdMetadata'];
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

    // Group components by type
    const componentsByType = {
      experience: goodMatches.filter(m => m.cvComponent?.type === 'experience'),
      education: goodMatches.filter(m => m.cvComponent?.type === 'education'),
      skill: goodMatches.filter(m => m.cvComponent?.type === 'skill'),
      project: goodMatches.filter(m => m.cvComponent?.type === 'project'),
    };

    // Use LLM to create optimized CV content
    const cvData = await generateOptimizedCVContent(
      profile,
      componentsByType,
      jdMetadata
    );

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
    return new NextResponse(pdfBuffer, {
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

/**
 * Generate optimized CV content using LLM
 */
async function generateOptimizedCVContent(
  profile: any,
  componentsByType: {
    experience: MatchResult[];
    education: MatchResult[];
    skill: MatchResult[];
    project: MatchResult[];
  },
  jdMetadata: JDMatchingResults['jdMetadata']
): Promise<any> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a professional CV writer. Create an optimized CV content for this job application.

Job Description:
Title: ${jdMetadata.title}
Company: ${jdMetadata.company}
Location: ${jdMetadata.location || 'N/A'}

Candidate Profile:
Name: ${profile.full_name || 'Candidate Name'}
Profession: ${profile.profession || 'Professional'}

Matched Components:

EXPERIENCES (${componentsByType.experience.length}):
${componentsByType.experience
  .map(
    (m, i) =>
      `${i + 1}. ${m.cvComponent!.title} at ${m.cvComponent!.organization || 'N/A'} (Match: ${m.score}%)
   ${m.cvComponent!.start_date || 'N/A'} - ${m.cvComponent!.end_date || 'Present'}
   ${m.cvComponent!.description || 'No description'}
   Highlights: ${m.cvComponent!.highlights.join(', ')}`
  )
  .join('\n\n')}

EDUCATION (${componentsByType.education.length}):
${componentsByType.education
  .map(
    (m, i) =>
      `${i + 1}. ${m.cvComponent!.title} at ${m.cvComponent!.organization || 'N/A'} (Match: ${m.score}%)
   ${m.cvComponent!.start_date || 'N/A'} - ${m.cvComponent!.end_date || 'N/A'}
   ${m.cvComponent!.description || 'No description'}`
  )
  .join('\n\n')}

SKILLS (${componentsByType.skill.length}):
${componentsByType.skill
  .map((m, i) => `${i + 1}. ${m.cvComponent!.title} (Match: ${m.score}%): ${m.cvComponent!.description || 'N/A'}`)
  .join('\n')}

PROJECTS (${componentsByType.project.length}):
${componentsByType.project
  .map(
    (m, i) =>
      `${i + 1}. ${m.cvComponent!.title} (Match: ${m.score}%)
   ${m.cvComponent!.description || 'No description'}
   Highlights: ${m.cvComponent!.highlights.join(', ')}`
  )
  .join('\n\n')}

Task:
Create a CV content in JSON format that is optimized for this specific job. Rewrite bullets to be more impactful and aligned with the job requirements. Select top 3-5 items per category.

Output format:
{
  "profile": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "(000) 000-0000",
    "address": "City, Country",
    "city_state_zip": "City, Country"
  },
  "experience": [
    {
      "title": "Job Title",
      "organization": "Company Name",
      "location": "City, Country",
      "remote": false,
      "start": "Jan 2020",
      "end": "Present",
      "bullets": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree Name",
      "concentration": "Field of Study",
      "location": "City, Country",
      "graduation_date": "May 2020",
      "gpa": "3.8/4.0",
      "coursework": ["Course 1", "Course 2"],
      "awards": ["Award 1"]
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2", "Skill 3"],
    "languages": [{"name": "English", "level": "Native"}],
    "interests": ["Interest 1", "Interest 2"]
  }
}

Return ONLY valid JSON without markdown formatting.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Clean response
  let cleanText = response.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const cvContent = JSON.parse(cleanText);

  // Add default margins
  cvContent.margins = LaTeXService.getDefaultMargins();

  return cvContent;
}
