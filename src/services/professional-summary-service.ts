import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMUtilsService } from './llm-utils-service';
import type { Component } from '@/lib/supabase';
import type { JDMatchingResults, MatchResult } from '@/lib/types/jd-matching';
import type { SeniorityLevel } from './seniority-analysis-service';

/**
 * Professional Summary Generator Service
 * Creates HR-optimized professional summaries based on matched components
 *
 * HR Best Practices:
 * 1. Start with current role + years of experience
 * 2. Highlight top 3-5 core competencies
 * 3. Include 1-2 quantified achievements
 * 4. End with career objective aligned with target role
 */
export class ProfessionalSummaryService {
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
   * Generate professional summary from matched components
   *
   * @param matches - Matched components from JD matching
   * @param jdMetadata - Job description metadata
   * @param seniorityLevel - Optional seniority level from analysis
   * @returns HR-optimized professional summary (2-3 sentences, 50-120 words)
   */
  static async generateFromMatches(
    matches: MatchResult[],
    jdMetadata: JDMatchingResults['jdMetadata'],
    seniorityLevel?: SeniorityLevel
  ): Promise<string> {
    try {
      console.log('📝 Generating professional summary...');

      // Get top matched components (score >= 60)
      const topExperiences = matches
        .filter(m => m.cvComponent?.type === 'experience' && m.score >= 60)
        .slice(0, 3)
        .map(m => m.cvComponent!);

      const topSkills = matches
        .filter(m => m.cvComponent?.type === 'skill' && m.score >= 60)
        .slice(0, 8)
        .map(m => m.cvComponent!);

      const topProjects = matches
        .filter(m => m.cvComponent?.type === 'project' && m.score >= 60)
        .slice(0, 2)
        .map(m => m.cvComponent!);

      // Calculate total years of experience
      const totalYears = this.calculateTotalYears(topExperiences);

      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `You are a professional CV writer specializing in creating compelling professional summaries that pass ATS systems and impress HR managers.

TARGET JOB:
Title: ${jdMetadata.title}
Company: ${jdMetadata.company}
${jdMetadata.seniorityLevel ? `Required Level: ${jdMetadata.seniorityLevel}` : ''}
${jdMetadata.location ? `Location: ${jdMetadata.location}` : ''}

CANDIDATE'S TOP MATCHED EXPERIENCE (${topExperiences.length} roles, ${totalYears} total years):
${topExperiences.map((exp, i) => `${i + 1}. ${exp.title} at ${exp.organization || 'Company'}
   Duration: ${exp.start_date || 'Date'} - ${exp.end_date || 'Present'}
   Key highlights: ${exp.highlights.slice(0, 3).join('; ')}`).join('\n\n')}

CANDIDATE'S TOP SKILLS (${topSkills.length} skills matched):
${topSkills.map(s => `- ${s.title}${s.description ? ': ' + s.description : ''}`).join('\n')}

${topProjects.length > 0 ? `NOTABLE PROJECTS:
${topProjects.map(p => `- ${p.title}: ${p.description || ''}`).join('\n')}` : ''}

CANDIDATE SENIORITY: ${seniorityLevel || 'Not specified'}

TASK:
Write a professional summary (2-3 sentences, 50-120 words) following this structure:

**Line 1: Opening Statement**
- Format: "[Job Title/Role] with [X]+ years of experience in [domain/industry]"
- Example: "Senior Software Engineer with 8+ years of experience in full-stack web development"
- Use the most recent/relevant role from experience
- Include total years (${totalYears} years available)

**Line 2: Core Competencies + Achievement**
- Format: "Specialized in [top 3-5 skills]. [Quantified achievement if available]."
- Example: "Specialized in React, Node.js, AWS, and Kubernetes. Led teams that delivered 15+ production applications serving 2M+ users."
- Focus on skills that match the JD
- Include metrics from highlights if available (X%, Y users, Z projects)

**Line 3: Career Objective**
- Format: "Seeking to leverage [expertise] to [company goal/role objective]."
- Example: "Seeking to leverage full-stack expertise and leadership experience to drive innovation at ${jdMetadata.company}."
- Align with target company and role

HR BEST PRACTICES TO FOLLOW:
✅ Use action verbs (Led, Architected, Drove, Designed, Built)
✅ Include metrics when possible (X years, Y% improvement, Z users, N projects)
✅ Match terminology from job title and description
✅ Sound confident but professional (avoid "rockstar", "ninja", "guru")
✅ Be specific about technologies and domains
✅ Keep it concise and impactful

AVOID:
❌ Vague buzzwords without substance ("synergy", "think outside the box")
❌ Generic statements ("hard worker", "team player")
❌ Overly humble language ("seeking to learn", "trying to")
❌ Redundancy or filler words
❌ Personal pronouns (I, me, my)

Return ONLY the professional summary text (no JSON, no markdown, no explanations - just plain text).`;

      const summary = await LLMUtilsService.callWithRetry<string>(model, prompt, {
        maxRetries: 3,
        parseJSON: false,
        validator: (text: string) => {
          // Validate length (30-150 words)
          const wordCount = text.trim().split(/\s+/).length;
          if (wordCount < 20) {
            console.warn(`Summary too short: ${wordCount} words`);
            return false;
          }
          if (wordCount > 200) {
            console.warn(`Summary too long: ${wordCount} words`);
            return false;
          }
          // Basic quality check - should have some professional content
          if (text.length < 50) {
            console.warn('Summary too brief');
            return false;
          }
          return true;
        },
        validatorErrorMessage: 'Summary must be 20-200 words with professional content',
      });

      const wordCount = summary.trim().split(/\s+/).length;
      console.log(`✅ Professional summary generated (${wordCount} words)`);

      return summary.trim();
    } catch (error: any) {
      console.error('❌ Error generating summary:', error.message);

      // Fallback: Template-based summary
      return this.generateFallbackSummary(matches, jdMetadata, seniorityLevel);
    }
  }

