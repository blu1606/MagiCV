import { GoogleGenerativeAI } from '@google/generative-ai';
import { randomUUID } from 'crypto';
import { EmbeddingService } from './embedding-service';
import { SupabaseService } from './supabase-service';
import { PDFService } from './pdf-service';
import type { Component } from '@/lib/supabase';
import type {
  JDComponent,
  MatchResult,
  JDMatchingResults,
  JDComponentType,
} from '@/lib/types/jd-matching';
import { getMatchQuality } from '@/lib/types/jd-matching';

/**
 * JD Matching Service
 * Matches Job Description components with CV components
 * WITHOUT saving to database
 */
export class JDMatchingService {
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
   * Extract JD components from PDF buffer
   * Returns components with embeddings (NO DATABASE SAVE)
   */
  static async extractJDComponents(buffer: Buffer): Promise<{
    jdMetadata: JDMatchingResults['jdMetadata'];
    components: JDComponent[];
  }> {
    try {
      console.log('📄 Extracting JD components...');

      // Parse PDF
      const rawText = await PDFService.parsePDF(buffer);

      // Extract structured data using LLM
      const jdData = await PDFService.extractJDComponents(rawText);

      // Extract metadata
      const jdMetadata = {
        title: jdData.title || 'Untitled Position',
        company: jdData.company || 'Unknown Company',
        location: jdData.metadata?.location || undefined,
        description: rawText.substring(0, 500),
      };

      // Convert to JDComponent format with embeddings
      const components: JDComponent[] = [];

      // Add requirements
      for (const req of jdData.requirements || []) {
        const embedding = await EmbeddingService.embed(req);
        components.push({
          id: randomUUID(),
          type: 'requirement',
          title: 'Requirement',
          description: req,
          required: true,
          embedding,
        });
      }

      // Add skills
      for (const skill of jdData.skills || []) {
        const skillText = `${skill.skill} ${skill.level || ''} ${skill.required ? '(Required)' : '(Optional)'}`;
        const embedding = await EmbeddingService.embed(skillText);
        components.push({
          id: randomUUID(),
          type: 'skill',
          title: skill.skill,
          description: skillText,
          required: skill.required || false,
          level: skill.level,
          embedding,
        });
      }

      // Add responsibilities
      for (const resp of jdData.responsibilities || []) {
        const embedding = await EmbeddingService.embed(resp);
        components.push({
          id: randomUUID(),
          type: 'responsibility',
          title: 'Responsibility',
          description: resp,
          required: false,
          embedding,
        });
      }

      // Add qualifications
      for (const qual of jdData.qualifications || []) {
        const embedding = await EmbeddingService.embed(qual);
        components.push({
          id: randomUUID(),
          type: 'qualification',
          title: 'Qualification',
          description: qual,
          required: true,
          embedding,
        });
      }

      console.log(`✅ Extracted ${components.length} JD components`);

      return {
        jdMetadata,
        components,
      };
    } catch (error: any) {
      console.error('❌ Error extracting JD components:', error.message);
      throw error;
    }
  }

