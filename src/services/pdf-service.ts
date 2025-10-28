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
   * Parse PDF buffer and extract text using pdf2json
   */
  static async parsePDF(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const PDFParser = require('pdf2json');
        const pdfParser = new PDFParser();

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            // Extract text from all pages
            const text = pdfData.Pages
              .map((page: any) => 
                page.Texts.map((text: any) => 
                  decodeURIComponent(text.R.map((r: any) => r.T).join(' '))
                ).join(' ')
              )
              .join('\n\n');
            
            resolve(text);
          } catch (err: any) {
            reject(new Error(`Failed to extract text: ${err.message}`));
          }
        });

        pdfParser.on('pdfParser_dataError', (error: any) => {
          console.error('❌ PDF parsing error:', error.parserError);
          reject(new Error(`Failed to parse PDF: ${error.parserError}`));
        });

        // Parse buffer
        pdfParser.parseBuffer(buffer);
      } catch (error: any) {
        console.error('❌ PDF initialization error:', error.message);
        reject(new Error(`Failed to initialize PDF parser: ${error.message}`));
      }
    });
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
  }> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `Analyze the following job description and extract structured information in JSON format:

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
      // Save individual components as skills/requirements
      let componentsCreated = 0;

      // Save requirements as skill components
      for (const req of jdData.requirements) {
        const embedding = await EmbeddingService.embed(req);
        await SupabaseService.createComponent({
          user_id: userId,
          type: 'skill',
          title: 'Job Requirement',
          description: req,
          highlights: [`CV: ${cv.id}`, `Company: ${jdData.company}`],
          embedding,
          src: 'job_description',
        });
        componentsCreated++;
      }

      // Save skills as skill components
      for (const skill of jdData.skills) {
        const skillText = `${skill.skill} ${skill.level || ''} ${skill.required ? '(Required)' : ''}`;
        const embedding = await EmbeddingService.embed(skillText);
        await SupabaseService.createComponent({
          user_id: userId,
          type: 'skill',
          title: skill.skill,
          description: `Level: ${skill.level || 'N/A'} - ${skill.required ? 'Required' : 'Optional'}`,
          highlights: [`CV: ${cv.id}`, `Company: ${jdData.company}`],
          embedding,
          src: 'job_description',
        });
        componentsCreated++;
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
}

