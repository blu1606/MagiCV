import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMUtilsService } from './llm-utils-service';
import { ProfessionalSummaryService } from './professional-summary-service';
import type { Component } from '@/lib/supabase';
import type { MatchResult, JDMatchingResults } from '@/lib/types/jd-matching';

/**
 * Focus areas for CV variants
 */
export type FocusArea =
  | 'technical'      // Emphasizes technical skills, tools, technologies
  | 'leadership'     // Emphasizes team leadership, management, mentoring
  | 'impact'         // Emphasizes business impact, metrics, achievements
  | 'innovation'     // Emphasizes innovation, new solutions, R&D
  | 'balanced';      // Balanced approach across all areas

/**
 * CV Variant with metadata
 */
export interface CVVariant {
  id: string;
  focusArea: FocusArea;
  title: string;
  description: string;
  score: number;
  professionalSummary: string;
  selectedComponents: {
    experience: Component[];
    education: Component[];
    skills: Component[];
    projects: Component[];
  };
  reasoning: string;
  strengthAreas: string[];
  weaknessAreas: string[];
}

/**
 * Focus area analysis result
 */
export interface FocusAreaAnalysis {
  suggestedFocusAreas: FocusArea[];
  jdCharacteristics: {
    isTechnical: boolean;
    requiresLeadership: boolean;
    emphasizesImpact: boolean;
    requiresInnovation: boolean;
    confidence: number;
  };
  componentDistribution: {
    technical: number;
    leadership: number;
    impact: number;
    innovation: number;
  };
}

/**
 * CV Variant Generator Service
 *
 * Generates multiple CV variants with different focus areas
 * to help users optimize their CV for specific job requirements.
 *
 * Strategy:
 * 1. Analyze JD to identify what it emphasizes (technical, leadership, impact, innovation)
 * 2. Analyze candidate's components to see what they're strong in
 * 3. Generate 3-5 variants with different focus areas
 * 4. Score each variant based on JD alignment
 * 5. Provide comparison and recommendation
 */
export class CVVariantGeneratorService {
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
   * Analyze JD and matched components to determine optimal focus areas
   */
  static async analyzeFocusAreas(
    matches: MatchResult[],
    jdMetadata: JDMatchingResults['jdMetadata'],
    jdComponents: Component[]
  ): Promise<FocusAreaAnalysis> {
    try {
      console.log('🔍 Analyzing focus areas...');

      // Analyze JD characteristics using LLM
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const jdText = `${jdMetadata.title} at ${jdMetadata.company}\n\n${jdMetadata.description}\n\nKey Requirements:\n${jdComponents.map(c => `- ${c.title}: ${c.description}`).join('\n')}`;

      const prompt = `You are an expert recruiter analyzing job descriptions. Analyze this JD and determine what it emphasizes:

JOB DESCRIPTION:
${jdText}

TASK:
Determine which areas this job emphasizes most. Consider:
1. **Technical**: Programming languages, tools, frameworks, technical depth
2. **Leadership**: Team management, mentoring, decision-making, stakeholder management
3. **Impact**: Business metrics, revenue, user growth, measurable outcomes
4. **Innovation**: R&D, new solutions, cutting-edge tech, patents, research

Return a JSON object:
{
  "isTechnical": boolean,     // Does it emphasize technical skills?
  "requiresLeadership": boolean,  // Does it require leadership experience?
  "emphasizesImpact": boolean,    // Does it emphasize business impact/metrics?
  "requiresInnovation": boolean,  // Does it emphasize innovation/R&D?
  "confidence": number,           // 0-1, how clear are these signals?
  "primaryFocus": "technical" | "leadership" | "impact" | "innovation",
  "reasoning": "Brief explanation"
}

Return ONLY valid JSON.`;

      const jdCharacteristics = await LLMUtilsService.callWithRetry<any>(model, prompt, {
        maxRetries: 2,
        parseJSON: true,
        validator: (data: any) => {
          return typeof data.isTechnical === 'boolean' &&
                 typeof data.requiresLeadership === 'boolean' &&
                 typeof data.emphasizesImpact === 'boolean' &&
                 typeof data.requiresInnovation === 'boolean' &&
                 typeof data.confidence === 'number';
        },
      });

      console.log(`✓ JD Analysis: Primary focus = ${jdCharacteristics.primaryFocus}`);

      // Analyze candidate's component distribution
      const componentDistribution = this.analyzeComponentDistribution(matches);

      // Determine suggested focus areas
      const suggestedFocusAreas = this.determineSuggestedFocusAreas(
        jdCharacteristics,
        componentDistribution
      );

      console.log(`✓ Suggested focus areas: ${suggestedFocusAreas.join(', ')}`);

      return {
        suggestedFocusAreas,
        jdCharacteristics,
        componentDistribution,
      };
    } catch (error: any) {
      console.error('❌ Focus area analysis failed:', error.message);
      // Fallback: suggest all areas
      return {
        suggestedFocusAreas: ['balanced', 'technical', 'leadership', 'impact'],
        jdCharacteristics: {
          isTechnical: true,
          requiresLeadership: false,
          emphasizesImpact: false,
          requiresInnovation: false,
          confidence: 0.5,
        },
        componentDistribution: {
          technical: 0,
          leadership: 0,
          impact: 0,
          innovation: 0,
        },
      };
    }
  }

