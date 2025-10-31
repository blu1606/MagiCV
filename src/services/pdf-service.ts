import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseService } from './supabase-service';
import { EmbeddingService } from './embedding-service';

/**
 * PDF Processing Service
 * Handles PDF upload, parsing, and JD extraction
 */
export class PDFService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient() {
    if (!this.genAI) {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Parse PDF buffer using Google Gemini Vision API
   * More reliable than pdf-parse for demo purposes
   */
  static async parsePDF(buffer: Buffer): Promise<string> {
    try {
      console.log('📄 Starting PDF parsing with Gemini...');

      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      console.log('📦 Converting buffer to base64...');

      // Convert buffer to base64 for Gemini API
      const base64Data = buffer.toString('base64');

      console.log('🤖 Sending to Gemini for text extraction...');

      // Use Gemini to extract text from PDF
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: 'application/pdf',
          },
        },
        {
          text: 'Extract all text content from this PDF document. Return only the raw text, no formatting or additional commentary.',
        },
      ]);

      const response = result.response;
      const text = response.text();

      console.log(`✅ PDF parsed: ${text.length} characters extracted`);

      if (!text || text.trim().length === 0) {
        throw new Error('PDF contains no extractable text');
      }

      return text;
    } catch (error: any) {
      console.error('❌ PDF parsing error:', error.message);

      // Provide helpful error messages
      if (error.message.includes('API key')) {
        throw new Error('Google Gemini API key not configured');
      }

      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Extract Job Description components using LLM
   */
  static async extractJDComponents(rawText: string): Promise<{
    title: string;
    company: string;
    requirements: string[];
    skills: Array<{
      skill: string;
      level?: string;
      required: boolean;
    }>;
    responsibilities: string[];
    qualifications: string[];
    benefits?: string[];
    metadata: {
      location?: string;
      jobType?: string;
      experience?: string;
      salary?: string;
    };
    groupedSkills?: Array<{
      category: string;
      summary: string;
      technologies: string[];
    }>;
  }> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `Analyze the following job description and extract structured information in JSON format.

Additionally, group skills into broad categories (such as: Software, AI, Cloud, Data, DevOps, Security, Frontend, Backend, Mobile, Infrastructure, Product). For each category, provide a short summary and a list of concrete technologies/tools/libraries mentioned. IMPORTANT: Limit the number of categories returned to between 5 and 10 total. Within each category, list only the most essential technologies.

Job Description:
${rawText}

Extract the following fields:
- title: Job title
- company: Company name
- requirements: Array of job requirements
- skills: Array of required skills with {skill, level (if mentioned), required (boolean)}
- responsibilities: Array of job responsibilities
- qualifications: Array of qualifications
- benefits: Array of benefits (if mentioned)
- metadata: {location, jobType, experience, salary} (if mentioned)
 - groupedSkills: Array of objects with {category, summary, technologies[]} where categories are broad (e.g., Software, AI, Cloud, etc.). Categories MUST be between 5 and 10 total. Technologies should be specific names (e.g., React, Kubernetes, PostgreSQL).

Return ONLY valid JSON without any markdown formatting or code blocks.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Clean the response - remove markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanText);
      
      return {
        title: parsed.title || 'Unknown Position',
        company: parsed.company || 'Unknown Company',
        requirements: parsed.requirements || [],
        skills: parsed.skills || [],
        responsibilities: parsed.responsibilities || [],
        qualifications: parsed.qualifications || [],
        benefits: parsed.benefits || [],
        metadata: parsed.metadata || {},
        groupedSkills: parsed.groupedSkills || [],
      };
    } catch (error: any) {
      console.error('❌ JD extraction error:', error.message);
      throw new Error(`Failed to extract JD components: ${error.message}`);
    }
  }

  /**
   * Process PDF and save to database with embeddings
   * Updated to use Supabase Storage bucket cv_pdfs
   */
  static async processPDFAndSave(
    userId: string,
    buffer: Buffer,
    filename: string
  ): Promise<{
    cvId: string;
    pdfId: string;
    componentsCreated: number;
  }> {
    try {
      console.log('📄 Parsing PDF...');
      const rawText = await this.parsePDF(buffer);

      console.log('🤖 Extracting JD components with LLM...');
      const jdData = await this.extractJDComponents(rawText);

      console.log('📤 Uploading PDF to Supabase Storage (bucket: cv_pdfs)...');
      const { path, url } = await SupabaseService.uploadCVPdf(userId, filename, buffer);

      console.log('💾 Saving to database...');
      // Create CV record
      const cv = await SupabaseService.createCV({
        user_id: userId,
        title: jdData.title,
        job_description: rawText,
        content: jdData,
      });

      // Create CV PDF record
      const cvPdf = await SupabaseService.createCVPdf({
        user_id: userId,
        cv_id: cv.id,
        file_url: url,
        filename: filename,
        mime_type: 'application/pdf',
        byte_size: buffer.length,
        version: 1,
      });

      console.log('🔢 Generating embeddings...');
      // Save grouped skill components (5-10 general components)
      let componentsCreated = 0;

      // Use groupedSkills if available (prioritized for better organization)
      if (jdData.groupedSkills && jdData.groupedSkills.length > 0) {
        console.log(`📦 Using ${jdData.groupedSkills.length} grouped skill categories`);

        for (const group of jdData.groupedSkills) {
          // Create component text for embedding that includes all context
          const componentText = `${group.category}: ${group.summary}. Technologies: ${group.technologies.join(', ')}`;
          const embedding = await EmbeddingService.embed(componentText);

          await SupabaseService.createComponent({
            user_id: userId,
            type: 'skill',
            title: group.category,
            description: group.summary,
            highlights: [
              `CV: ${cv.id}`,
              `Company: ${jdData.company}`,
              `Technologies: ${group.technologies.join(', ')}`,
            ],
            embedding,
            src: 'job_description',
          });
          componentsCreated++;
        }
      } else {
        // Fallback: Create general components from requirements and skills
        console.log('⚠️ No grouped skills found, creating general components from requirements');

        // Group requirements into broader categories (max 10)
        const groupedRequirements = this.groupRequirementsIntoComponents(
          jdData.requirements,
          jdData.skills,
          jdData.company
        );

        for (const group of groupedRequirements.slice(0, 10)) {
          const embedding = await EmbeddingService.embed(group.description);
          await SupabaseService.createComponent({
            user_id: userId,
            type: 'skill',
            title: group.title,
            description: group.description,
            highlights: group.highlights,
            embedding,
            src: 'job_description',
          });
          componentsCreated++;
        }
      }

      console.log(`✅ Processed PDF: ${componentsCreated} components created`);
      console.log(`✅ PDF uploaded to: ${url}`);

      return {
        cvId: cv.id,
        pdfId: cvPdf.id,
        componentsCreated,
      };
    } catch (error: any) {
      console.error('❌ PDF processing error:', error.message);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  static async processPDFAndSaveJobDescription(
    userId: string,
    buffer: Buffer,
    filename: string
  ): Promise<{
    jobDescriptionId: string;
    componentsCreated: number;
  }> {
    const result = await this.processPDFAndSave(userId, buffer, filename);
    return {
      jobDescriptionId: result.cvId,
      componentsCreated: result.componentsCreated,
    };
  }

  /**
   * Group requirements and skills into general components (fallback method)
   * Creates 5-10 general components instead of many specific ones
   */
  private static groupRequirementsIntoComponents(
    requirements: string[],
    skills: Array<{ skill: string; level?: string; required?: boolean }>,
    company: string
  ): Array<{
    title: string;
    description: string;
    highlights: string[];
  }> {
    // Define categories for grouping - use Record to allow dynamic keys
    const categories: Record<string, { keywords: string[]; items: string[] }> = {
      'Technical Skills': {
        keywords: ['programming', 'language', 'framework', 'library', 'api', 'database', 'sql', 'development', 'code', 'software', 'system'],
        items: [],
      },
      'Cloud & DevOps': {
        keywords: ['cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'devops', 'deployment', 'infrastructure'],
        items: [],
      },
      'Data & Analytics': {
        keywords: ['data', 'analytics', 'ml', 'machine learning', 'ai', 'deep learning', 'statistics', 'model', 'training'],
        items: [],
      },
      'Frontend Development': {
        keywords: ['frontend', 'react', 'vue', 'angular', 'ui', 'ux', 'css', 'html', 'javascript', 'typescript', 'web'],
        items: [],
      },
      'Backend Development': {
        keywords: ['backend', 'server', 'api', 'rest', 'graphql', 'microservices', 'node', 'python', 'java', 'go'],
        items: [],
      },
      'Communication & Collaboration': {
        keywords: ['communication', 'team', 'collaboration', 'agile', 'scrum', 'leadership', 'presentation', 'stakeholder'],
        items: [],
      },
      'Problem Solving': {
        keywords: ['problem', 'analytical', 'critical thinking', 'troubleshoot', 'debug', 'optimize', 'performance'],
        items: [],
      },
    };

    // Categorize requirements
    requirements.forEach(req => {
      const lowerReq = req.toLowerCase();
      let categorized = false;

      for (const [category, config] of Object.entries(categories)) {
        if (config.keywords.some(kw => lowerReq.includes(kw))) {
          config.items.push(req);
          categorized = true;
          break; // Only add to first matching category
        }
      }

      // If not categorized, add to a general "Other Requirements" category
      if (!categorized) {
        if (!categories['Other Requirements']) {
          categories['Other Requirements'] = { keywords: [], items: [] };
        }
        categories['Other Requirements'].items.push(req);
      }
    });

    // Categorize skills
    skills.forEach(skill => {
      const lowerSkill = skill.skill.toLowerCase();
      let categorized = false;

      for (const [category, config] of Object.entries(categories)) {
        if (config.keywords.some(kw => lowerSkill.includes(kw))) {
          const skillText = `${skill.skill}${skill.level ? ` (${skill.level})` : ''}${skill.required ? ' - Required' : ''}`;
          config.items.push(skillText);
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        if (!categories['Other Requirements']) {
          categories['Other Requirements'] = { keywords: [], items: [] };
        }
        const skillText = `${skill.skill}${skill.level ? ` (${skill.level})` : ''}${skill.required ? ' - Required' : ''}`;
        categories['Other Requirements'].items.push(skillText);
      }
    });

    // Create components from categories
    const components = Object.entries(categories)
      .filter(([_, config]) => config.items.length > 0)
      .sort((a, b) => b[1].items.length - a[1].items.length)
      .slice(0, 10) // Limit to 10 components
      .map(([category, config]) => ({
        title: category,
        description: config.items.slice(0, 5).join('; ') + (config.items.length > 5 ? '...' : ''),
        highlights: [
          `Company: ${company}`,
          `Count: ${config.items.length} requirement${config.items.length !== 1 ? 's' : ''}`,
          ...config.items.slice(0, 8).map(item => `• ${item}`),
        ],
      }));

    return components;
  }
}

