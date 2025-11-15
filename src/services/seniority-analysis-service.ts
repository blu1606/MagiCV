import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseService } from './supabase-service';
import { LLMUtilsService } from './llm-utils-service';
import type { Component } from '@/lib/supabase';

/**
 * Seniority levels
 */
export type SeniorityLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal';

/**
 * Seniority Analysis Result
 */
export interface SeniorityAnalysis {
  level: SeniorityLevel;
  confidence: number; // 0-100
  reasoning: string;
  metrics: {
    totalYears: number;
    leadershipCount: number;
    projectComplexity: number; // 0-100
    skillDiversity: number; // 0-100
    educationLevel: number; // 0-5 (0=none, 1=some college, 2=bachelor, 3=master, 4=phd, 5=postdoc)
  };
  recommendations: string[];
}

/**
 * Seniority Match Result
 */
export interface SeniorityMatch {
  isMatch: boolean;
  userLevel: SeniorityLevel;
  jdLevel: SeniorityLevel;
  gap: number; // -3 to +3, negative = user too junior, positive = user too senior
  advice: string;
  canApply: boolean; // true if within 1 level difference
}

/**
 * Seniority Analysis Service
 * Analyzes CV components to determine seniority level and match with JD requirements
 */
export class SeniorityAnalysisService {
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
   * Seniority level order for comparison
   */
  private static readonly LEVEL_ORDER: SeniorityLevel[] = [
    'intern',
    'junior',
    'mid',
    'senior',
    'lead',
    'principal',
  ];

  /**
   * Get numeric value for seniority level (0-5)
   */
  private static getLevelValue(level: SeniorityLevel): number {
    return this.LEVEL_ORDER.indexOf(level);
  }

  /**
   * Calculate total years of experience from components
   */
  private static calculateTotalYears(experiences: Component[]): number {
    let totalMonths = 0;

    for (const exp of experiences) {
      if (!exp.start_date) continue;

      const startDate = new Date(exp.start_date);
      const endDate = exp.end_date ? new Date(exp.end_date) : new Date();

      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());

      totalMonths += Math.max(0, months);
    }