  /**
   * Match a single JD component with user's CV components
   */
  static async matchSingleComponent(
    jdComponent: JDComponent,
    cvComponents: Component[]
  ): Promise<MatchResult> {
    try {
      if (!jdComponent.embedding) {
        throw new Error('JD component missing embedding');
      }

      const jdDim = jdComponent.embedding.length;

      // Calculate similarity scores with all CV components
      const scoredComponents = await Promise.all(
        cvComponents
          .filter(c => !!c)
          .map(async (cvComponent) => {
            try {
              // Prefer existing embedding if present and same dimension
              let cvEmbedding = Array.isArray(cvComponent.embedding)
                ? (cvComponent.embedding as unknown as number[])
                : null;

              if (!cvEmbedding || cvEmbedding.length !== jdDim) {
                // Re-embed on the fly to ensure same dimension as JD (Gemini 768)
                cvEmbedding = await EmbeddingService.embedComponentObject(cvComponent);
              }

              const score = EmbeddingService.cosineSimilarity(
                jdComponent.embedding!,
                cvEmbedding
              );

              return { component: cvComponent, score };
            } catch (e: any) {
              // Skip components that fail embedding/similarity
              return { component: cvComponent, score: -1 };
            }
          })
      )
        .sort((a, b) => b.score - a.score);

      // Get best match
      const bestMatch = scoredComponents[0];

      if (!bestMatch || bestMatch.score === -1 || bestMatch.score < 0.3) {
        // No good match found
        return {
          jdComponent,
          cvComponent: null,
          score: 0,
          reasoning: 'No matching component found in your CV. Consider adding relevant experience or skills.',
          matchQuality: 'none',
        };
      }

      // Convert cosine similarity (0-1) to percentage (0-100)
      const scorePercentage = Math.round(bestMatch.score * 100);

      // Generate reasoning using LLM
      const reasoning = await this.generateMatchReasoning(
        jdComponent,
        bestMatch.component,
        scorePercentage
      );

      return {
        jdComponent,
        cvComponent: bestMatch.component,
        score: scorePercentage,
        reasoning,
        matchQuality: getMatchQuality(scorePercentage),
      };
    } catch (error: any) {
      console.error('❌ Error matching component:', error.message);
      return {
        jdComponent,
        cvComponent: null,
        score: 0,
        reasoning: `Error: ${error.message}`,
        matchQuality: 'none',
      };
    }
  }

  /**
   * Generate reasoning for a match using LLM
   */
  static async generateMatchReasoning(
    jdComponent: JDComponent,
    cvComponent: Component,
    score: number
  ): Promise<string> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `You are a CV matching expert. Explain why this CV component matches (or doesn't match) the job requirement.

Job Requirement:
Type: ${jdComponent.type}
Title: ${jdComponent.title}
Description: ${jdComponent.description}
Required: ${jdComponent.required ? 'Yes' : 'No'}
${jdComponent.level ? `Level: ${jdComponent.level}` : ''}

CV Component:
Type: ${cvComponent.type}
Title: ${cvComponent.title}
Organization: ${cvComponent.organization || 'N/A'}
Description: ${cvComponent.description || 'N/A'}
Highlights: ${cvComponent.highlights.join(', ')}

Match Score: ${score}%

Provide a concise explanation (1-2 sentences) of why this is a ${score >= 80 ? 'strong' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'weak'} match. Focus on specific skills, experiences, or qualifications that align (or don't align).`;

      const result = await model.generateContent(prompt);
      const reasoning = result.response.text().trim();