  /**
   * Analyze distribution of candidate's components across focus areas
   */
  private static analyzeComponentDistribution(matches: MatchResult[]): {
    technical: number;
    leadership: number;
    impact: number;
    innovation: number;
  } {
    const distribution = {
      technical: 0,
      leadership: 0,
      impact: 0,
      innovation: 0,
    };

    // Keywords for each category
    const technicalKeywords = ['react', 'node', 'python', 'java', 'aws', 'kubernetes', 'docker', 'sql', 'api', 'framework', 'library', 'code', 'develop', 'implement', 'build', 'engineer'];
    const leadershipKeywords = ['lead', 'manage', 'mentor', 'team', 'director', 'head', 'vp', 'senior', 'principal', 'architect', 'coordinate', 'oversee', 'hire', 'train'];
    const impactKeywords = ['revenue', 'million', 'billion', 'users', 'growth', '%', 'increased', 'reduced', 'saved', 'roi', 'kpi', 'metric', 'business', 'customer'];
    const innovationKeywords = ['innovate', 'patent', 'research', 'r&d', 'new', 'first', 'pioneer', 'invent', 'cutting-edge', 'novel', 'breakthrough', 'prototype'];

    for (const match of matches) {
      if (!match.cvComponent) continue;

      const text = `${match.cvComponent.title} ${match.cvComponent.description} ${match.cvComponent.highlights.join(' ')}`.toLowerCase();

      // Count keyword matches weighted by match score
      const weight = match.score / 100;

      technicalKeywords.forEach(kw => {
        if (text.includes(kw)) distribution.technical += weight;
      });

      leadershipKeywords.forEach(kw => {
        if (text.includes(kw)) distribution.leadership += weight;
      });

      impactKeywords.forEach(kw => {
        if (text.includes(kw)) distribution.impact += weight;
      });

      innovationKeywords.forEach(kw => {
        if (text.includes(kw)) distribution.innovation += weight;
      });
    }

    return distribution;
  }

  /**
   * Determine suggested focus areas based on JD characteristics and candidate strengths
   */
  private static determineSuggestedFocusAreas(
    jdCharacteristics: any,
    componentDistribution: any
  ): FocusArea[] {
    const suggestions: FocusArea[] = ['balanced']; // Always include balanced

    // Add focus areas based on JD requirements
    if (jdCharacteristics.isTechnical) {
      suggestions.push('technical');
    }

    if (jdCharacteristics.requiresLeadership) {
      suggestions.push('leadership');
    }

    if (jdCharacteristics.emphasizesImpact) {
      suggestions.push('impact');
    }

    if (jdCharacteristics.requiresInnovation) {
      suggestions.push('innovation');
    }

    // If candidate is strong in an area not emphasized by JD, still suggest it
    // (they might want to differentiate themselves)
    const maxStrength = Math.max(
      componentDistribution.technical,
      componentDistribution.leadership,
      componentDistribution.impact,
      componentDistribution.innovation
    );

    if (componentDistribution.technical === maxStrength && !suggestions.includes('technical')) {
      suggestions.push('technical');
    }

    if (componentDistribution.leadership === maxStrength && !suggestions.includes('leadership')) {
      suggestions.push('leadership');
    }

    if (componentDistribution.impact === maxStrength && !suggestions.includes('impact')) {
      suggestions.push('impact');
    }

    // Limit to top 4 suggestions + balanced
    return suggestions.slice(0, 5);
  }