    return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal
  }

  /**
   * Count leadership experiences
   */
  private static countLeadership(experiences: Component[]): number {
    const leadershipKeywords = [
      'lead', 'manager', 'director', 'head', 'chief', 'vp', 'cto', 'ceo',
      'architect', 'principal', 'staff', 'senior', 'mentor', 'team lead',
    ];

    return experiences.filter(exp => {
      const title = exp.title.toLowerCase();
      const description = (exp.description || '').toLowerCase();
      const highlights = exp.highlights.join(' ').toLowerCase();

      return leadershipKeywords.some(keyword =>
        title.includes(keyword) ||
        description.includes(keyword) ||
        highlights.includes(keyword)
      );
    }).length;
  }

  /**
   * Calculate project complexity score (0-100)
   */
  private static calculateProjectComplexity(
    experiences: Component[],
    projects: Component[]
  ): number {
    const allItems = [...experiences, ...projects];
    let complexityScore = 0;
    let count = 0;

    const complexityIndicators = [
      { keywords: ['scale', 'million', 'billion', 'thousands', 'global'], weight: 20 },
      { keywords: ['architecture', 'design', 'infrastructure', 'platform'], weight: 15 },
      { keywords: ['team', 'collaborate', 'cross-functional', 'stakeholder'], weight: 10 },
      { keywords: ['aws', 'kubernetes', 'microservice', 'distributed'], weight: 15 },
      { keywords: ['improve', 'optimize', 'increase', 'reduce', 'enhance'], weight: 10 },
      { keywords: ['launch', 'ship', 'deploy', 'release', 'production'], weight: 10 },
    ];

    for (const item of allItems) {
      const text = `${item.title} ${item.description} ${item.highlights.join(' ')}`.toLowerCase();
      let itemScore = 0;

      for (const indicator of complexityIndicators) {
        if (indicator.keywords.some(kw => text.includes(kw))) {
          itemScore += indicator.weight;
        }
      }

      complexityScore += Math.min(itemScore, 80); // Cap per item at 80
      count++;
    }

    return count > 0 ? Math.min(Math.round(complexityScore / count), 100) : 0;
  }

  /**
   * Calculate skill diversity (0-100)
   */
  private static calculateSkillDiversity(skills: Component[]): number {
    // More unique skill categories = higher diversity
    const categories = new Set<string>();

    const categoryKeywords = {
      frontend: ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'ui', 'ux'],
      backend: ['node', 'python', 'java', 'go', 'rust', 'api', 'database', 'sql'],
      cloud: ['aws', 'azure', 'gcp', 'kubernetes', 'docker', 'terraform'],
      data: ['sql', 'nosql', 'mongodb', 'postgres', 'redis', 'elasticsearch'],
      ai: ['machine learning', 'ai', 'tensorflow', 'pytorch', 'nlp', 'computer vision'],
      mobile: ['ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
      devops: ['ci/cd', 'jenkins', 'github actions', 'monitoring', 'logging'],
      security: ['security', 'authentication', 'oauth', 'encryption', 'penetration'],
    };

    for (const skill of skills) {
      const text = `${skill.title} ${skill.description}`.toLowerCase();

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
          categories.add(category);
        }
      }
    }

    // Score based on number of categories (max 8)
    return Math.min(Math.round((categories.size / 8) * 100), 100);
  }

  /**
   * Estimate education level from education components
   */
  private static estimateEducationLevel(education: Component[]): number {
    if (education.length === 0) return 0;

    const degrees = education.map(edu => edu.title.toLowerCase());
    const text = degrees.join(' ');

    if (text.includes('phd') || text.includes('doctorate')) return 4;
    if (text.includes('master') || text.includes('mba')) return 3;
    if (text.includes('bachelor') || text.includes('bs') || text.includes('ba')) return 2;
    if (text.includes('associate')) return 1;

    return 0.5; // Some education but unclear level
  }

  /**
   * Analyze user's CV components and determine seniority level
   */
  static async analyzeSeniorityLevel(userId: string): Promise<SeniorityAnalysis> {
    try {
      console.log('🔍 Analyzing seniority level for user:', userId);

      // Get all user components
      const { components } = await SupabaseService.getUserComponents(userId);

      if (components.length === 0) {
        return {
          level: 'intern',
          confidence: 100,
          reasoning: 'No CV components found. Defaulting to intern level.',
          metrics: {
            totalYears: 0,
            leadershipCount: 0,
            projectComplexity: 0,
            skillDiversity: 0,
            educationLevel: 0,
          },
          recommendations: [
            'Add your work experiences to get accurate seniority assessment',
            'Include your education background',
            'Add technical skills and projects',
          ],
        };
      }

      // Group components by type
      const experiences = components.filter(c => c.type === 'experience');
      const projects = components.filter(c => c.type === 'project');
      const skills = components.filter(c => c.type === 'skill');
      const education = components.filter(c => c.type === 'education');

      // Calculate metrics
      const metrics = {
        totalYears: this.calculateTotalYears(experiences),
        leadershipCount: this.countLeadership(experiences),
        projectComplexity: this.calculateProjectComplexity(experiences, projects),
        skillDiversity: this.calculateSkillDiversity(skills),
        educationLevel: this.estimateEducationLevel(education),
      };

      console.log('📊 Calculated metrics:', metrics);

      // Use LLM to analyze and classify seniority
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `You are a senior technical recruiter. Analyze this candidate's profile and determine their seniority level.

**Metrics:**
- Total Years of Experience: ${metrics.totalYears}
- Leadership Experiences: ${metrics.leadershipCount}
- Project Complexity Score: ${metrics.projectComplexity}/100
- Skill Diversity Score: ${metrics.skillDiversity}/100
- Education Level: ${metrics.educationLevel} (0=none, 2=bachelor, 3=master, 4=phd)

**Experiences (${experiences.length}):**
${experiences.slice(0, 5).map(exp => `- ${exp.title} at ${exp.organization || 'N/A'} (${exp.start_date || 'N/A'} - ${exp.end_date || 'Current'})\n  ${exp.description || 'No description'}\n  Highlights: ${exp.highlights.slice(0, 3).join(', ')}`).join('\n\n')}

**Skills (${skills.length}):**
${skills.slice(0, 10).map(s => `- ${s.title}: ${s.description || 'N/A'}`).join('\n')}

**Education (${education.length}):**
${education.map(e => `- ${e.title} at ${e.organization || 'N/A'}`).join('\n')}

**Seniority Level Guidelines:**
- **Intern/Entry** (0-1 years): Limited experience, still learning fundamentals
- **Junior** (1-3 years): Can work independently on well-defined tasks, needs guidance on complex problems
- **Mid-Level** (3-5 years): Works independently, handles complexity, mentors juniors occasionally
- **Senior** (5-8 years): Expert in domain, leads projects, mentors team, makes architectural decisions
- **Lead/Staff** (8-12 years): Leads multiple projects, influences org strategy, develops other seniors
- **Principal** (12+ years): Sets technical direction, industry expert, influences entire organization

Determine the appropriate seniority level and provide:
1. **level**: One of: intern, junior, mid, senior, lead, principal
2. **confidence**: 0-100 (how confident are you in this assessment?)
3. **reasoning**: 2-3 sentences explaining why this level fits
4. **recommendations**: 3-5 specific actionable items to reach the next level

Return ONLY valid JSON (no markdown):
{
  "level": "...",
  "confidence": 85,
  "reasoning": "...",
  "recommendations": ["...", "..."]
}`;

      // Use LLM utils for robust parsing with retry
      const analysis = await LLMUtilsService.callWithRetry(model, prompt, {
        maxRetries: 3,
        parseJSON: true,
        validator: (data: any) => {
          // Validate required fields
          if (!data.level || !data.confidence || !data.reasoning || !data.recommendations) {
            console.error('Missing required fields in seniority analysis response');
            return false;
          }
          // Validate level is valid
          const validLevels = ['intern', 'junior', 'mid', 'senior', 'lead', 'principal'];
          if (!validLevels.includes(data.level)) {
            console.error(`Invalid seniority level: ${data.level}`);
            return false;
          }
          return true;
        },
        validatorErrorMessage: 'Response must include level, confidence, reasoning, and recommendations',
      });

      console.log(`✅ Seniority analysis complete: ${analysis.level} (${analysis.confidence}% confidence)`);

      return {
        level: analysis.level,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        metrics,
        recommendations: analysis.recommendations,
      };
    } catch (error: any) {
      console.error('❌ Error analyzing seniority:', error.message);

      // Fallback to rule-based classification
      const { components } = await SupabaseService.getUserComponents(userId);
      const experiences = components.filter(c => c.type === 'experience');
      const totalYears = this.calculateTotalYears(experiences);

      let level: SeniorityLevel;
      if (totalYears < 1) level = 'intern';
      else if (totalYears < 3) level = 'junior';
      else if (totalYears < 5) level = 'mid';
      else if (totalYears < 8) level = 'senior';
      else if (totalYears < 12) level = 'lead';
      else level = 'principal';

      return {
        level,
        confidence: 60,
        reasoning: `Estimated based on ${totalYears} years of experience (LLM analysis failed).`,
        metrics: {
          totalYears,
          leadershipCount: 0,
          projectComplexity: 0,
          skillDiversity: 0,
          educationLevel: 0,
        },
        recommendations: ['Update your profile with more details'],
      };
    }
  }

  /**
   * Validate if user's seniority matches JD requirement
   */
  static async validateSeniorityMatch(
    userId: string,
    jdSeniorityLevel: SeniorityLevel
  ): Promise<SeniorityMatch> {
    try {
      const userAnalysis = await this.analyzeSeniorityLevel(userId);
      const userValue = this.getLevelValue(userAnalysis.level);
      const jdValue = this.getLevelValue(jdSeniorityLevel);
      const gap = userValue - jdValue;

      // Consider match if within 1 level
      const isMatch = Math.abs(gap) <= 1;
      const canApply = Math.abs(gap) <= 1;

      let advice: string;
      if (gap === 0) {
        advice = `Perfect match! Your ${userAnalysis.level} level aligns exactly with the job requirement.`;
      } else if (gap === 1) {
        advice = `Good fit! You're one level above (${userAnalysis.level} vs ${jdSeniorityLevel}). You may be overqualified but could bring valuable experience.`;
      } else if (gap === -1) {
        advice = `Stretch opportunity! You're one level below (${userAnalysis.level} vs ${jdSeniorityLevel}). Consider applying if you're ready for growth.`;
      } else if (gap > 1) {
        advice = `You're significantly overqualified (${userAnalysis.level} vs ${jdSeniorityLevel}, +${gap} levels). This role might not challenge you enough.`;
      } else {
        advice = `You're below the required level (${userAnalysis.level} vs ${jdSeniorityLevel}, ${gap} levels). Focus on gaining ${Math.abs(gap)} more years of experience or similar roles first.`;
      }

      return {
        isMatch,
        userLevel: userAnalysis.level,
        jdLevel: jdSeniorityLevel,
        gap,
        advice,
        canApply,
      };
    } catch (error: any) {
      console.error('❌ Error validating seniority match:', error.message);
      throw error;
    }
  }

  /**
   * Parse seniority level from text (JD description)
   */
  static parseSeniorityFromText(text: string): SeniorityLevel | null {
    const lower = text.toLowerCase();

    // Principal/Staff
    if (lower.includes('principal') || lower.includes('distinguished') || lower.includes('fellow')) {
      return 'principal';
    }

    // Lead/Staff
    if (lower.includes('lead') || lower.includes('staff engineer') || lower.includes('tech lead')) {
      return 'lead';
    }

    // Senior
    if (lower.includes('senior') || lower.includes('sr.') || lower.includes('sr ')) {
      return 'senior';
    }

    // Mid
    if (lower.includes('mid-level') || lower.includes('intermediate') || lower.includes('3-5 years')) {
      return 'mid';
    }

    // Junior
    if (lower.includes('junior') || lower.includes('jr.') || lower.includes('jr ') || lower.includes('entry')) {
      return 'junior';
    }

    // Intern
    if (lower.includes('intern') || lower.includes('trainee') || lower.includes('graduate')) {
      return 'intern';
    }

    // Parse from years of experience
    const yearsMatch = lower.match(/(\d+)[\s-]*(\d+)?\s*(?:years?|yrs?)/);
    if (yearsMatch) {
      const minYears = parseInt(yearsMatch[1]);
      if (minYears < 1) return 'intern';
      if (minYears < 3) return 'junior';
      if (minYears < 5) return 'mid';
      if (minYears < 8) return 'senior';
      if (minYears < 12) return 'lead';
      return 'principal';
    }

    return null; // Cannot determine
  }
}