      return reasoning;
    } catch (error: any) {
      console.error('❌ Error generating reasoning:', error.message);
      return `Strong semantic similarity (${score}%) between job requirement and your experience.`;
    }
  }

  /**
   * Match all JD components with user's CV components
   */
  static async matchAllComponents(
    jdComponents: JDComponent[],
    userId: string
  ): Promise<MatchResult[]> {
    try {
      console.log('🔍 Matching JD components with CV components...');

      // Get all user's CV components
      const { components: cvComponents } = await SupabaseService.getUserComponents(userId);

      if (cvComponents.length === 0) {
        console.warn('⚠️ User has no CV components');
        return jdComponents.map(jdComponent => ({
          jdComponent,
          cvComponent: null,
          score: 0,
          reasoning: 'No CV components found. Please add your experiences, skills, and education.',
          matchQuality: 'none' as const,
        }));
      }

      // Match each JD component
      const matches: MatchResult[] = [];
      for (const jdComponent of jdComponents) {
        const match = await this.matchSingleComponent(jdComponent, cvComponents);
        matches.push(match);
        console.log(`  ✓ Matched: ${jdComponent.title} → ${match.score}%`);
      }

      console.log(`✅ Matched ${matches.length} components`);
      return matches;
    } catch (error: any) {
      console.error('❌ Error matching components:', error.message);
      throw error;
    }
  }

  /**
   * Calculate overall match score and category breakdown
   */
  static calculateOverallScore(matches: MatchResult[]): {
    overallScore: number;
    categoryScores: JDMatchingResults['categoryScores'];
    missingComponents: JDComponent[];
    suggestions: string[];
  } {
    // Filter valid matches
    const validMatches = matches.filter(m => m.cvComponent !== null && m.score > 0);
    const missingComponents = matches.filter(m => m.cvComponent === null).map(m => m.jdComponent);

    if (validMatches.length === 0) {
      return {
        overallScore: 0,
        categoryScores: { experience: 0, education: 0, skills: 0, projects: 0 },
        missingComponents,
        suggestions: [
          'Add relevant work experiences',
          'Add technical skills',
          'Add educational background',
          'Add projects or achievements',
        ],
      };
    }

    // Calculate overall score (weighted average)
    const requiredMatches = validMatches.filter(m => m.jdComponent.required);
    const optionalMatches = validMatches.filter(m => !m.jdComponent.required);

    const requiredScore = requiredMatches.length > 0
      ? requiredMatches.reduce((sum, m) => sum + m.score, 0) / requiredMatches.length
      : 0;

    const optionalScore = optionalMatches.length > 0
      ? optionalMatches.reduce((sum, m) => sum + m.score, 0) / optionalMatches.length
      : 0;

    // Weight: 70% required, 30% optional
    const overallScore = Math.round(requiredScore * 0.7 + optionalScore * 0.3);

    // Calculate category scores
    const categoryScores = {
      experience: this.calculateCategoryScore(validMatches, ['experience']),
      education: this.calculateCategoryScore(validMatches, ['education']),
      skills: this.calculateCategoryScore(validMatches, ['skill']),
      projects: this.calculateCategoryScore(validMatches, ['project']),
    };

    // Generate suggestions
    const suggestions: string[] = [];
    if (categoryScores.experience < 60) {
      suggestions.push('Add more relevant work experiences that match the job requirements');
    }
    if (categoryScores.skills < 60) {
      suggestions.push('Highlight more technical skills mentioned in the job description');
    }
    if (categoryScores.education < 60 && matches.some(m => m.jdComponent.type === 'qualification')) {
      suggestions.push('Ensure your educational qualifications are clearly stated');
    }
    if (missingComponents.length > 0) {
      suggestions.push(`${missingComponents.length} requirements have no matching components in your CV`);
    }

    return {
      overallScore,
      categoryScores,
      missingComponents,
      suggestions,
    };
  }

  /**
   * Calculate score for a specific category
   */
  private static calculateCategoryScore(
    matches: MatchResult[],
    cvComponentTypes: Component['type'][]
  ): number {
    const categoryMatches = matches.filter(m =>
      m.cvComponent && cvComponentTypes.includes(m.cvComponent.type)
    );

    if (categoryMatches.length === 0) return 0;

    const avgScore = categoryMatches.reduce((sum, m) => sum + m.score, 0) / categoryMatches.length;
    return Math.round(avgScore);
  }

  /**
   * Complete JD matching workflow
   */
  static async matchJobDescription(
    pdfBuffer: Buffer,
    userId: string
  ): Promise<JDMatchingResults> {
    try {
      console.log('🚀 Starting JD matching workflow...');

      // Step 1: Extract JD components (no DB save)
      const { jdMetadata, components: jdComponents } = await this.extractJDComponents(pdfBuffer);

      // Step 2: Match with user's CV components
      const matches = await this.matchAllComponents(jdComponents, userId);

      // Step 3: Calculate scores and suggestions
      const { overallScore, categoryScores, missingComponents, suggestions } =
        this.calculateOverallScore(matches);

      const results: JDMatchingResults = {
        jdMetadata,
        jdComponents,
        matches,
        overallScore,
        categoryScores,
        suggestions,
        missingComponents,
      };

      console.log(`✅ Matching complete! Overall score: ${overallScore}%`);
      return results;
    } catch (error: any) {
      console.error('❌ Error in JD matching workflow:', error.message);
      throw error;
    }
  }
}