  /**
   * Generate multiple CV variants with different focus areas
   */
  static async generateVariants(
    matches: MatchResult[],
    jdMetadata: JDMatchingResults['jdMetadata'],
    focusAreas: FocusArea[]
  ): Promise<CVVariant[]> {
    try {
      console.log(`📝 Generating ${focusAreas.length} CV variants...`);

      const variants: CVVariant[] = [];

      for (const focusArea of focusAreas) {
        console.log(`  → Generating ${focusArea} variant...`);

        const variant = await this.generateSingleVariant(
          matches,
          jdMetadata,
          focusArea
        );

        variants.push(variant);
      }

      // Sort by score (highest first)
      variants.sort((a, b) => b.score - a.score);

      console.log(`✅ Generated ${variants.length} variants`);

      return variants;
    } catch (error: any) {
      console.error('❌ Variant generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate a single CV variant with specific focus area
   */
  private static async generateSingleVariant(
    matches: MatchResult[],
    jdMetadata: JDMatchingResults['jdMetadata'],
    focusArea: FocusArea
  ): Promise<CVVariant> {
    const genAI = this.getClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Filter good matches
    const goodMatches = matches.filter(m => m.score >= 40 && m.cvComponent !== null);

    const focusDescriptions = {
      technical: 'Technical Excellence - Emphasize programming languages, frameworks, tools, technical depth, and engineering skills',
      leadership: 'Leadership & Management - Emphasize team leadership, mentoring, decision-making, and stakeholder management',
      impact: 'Business Impact - Emphasize metrics, business outcomes, revenue, user growth, and measurable achievements',
      innovation: 'Innovation & R&D - Emphasize new solutions, cutting-edge technology, patents, research, and pioneering work',
      balanced: 'Balanced Approach - Evenly distribute focus across technical skills, leadership, impact, and innovation',
    };

    const prompt = `You are an expert CV optimizer. Create a CV variant optimized for this focus area.

JOB DESCRIPTION:
Title: ${jdMetadata.title}
Company: ${jdMetadata.company}
Location: ${jdMetadata.location || 'N/A'}

FOCUS AREA: ${focusArea.toUpperCase()}
${focusDescriptions[focusArea]}

AVAILABLE MATCHED COMPONENTS (${goodMatches.length}):
${goodMatches.map((m, i) => `${i + 1}. [${m.cvComponent!.type}] ${m.cvComponent!.title} (Match: ${m.score}%)
   ${m.cvComponent!.description || 'No description'}
   Highlights: ${m.cvComponent!.highlights.slice(0, 2).join('; ')}
`).join('\n')}

TASK:
1. Select the TOP components that best align with the focus area (3-5 experiences, 2-3 education, 5-8 skills, 1-3 projects)
2. Prioritize components that demonstrate ${focusArea} strengths
3. Calculate an overall score (0-100) for this variant based on JD alignment + focus area fit
4. Identify strength areas and weakness areas

Return JSON:
{
  "selectedComponentIds": {
    "experience": ["id1", "id2", ...],
    "education": ["id1", ...],
    "skills": ["id1", ...],
    "projects": ["id1", ...]
  },
  "score": 85,
  "reasoning": "Why this selection works well for ${focusArea}",
  "strengthAreas": ["Area 1", "Area 2"],
  "weaknessAreas": ["Area 1", "Area 2"]
}

Return ONLY valid JSON.`;

    const result = await LLMUtilsService.callWithRetry<any>(model, prompt, {
      maxRetries: 2,
      parseJSON: true,
      validator: (data: any) => {
        return data.selectedComponentIds &&
               typeof data.score === 'number' &&
               data.score >= 0 && data.score <= 100;
      },
    });

    // Map IDs to actual components
    const selectedComponents = {
      experience: goodMatches
        .filter(m => m.cvComponent?.type === 'experience' && result.selectedComponentIds.experience.includes(m.cvComponent.id))
        .map(m => m.cvComponent!),
      education: goodMatches
        .filter(m => m.cvComponent?.type === 'education' && result.selectedComponentIds.education.includes(m.cvComponent.id))
        .map(m => m.cvComponent!),
      skills: goodMatches
        .filter(m => m.cvComponent?.type === 'skill' && result.selectedComponentIds.skills.includes(m.cvComponent.id))
        .map(m => m.cvComponent!),
      projects: goodMatches
        .filter(m => m.cvComponent?.type === 'project' && result.selectedComponentIds.projects.includes(m.cvComponent.id))
        .map(m => m.cvComponent!),
    };

    // Generate professional summary for this variant
    const selectedMatches = goodMatches.filter(m =>
      result.selectedComponentIds.experience.includes(m.cvComponent?.id) ||
      result.selectedComponentIds.education.includes(m.cvComponent?.id) ||
      result.selectedComponentIds.skills.includes(m.cvComponent?.id) ||
      result.selectedComponentIds.projects.includes(m.cvComponent?.id)
    );

    const professionalSummary = await ProfessionalSummaryService.generateFromMatches(
      selectedMatches,
      jdMetadata,
      jdMetadata.seniorityLevel
    );

    return {
      id: `variant-${focusArea}-${Date.now()}`,
      focusArea,
      title: `${focusArea.charAt(0).toUpperCase() + focusArea.slice(1)} Focus`,
      description: focusDescriptions[focusArea],
      score: result.score,
      professionalSummary,
      selectedComponents,
      reasoning: result.reasoning,
      strengthAreas: result.strengthAreas,
      weaknessAreas: result.weaknessAreas,
    };
  }

  /**
   * Compare variants and provide recommendations
   */
  static compareVariants(variants: CVVariant[]): {
    recommended: CVVariant;
    comparison: Array<{
      variant: CVVariant;
      rank: number;
      prosAndCons: {
        pros: string[];
        cons: string[];
      };
    }>;
  } {
    // Sort by score
    const sorted = [...variants].sort((a, b) => b.score - a.score);
    const recommended = sorted[0];

    const comparison = sorted.map((variant, index) => ({
      variant,
      rank: index + 1,
      prosAndCons: {
        pros: [
          `Score: ${variant.score}/100`,
          `Strong in: ${variant.strengthAreas.join(', ')}`,
          variant.focusArea === 'balanced' ? 'Well-rounded approach' : `Optimized for ${variant.focusArea}`,
        ],
        cons: variant.weaknessAreas.length > 0
          ? [`Could improve: ${variant.weaknessAreas.join(', ')}`]
          : ['No major weaknesses identified'],
      },
    }));

    return { recommended, comparison };
  }
}