  /**
   * Generate professional summary from raw components (no matching context)
   */
  static async generateFromComponents(
    experiences: Component[],
    skills: Component[],
    targetRole: string,
    targetCompany?: string
  ): Promise<string> {
    try {
      console.log('📝 Generating summary from components...');

      // Calculate total years of experience
      const totalYears = this.calculateTotalYears(experiences);

      // Get current/most recent role
      const currentRole = experiences.sort((a, b) => {
        const aDate = new Date(a.end_date || new Date());
        const bDate = new Date(b.end_date || new Date());
        return bDate.getTime() - aDate.getTime();
      })[0];

      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `Write a professional summary (2-3 sentences, 50-120 words) for a CV:

Current Role: ${currentRole?.title || 'Professional'}
Total Experience: ${totalYears} years
Top Skills: ${skills.slice(0, 8).map(s => s.title).join(', ')}
Target Role: ${targetRole}
${targetCompany ? `Target Company: ${targetCompany}` : ''}

Follow HR best practices:
1. Start with role + years
2. List top competencies
3. Include objective aligned with target role

Return only the text.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error: any) {
      console.error('❌ Error generating summary:', error.message);

      // Fallback
      const totalYears = this.calculateTotalYears(experiences);
      const role = experiences[0]?.title || 'Professional';
      const skillList = skills.slice(0, 5).map(s => s.title).join(', ');

      return `${role} with ${totalYears}+ years of experience. Proficient in ${skillList}. Seeking to contribute expertise to ${targetCompany || 'a dynamic organization'} as ${targetRole}.`;
    }
  }

  /**
   * Generate fallback summary using templates
   */
  private static generateFallbackSummary(
    matches: MatchResult[],
    jdMetadata: JDMatchingResults['jdMetadata'],
    seniorityLevel?: SeniorityLevel
  ): string {
    const experiences = matches
      .filter(m => m.cvComponent?.type === 'experience' && m.score >= 60)
      .map(m => m.cvComponent!);

    const skills = matches
      .filter(m => m.cvComponent?.type === 'skill' && m.score >= 60)
      .map(m => m.cvComponent!);

    const totalYears = this.calculateTotalYears(experiences);
    const currentRole = experiences[0]?.title || 'Professional';
    const topSkills = skills.slice(0, 5).map(s => s.title).join(', ');

    return `${currentRole} with ${totalYears}+ years of experience specializing in ${topSkills}. ` +
           `Proven track record of delivering high-quality solutions. ` +
           `Seeking to leverage expertise to contribute to ${jdMetadata.company} as ${jdMetadata.title}.`;
  }

  /**
   * Calculate total years from experiences
   */
  private static calculateTotalYears(experiences: Component[]): number {
    if (experiences.length === 0) return 0;

    let totalMonths = 0;

    for (const exp of experiences) {
      if (!exp.start_date) continue;

      const start = new Date(exp.start_date);
      const end = exp.end_date ? new Date(exp.end_date) : new Date();

      const months = (end.getFullYear() - start.getFullYear()) * 12 +
                     (end.getMonth() - start.getMonth());

      totalMonths += Math.max(0, months);
    }

    const years = Math.round(totalMonths / 12);
    return years > 0 ? years : 1; // Minimum 1 year
  }

  /**
   * Validate summary quality
   */
  static validateSummary(summary: string): {
    isValid: boolean;
    wordCount: number;
    hasYearsExperience: boolean;
    hasSkills: boolean;
    hasObjective: boolean;
    issues: string[];
  } {
    const wordCount = summary.trim().split(/\s+/).length;
    const hasYearsExperience = /\d+\+?\s*years?/i.test(summary);
    const hasSkills = /\b(specializ|proficient|expert|experience in)\b/i.test(summary);
    const hasObjective = /\b(seeking|looking|aim|goal|contribute)\b/i.test(summary);

    const issues: string[] = [];

    if (wordCount < 30) issues.push('Too short (< 30 words)');
    if (wordCount > 150) issues.push('Too long (> 150 words)');
    if (!hasYearsExperience) issues.push('Missing years of experience');
    if (!hasSkills) issues.push('Missing skills/competencies');
    if (!hasObjective) issues.push('Missing career objective');

    return {
      isValid: issues.length === 0,
      wordCount,
      hasYearsExperience,
      hasSkills,
      hasObjective,
      issues,
    };
  }
}
