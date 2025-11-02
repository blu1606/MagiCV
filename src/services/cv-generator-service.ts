import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseService } from './supabase-service';
import { EmbeddingService } from './embedding-service';
import { LaTeXService } from './latex-service';
import { LLMUtilsService } from './llm-utils-service';
import type { Component, Profile } from '@/lib/supabase';
import { PDFService } from './pdf-service';

/**
 * CV Generator Service
 * Chọn lọc components phù hợp và tạo CV theo JD
 */
export class CVGeneratorService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient() {
    if (!this.genAI) {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Tìm components phù hợp với JD bằng vector search
   */
  static async findRelevantComponents(
    userId: string,
    jobDescription: string,
    limit: number = 20
  ): Promise<Component[]> {
    try {
      console.log('🔍 Finding relevant components...');
      
      // If no job description, get all user components
      if (!jobDescription || jobDescription.trim() === '') {
        console.log('⚠️ No job description provided, getting all components');
        const result = await SupabaseService.getUserComponents(userId);
        return result.components.slice(0, limit);
      }
      
      // Generate embedding cho JD
      const jdEmbedding = await EmbeddingService.embed(jobDescription);
      
      // Vector search
      const components = await SupabaseService.similaritySearchComponents(
        userId,
        jdEmbedding,
        limit
      );

      // Fallback: nếu không tìm thấy component nào (có thể do embedding chưa có)
      // thì lấy tất cả components của user
      if (components.length === 0) {
        console.warn('⚠️ No components found via vector search, getting all user components');
        const result = await SupabaseService.getUserComponents(userId);
        return result.components.slice(0, limit);
      }

      console.log(`✅ Found ${components.length} relevant components`);
      return components;
    } catch (error: any) {
      console.error('❌ Error finding components:', error.message);
      
      // Last resort fallback: get all user components
      console.warn('⚠️ Error in vector search, falling back to all components');
      try {
        const result = await SupabaseService.getUserComponents(userId);
        return result.components.slice(0, limit);
      } catch (fallbackError: any) {
        console.error('❌ Fallback also failed:', fallbackError.message);
        throw error; // Throw original error
      }
    }
  }

  /**
   * Chọn lọc và sắp xếp components bằng LLM
   */
  static async selectAndRankComponents(
    components: Component[],
    jobDescription: string,
    profile: Profile
  ): Promise<{
    experiences: any[];
    education: any[];
    skills: any[];
    projects: any[];
  }> {
    try {
      console.log('🤖 Using LLM to select and rank components...');
      
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Group components by type
      const componentsByType = {
        experience: components.filter(c => c.type === 'experience'),
        education: components.filter(c => c.type === 'education'),
        skill: components.filter(c => c.type === 'skill'),
        project: components.filter(c => c.type === 'project'),
      };

      const prompt = `You are a professional CV writer. Given a job description and candidate's components, select and rank the most relevant items for each category.

Job Description:
${jobDescription}

Candidate Profile:
Name: ${profile.full_name || 'Not specified'}
Profession: ${profile.profession || 'Not specified'}

Available Components:

EXPERIENCES (${componentsByType.experience.length}):
${componentsByType.experience.map((c, i) => `${i+1}. ${c.title} at ${c.organization || 'N/A'} (${c.start_date || 'N/A'} - ${c.end_date || 'Current'})\n   ${c.description || 'No description'}\n   Highlights: ${c.highlights.join(', ')}`).join('\n\n')}

EDUCATION (${componentsByType.education.length}):
${componentsByType.education.map((c, i) => `${i+1}. ${c.title} at ${c.organization || 'N/A'} (${c.start_date || 'N/A'} - ${c.end_date || 'N/A'})\n   ${c.description || 'No description'}`).join('\n\n')}

SKILLS (${componentsByType.skill.length}):
${componentsByType.skill.map((c, i) => `${i+1}. ${c.title}: ${c.description || 'No description'}`).join('\n')}

PROJECTS (${componentsByType.project.length}):
${componentsByType.project.map((c, i) => `${i+1}. ${c.title} (${c.organization || 'Personal'})\n   ${c.description || 'No description'}\n   Highlights: ${c.highlights.join(', ')}`).join('\n\n')}

Task:
1. Select the MOST RELEVANT items from each category that match the job requirements
2. Rank them by relevance (most relevant first)
3. Rewrite bullets/highlights to be more impactful and aligned with the job
4. Return ONLY valid JSON without markdown formatting

Output format:
{
  "experiences": [
    {
      "id": "component_id",
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
      "id": "component_id",
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
  },
  "projects": [
    {
      "id": "component_id",
      "title": "Project Name",
      "organization": "Company/Personal",
      "location": "Location or N/A",
      "start": "Start Date",
      "end": "End Date",
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ]
}

Important: Select only the BEST 3-5 items per category. Quality over quantity!`;

      // Use LLM utils for robust JSON parsing and retry logic
      const selected = await LLMUtilsService.callWithRetry(model, prompt, {
        maxRetries: 3,
        parseJSON: true,
        validator: (data: any) => {
          // Validate structure
          if (!data.experiences || !Array.isArray(data.experiences)) {
            console.error('Invalid structure: missing experiences array');
            return false;
          }
          if (!data.education || !Array.isArray(data.education)) {
            console.error('Invalid structure: missing education array');
            return false;
          }
          if (!data.skills) {
            console.error('Invalid structure: missing skills object');
            return false;
          }
          return true;
        },
        validatorErrorMessage: 'Response must include experiences, education, skills, and projects arrays',
      });

      console.log('✅ Components selected and ranked');
      return selected;
    } catch (error: any) {
      console.error('❌ Error selecting components:', error.message);
      throw error;
    }
  }

  /**
   * Generate CV content theo format của resume.tex.njk
   */
  static async generateCVContent(
    userId: string,
    jobDescription: string,
    options?: {
      includeProjects?: boolean;
      maxExperiences?: number;
      maxEducation?: number;
    }
  ): Promise<any> {
    try {
      console.log('📝 Generating CV content...');

      // Get profile and email
      const { profile, email } = await SupabaseService.getUserInfo(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      // Extract keywords/categories from JD and match to user's components
      const components = await this.matchComponentsByCategories(
        userId,
        jobDescription,
        { categoriesLimit: 10, topKPerCategory: 5 }
      );

      if (components.length === 0) {
        throw new Error('No components found for this user');
      }

      // Select and rank components using LLM
      const selected = await this.selectAndRankComponents(
        components,
        jobDescription,
        profile
      );

      // Build CV data structure for template
      const cvData = {
        profile: {
          name: profile.full_name || 'Your Name',
          email: email || 'email@example.com',
          phone: '(000) 000-0000', // TODO: Add phone to profile table
          address: '123 Street', // TODO: Add address to profile table
          city_state_zip: 'City, State ZIP', // TODO: Add location to profile table
        },
        margins: LaTeXService.getDefaultMargins(),
        education: selected.education || [],
        experience: selected.experiences || [],
        skills: selected.skills || {
          technical: [],
          languages: [],
          interests: [],
        },
        leadership: [], // Can add later if needed
      };

      // Add projects to experience if included
      if (options?.includeProjects && selected.projects) {
        cvData.experience = [
          ...cvData.experience,
          ...selected.projects,
        ];
      }

      console.log('✅ CV content generated');
      return cvData;
    } catch (error: any) {
      console.error('❌ Error generating CV content:', error.message);
      throw error;
    }
  }

  /**
   * Match components theo từng category lớn trích xuất từ JD
   * Thay vì lưu DB, dùng kết quả matching để build đầu vào cho LLM
   */
  static async matchComponentsByCategories(
    userId: string,
    jobDescription: string,
    options?: { categoriesLimit?: number; topKPerCategory?: number }
  ): Promise<Component[]> {
    const categoriesLimit = options?.categoriesLimit ?? 10;
    const topKPerCategory = options?.topKPerCategory ?? 5;

    // 1) Trích xuất groupedSkills (Software, AI, Cloud, ...)
    const jd = await PDFService.extractJDComponents(jobDescription);
    const grouped = (jd.groupedSkills || []).slice(0, categoriesLimit);

    // Nếu không có groupedSkills, fallback về vector search toàn văn
    if (grouped.length === 0) {
      return this.findRelevantComponents(userId, jobDescription, categoriesLimit * topKPerCategory);
    }

    // 2) Với mỗi category, tạo truy vấn ngắn gọn: summary + technologies
    const queries = grouped.map(g => {
      const techs = (g.technologies || []).slice(0, 10).join(', ');
      return `${g.category}: ${g.summary}. Tech: ${techs}`;
    });

    // 3) Tìm topKPerCategory component cho từng truy vấn
    const results: Component[] = [];
    for (const q of queries) {
      const embedding = await EmbeddingService.embed(q);
      const batch = await SupabaseService.similaritySearchComponents(
        userId,
        embedding,
        topKPerCategory
      );
      results.push(...batch);
    }

    // 4) Loại trùng theo id, giữ thứ tự xuất hiện (theo ưu tiên category)
    const seen = new Set<string>();
    const deduped: Component[] = [];
    for (const c of results) {
      const id = (c as any).id || `${c.type}:${c.title}:${c.organization ?? ''}`;
      if (!seen.has(id)) {
        seen.add(id);
        deduped.push(c);
      }
    }

    return deduped;
  }

  /**
   * Generate full CV PDF with intelligent fallback strategy
   */
  static async generateCVPDF(
    userId: string,
    jobDescription: string,
    options?: {
      includeProjects?: boolean;
      useOnlineCompiler?: boolean;
    }
  ): Promise<{ pdfBuffer: Buffer; cvData: any }> {
    try {
      console.log('🚀 Starting CV PDF generation...');

      // Generate CV content
      const cvData = await this.generateCVContent(userId, jobDescription, options);

      // Validate CV data before compilation
      const validation = LaTeXService.validateResumeData(cvData);
      if (!validation.valid) {
        console.warn('⚠️ CV data validation warnings:', validation.errors);
        // Continue anyway but log warnings
      }

      // Generate PDF from template with fallback strategy
      let pdfBuffer: Buffer;
      let compilationMethod: string;

      try {
        if (options?.useOnlineCompiler !== false) {
          // Try online compiler first (default)
          console.log('🌐 Attempting online compilation...');
          const latexContent = await LaTeXService.renderTemplate('resume.tex.njk', cvData);
          pdfBuffer = await LaTeXService.generatePDFOnline(latexContent);
          compilationMethod = 'online';
        } else {
          // Use local if explicitly requested
          console.log('🖥️ Using local compilation...');
          pdfBuffer = await LaTeXService.generatePDF('resume.tex.njk', cvData);
          compilationMethod = 'local';
        }
      } catch (primaryError: any) {
        console.warn(`⚠️ Primary compilation (${options?.useOnlineCompiler !== false ? 'online' : 'local'}) failed:`, primaryError.message);

        // Fallback to alternative method
        try {
          if (options?.useOnlineCompiler !== false) {
            // Online failed, try local
            console.log('🔄 Falling back to local compilation...');
            pdfBuffer = await LaTeXService.generatePDF('resume.tex.njk', cvData);
            compilationMethod = 'local (fallback)';
          } else {
            // Local failed, try online
            console.log('🔄 Falling back to online compilation...');
            const latexContent = await LaTeXService.renderTemplate('resume.tex.njk', cvData);
            pdfBuffer = await LaTeXService.generatePDFOnline(latexContent);
            compilationMethod = 'online (fallback)';
          }
        } catch (fallbackError: any) {
          console.error('❌ Both compilation methods failed');
          console.error('Primary error:', primaryError.message);
          console.error('Fallback error:', fallbackError.message);
          throw new Error(
            `PDF generation failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`
          );
        }
      }

      console.log(`✅ CV PDF generated successfully (${compilationMethod})`);

      return {
        pdfBuffer,
        cvData,
      };
    } catch (error: any) {
      console.error('❌ Error generating CV PDF:', error.message);

      // Provide more helpful error messages
      if (error.message.includes('Profile not found')) {
        throw new Error('User profile not found. Please create a profile first.');
      }
      if (error.message.includes('No components found')) {
        throw new Error('No CV components found. Please add your experiences, skills, or education.');
      }
      if (error.message.includes('pdflatex is not installed')) {
        throw new Error('PDF compilation failed. Please ensure pdflatex is installed or use online compilation.');
      }

      throw error;
    }
  }

  /**
   * Calculate match score between CV and JD
   */
  static async calculateMatchScore(
    userId: string,
    jobDescription: string
  ): Promise<{
    score: number;
    matches: {
      experience: number;
      education: number;
      skills: number;
    };
    suggestions: string[];
  }> {
    try {
      console.log('📊 Calculating match score...');

      const components = await this.findRelevantComponents(userId, jobDescription, 50);

      // Group by type
      const byType = {
        experience: components.filter(c => c.type === 'experience').length,
        education: components.filter(c => c.type === 'education').length,
        skill: components.filter(c => c.type === 'skill').length,
        project: components.filter(c => c.type === 'project').length,
      };

      // Simple scoring algorithm (can be improved with LLM)
      const experienceScore = Math.min(byType.experience * 10, 40);
      const educationScore = Math.min(byType.education * 15, 30);
      const skillScore = Math.min(byType.skill * 2, 30);

      const totalScore = experienceScore + educationScore + skillScore;

      // Generate suggestions
      const suggestions: string[] = [];
      if (byType.experience < 3) {
        suggestions.push('Add more relevant work experience');
      }
      if (byType.skill < 10) {
        suggestions.push('Add more technical skills');
      }
      if (byType.education < 1) {
        suggestions.push('Add your education background');
      }

      return {
        score: Math.min(totalScore, 100),
        matches: {
          experience: experienceScore,
          education: educationScore,
          skills: skillScore,
        },
        suggestions,
      };
    } catch (error: any) {
      console.error('❌ Error calculating match score:', error.message);
      throw error;
    }
  }
}

