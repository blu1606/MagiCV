import { GoogleGenerativeAI } from '@google/generative-ai';
import { randomUUID } from 'crypto';
import { EmbeddingService } from './embedding-service';
import { SupabaseService } from './supabase-service';
import { PDFService } from './pdf-service';
import { SeniorityAnalysisService } from './seniority-analysis-service';
import type { Component } from '@/lib/supabase';
import type {
  JDComponent,
  MatchResult,
  JDMatchingResults,
  JDComponentType,
} from '@/lib/types/jd-matching';
import { getMatchQuality } from '@/lib/types/jd-matching';
import type { SeniorityLevel } from './seniority-analysis-service';

type GroupedSkillInput = {
  category: string;
  summary?: string;
  technologies?: string[];
};

type FlatSkillInput = {
  skill: string;
  level?: string;
  required?: boolean;
};

type SkillCategoryGroup = {
  name: string;
  summary: string;
  technologies: string[];
  weight?: number;
};

type SpecialRequirement = {
  text: string;
  weight: number;
};

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

      // Extract seniority level from JD text
      const seniorityLevel = SeniorityAnalysisService.parseSeniorityFromText(
        `${jdData.title} ${rawText}`
      );

      // Extract metadata
      const jdMetadata = {
        title: jdData.title || 'Untitled Position',
        company: jdData.company || 'Unknown Company',
        location: jdData.metadata?.location || undefined,
        description: rawText.substring(0, 500),
        seniorityLevel: seniorityLevel || undefined,
      };

      const components: JDComponent[] = [];

      const skillCategories = this.selectSkillCategories(
        jdData.groupedSkills as GroupedSkillInput[] | undefined,
        jdData.skills as FlatSkillInput[] | undefined
      );

      for (const category of skillCategories.slice(0, 5)) {
        const component = await this.createSkillCategoryComponent(category);
        components.push(component);
      }

      const specialRequirements = this.extractSpecialRequirements(
        jdData.requirements || [],
        jdData.qualifications || []
      );

      const requirementSlots = Math.max(0, 10 - components.length);
      const usedRequirementTexts = new Set<string>();
      for (const requirement of specialRequirements.slice(0, Math.min(3, requirementSlots))) {
        const component = await this.createSpecialRequirementComponent(requirement.text);
        components.push(component);
        usedRequirementTexts.add(requirement.text.toLowerCase());
      }

      if (components.length < 5) {
        const responsibilitiesComponent = await this.createResponsibilitiesComponent(
          jdData.responsibilities || []
        );
        if (responsibilitiesComponent) {
          components.push(responsibilitiesComponent);
        }
      }

      if (components.length < 5) {
        const remainingRequirements = (jdData.requirements || []).filter((req) => {
          if (!req) return false;
          return !usedRequirementTexts.has(req.trim().toLowerCase());
        });
        const requirementsSummary = await this.createRequirementSummaryComponent(
          remainingRequirements
        );
        if (requirementsSummary) {
          components.push(requirementsSummary);
        }
      }

      const limitedComponents = components.slice(0, 10);
      console.log(`✅ Extracted ${limitedComponents.length} JD components`);

      return {
        jdMetadata,
        components: limitedComponents,
      };
    } catch (error: any) {
      console.error('❌ Error extracting JD components:', error.message);
      throw error;
    }
  }

  private static selectSkillCategories(
    groupedSkills?: GroupedSkillInput[],
    skills?: FlatSkillInput[]
  ): SkillCategoryGroup[] {
    if (groupedSkills && groupedSkills.length > 0) {
      const unique = new Map<string, SkillCategoryGroup>();
      for (const item of groupedSkills) {
        if (!item || !item.category) continue;
        const name = this.titleCase(item.category.trim());
        if (!name) continue;
        const key = name.toLowerCase();
        const existing = unique.get(key);
        const technologies = new Set<string>(existing?.technologies || []);
        for (const tech of item.technologies || []) {
          if (!tech) continue;
          technologies.add(this.titleCase(tech));
        }
        unique.set(key, {
          name,
          summary: item.summary?.trim() || 'Core capabilities for this competency area.',
          technologies: Array.from(technologies),
        });
      }
      const sorted = Array.from(unique.values()).sort(
        (a, b) => (b.technologies.length || 0) - (a.technologies.length || 0)
      );
      if (sorted.length >= 3) {
        return sorted.slice(0, 5);
      }
      const fallback = this.fallbackSkillCategories(skills || []);
      const merged = [...sorted, ...fallback];
      const deduped = new Map<string, SkillCategoryGroup>();
      for (const entry of merged) {
        if (!entry) continue;
        const key = entry.name.toLowerCase();
        if (!deduped.has(key)) {
          deduped.set(key, entry);
        }
      }
      return Array.from(deduped.values()).slice(0, 5);
    }
    return this.fallbackSkillCategories(skills || []);
  }

  private static fallbackSkillCategories(skills: FlatSkillInput[]): SkillCategoryGroup[] {
    const definitions = [
      {
        id: 'software',
        name: 'Software Engineering',
        summary: 'Hands-on software development across services, APIs, and user experiences.',
        keywords: ['software', 'engineer', 'developer', 'development', 'code', 'programming', 'full', 'backend', 'frontend', 'api', 'web', 'service'],
      },
      {
        id: 'frontend',
        name: 'Product & Frontend Experience',
        summary: 'Crafting user interfaces, design systems, and web application experiences.',
        keywords: ['frontend', 'ui', 'ux', 'react', 'angular', 'vue', 'next', 'design', 'javascript', 'typescript', 'html', 'css'],
      },
      {
        id: 'backend',
        name: 'Platform & Backend Services',
        summary: 'Designing scalable services, data models, and integration surfaces.',
        keywords: ['backend', 'api', 'service', 'node', 'python', 'java', 'go', 'database', 'sql', 'microservice'],
      },
      {
        id: 'data',
        name: 'AI, Data & Analytics',
        summary: 'Data analysis, machine learning, and insight generation.',
        keywords: ['data', 'analytics', 'ml', 'ai', 'model', 'sql', 'warehouse', 'pytorch', 'tensorflow', 'hadoop'],
      },
      {
        id: 'cloud',
        name: 'Cloud & DevOps',
        summary: 'Infrastructure automation, deployment pipelines, and reliability.',
        keywords: ['devops', 'cloud', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'terraform', 'ci', 'cd', 'infrastructure'],
      },
      {
        id: 'quality',
        name: 'Quality & Process Excellence',
        summary: 'Testing strategies, QA practices, and continuous improvement.',
        keywords: ['test', 'qa', 'quality', 'automation', 'selenium', 'cypress', 'jest', 'process', 'agile', 'scrum'],
      },
    ];

    const buckets = new Map<
      string,
      { definition: (typeof definitions)[number]; technologies: Set<string>; weight: number }
    >();

    const ensureBucket = (definition: (typeof definitions)[number]) => {
      let bucket = buckets.get(definition.id);
      if (!bucket) {
        bucket = { definition, technologies: new Set<string>(), weight: 0 };
        buckets.set(definition.id, bucket);
      }
      return bucket;
    };

    for (const item of skills || []) {
      const name = item?.skill?.trim();
      if (!name) continue;
      const lower = name.toLowerCase();
      const matches = definitions.filter((definition) =>
        definition.keywords.some((keyword) => lower.includes(keyword))
      );
      const targets = matches.length > 0 ? matches : [definitions[0]];
      for (const target of targets) {
        const bucket = ensureBucket(target);
        bucket.technologies.add(this.titleCase(name));
        bucket.weight += item?.required ? 3 : 1;
        if (item?.level) {
          bucket.weight += 1;
        }
      }
    }

    const categories = Array.from(buckets.values())
      .map((bucket) => ({
        name: bucket.definition.name,
        summary: bucket.definition.summary,
        technologies: Array.from(bucket.technologies),
        weight: bucket.weight,
      }))
      .sort((a, b) => (b.weight || 0) - (a.weight || 0));

    if (categories.length === 0) {
      return [
        {
          name: 'Software Engineering',
          summary: 'Hands-on software development across services, APIs, and user experiences.',
          technologies: skills
            .map((item) => this.titleCase(item.skill || ''))
            .filter(Boolean)
            .slice(0, 8),
        },
      ];
    }

    const trimmed = categories.slice(0, 5).map(({ weight, ...rest }) => rest);

    if (trimmed.length < 3) {
      const supplemental = [
        {
          name: 'Product Delivery & Collaboration',
          summary: 'Partnering with product, design, and stakeholders to deliver user-facing value.',
        },
        {
          name: 'Operational Excellence',
          summary: 'Improving reliability, quality, and execution across the engineering lifecycle.',
        },
      ];
      const existingNames = new Set(trimmed.map((item) => item.name.toLowerCase()));
      for (const supplementalEntry of supplemental) {
        if (trimmed.length >= 3) break;
        if (existingNames.has(supplementalEntry.name.toLowerCase())) continue;
        trimmed.push({
          name: supplementalEntry.name,
          summary: supplementalEntry.summary,
          technologies: [],
        });
      }
    }

    return trimmed;
  }

  private static async createSkillCategoryComponent(
    category: SkillCategoryGroup
  ): Promise<JDComponent> {
    const technologies = category.technologies.slice(0, 8);
    const descriptionParts = [
      category.summary,
      technologies.length > 0 ? `Core technologies: ${technologies.join(', ')}.` : null,
    ].filter(Boolean);
    const description = descriptionParts.join(' ');
    const embedding = await EmbeddingService.embed(
      `${category.name}: ${category.summary}. Technologies: ${technologies.join(', ')}`
    );

    return {
      id: randomUUID(),
      type: 'skill',
      title: category.name,
      description,
      required: true,
      embedding,
    };
  }

  private static extractSpecialRequirements(
    requirements: string[],
    qualifications: string[]
  ): SpecialRequirement[] {
    const combined = [...(requirements || []), ...(qualifications || [])].filter(Boolean);
    const seen = new Set<string>();
    const results: SpecialRequirement[] = [];

    for (const entry of combined) {
      const text = entry.trim();
      if (!text) continue;
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      const weight = this.computeRequirementWeight(text);
      if (weight <= 0) continue;
      seen.add(key);
      results.push({ text, weight });
    }

    return results.sort((a, b) => b.weight - a.weight);
  }

  private static computeRequirementWeight(text: string): number {
    let weight = 0;
    if (/\b(must|required|required to|need to|shall)\b/i.test(text)) weight += 3;
    if (/\b(at least|min(?:imum)?|[0-9]+\+?\s+years|[0-9]+\s+yrs)\b/i.test(text)) weight += 2;
    if (/\b(certified|certification|license|clearance|visa|work authorization|eligib|accreditation)\b/i.test(text)) weight += 3;
    if (/\b(bachelor|master|phd|degree)\b/i.test(text)) weight += 1;
    if (/\b(travel|on[-\s]?site|security)\b/i.test(text)) weight += 1;
    if (/\b(preferred|nice to have)\b/i.test(text)) weight -= 1;
    return weight;
  }

  private static async createSpecialRequirementComponent(text: string): Promise<JDComponent> {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    const embedding = await EmbeddingService.embed(cleaned);
    return {
      id: randomUUID(),
      type: 'requirement',
      title: this.buildRequirementTitle(cleaned),
      description: cleaned,
      required: true,
      embedding,
    };
  }

  private static async createResponsibilitiesComponent(
    responsibilities: string[]
  ): Promise<JDComponent | null> {
    const cleaned = (responsibilities || []).map((item) => item?.trim()).filter(Boolean);
    if (cleaned.length === 0) return null;
    const limited = cleaned.slice(0, 6);
    const description = `Key responsibilities include: ${limited.join('; ')}.`;
    const embedding = await EmbeddingService.embed(description);
    return {
      id: randomUUID(),
      type: 'responsibility',
      title: 'Key Responsibilities',
      description,
      required: false,
      embedding,
    };
  }

  private static async createRequirementSummaryComponent(
    requirements: string[]
  ): Promise<JDComponent | null> {
    const cleaned = (requirements || []).map((item) => item?.trim()).filter(Boolean);
    if (cleaned.length === 0) return null;
    const limited = cleaned.slice(0, 5);
    const description = `Core expectations: ${limited.join('; ')}.`;
    const embedding = await EmbeddingService.embed(description);
    return {
      id: randomUUID(),
      type: 'requirement',
      title: 'Core Expectations',
      description,
      required: true,
      embedding,
    };
  }

  private static titleCase(value: string): string {
    if (!value) return value;
    const abbreviations = new Set(['ai', 'ml', 'ui', 'ux', 'qa', 'api', 'sre', 'devops']);
    return value
      .replace(/[_\r\n]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word) => {
        const lower = word.toLowerCase();
        if (abbreviations.has(lower)) {
          return lower.toUpperCase();
        }
        if (word.toUpperCase() === word) {
          return word.toUpperCase();
        }
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(' ')
      .replace(/\s&\s/g, ' & ');
  }

  private static buildRequirementTitle(text: string): string {
    if (!text) return 'Special Requirement';
    const firstSentence = text.split(/[.;\n]/)[0].trim();
    const trimmed = firstSentence || text;
    return `Requirement: ${this.truncate(trimmed, 80)}`;
  }

  private static truncate(value: string, maxLength: number): string {
    if (!value) return value;
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 3).trimEnd()}...`;
  }

  /**
   * Calculate keyword match bonus
   * Boosts score if there are exact keyword matches
   */
  private static calculateKeywordBonus(
    jdComponent: JDComponent,
    cvComponent: Component
  ): number {
    const jdText = `${jdComponent.title} ${jdComponent.description}`.toLowerCase();
    const cvText = `${cvComponent.title} ${cvComponent.description} ${cvComponent.highlights.join(' ')}`.toLowerCase();

    // Extract important keywords (tech stack, skills, tools)
    const techKeywords = jdText.match(/\b(react|vue|angular|node|python|java|aws|kubernetes|docker|sql|nosql|typescript|javascript|go|rust|c\+\+|c#|ruby|php|swift|kotlin|flutter|mongodb|postgres|redis|elasticsearch|kafka|graphql|rest|grpc|microservices|ci\/cd|jenkins|terraform|ansible)\b/gi) || [];

    if (techKeywords.length === 0) return 0;

    // Count how many keywords appear in CV text
    const matchedKeywords = techKeywords.filter(keyword =>
      cvText.includes(keyword.toLowerCase())
    );

    // Calculate bonus: up to +15 points for perfect keyword alignment
    const matchRatio = matchedKeywords.length / techKeywords.length;
    return Math.round(matchRatio * 15);
  }

  /**
   * Match a single JD component with user's CV components (Enhanced with context awareness)
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
      const scoredComponents = (
        await Promise.all(
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

                // Base similarity score
                const similarityScore = EmbeddingService.cosineSimilarity(
                  jdComponent.embedding!,
                  cvEmbedding
                );

                // Calculate keyword match bonus
                const keywordBonus = this.calculateKeywordBonus(jdComponent, cvComponent);

                // Combined score (similarity + bonus, capped at 100)
                const combinedScore = Math.min(similarityScore + (keywordBonus / 100), 1.0);

                return { component: cvComponent, score: combinedScore, keywordBonus };
              } catch (e: any) {
                // Skip components that fail embedding/similarity
                return { component: cvComponent, score: -1, keywordBonus: 0 };
              }
            })
        )
      ).sort((a, b) => b.score - a.score);

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

      // Convert to percentage (0-100)
      let scorePercentage = Math.round(bestMatch.score * 100);

      // Log keyword bonus if significant
      if (bestMatch.keywordBonus > 0) {
        console.log(`  ✨ Keyword bonus: +${bestMatch.keywordBonus} points for ${jdComponent.title}`);
      }

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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

    // Calculate overall score (dynamic weighted average)
    const requiredMatches = validMatches.filter(m => m.jdComponent.required);
    const optionalMatches = validMatches.filter(m => !m.jdComponent.required);

    const requiredScore = requiredMatches.length > 0
      ? requiredMatches.reduce((sum, m) => sum + m.score, 0) / requiredMatches.length
      : 0;

    const optionalScore = optionalMatches.length > 0
      ? optionalMatches.reduce((sum, m) => sum + m.score, 0) / optionalMatches.length
      : 0;

    // Dynamic weighting based on required/optional ratio
    // If all required: 100% weight on required
    // If all optional: 100% weight on optional
    // If mixed: 70% required, 30% optional (default)
    let overallScore: number;
    if (requiredMatches.length === 0 && optionalMatches.length > 0) {
      overallScore = Math.round(optionalScore);
    } else if (optionalMatches.length === 0 && requiredMatches.length > 0) {
      overallScore = Math.round(requiredScore);
    } else {
      // Standard weighting: 70% required, 30% optional
      overallScore = Math.round(requiredScore * 0.7 + optionalScore * 0.3);
    }

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
   * Enhanced to map JD component types to CV component types intelligently
   */
  private static calculateCategoryScore(
    matches: MatchResult[],
    cvComponentTypes: Component['type'][]
  ): number {
    const categoryMatches = matches.filter(m => {
      if (!m.cvComponent) return false;

      // Direct type match
      if (cvComponentTypes.includes(m.cvComponent.type)) return true;

      // Enhanced mapping logic
      // JD "skill" components can match CV skills, projects (that demonstrate skills), or experience
      if (m.jdComponent.type === 'skill') {
        return cvComponentTypes.includes('skill') ||
               cvComponentTypes.includes('project') ||
               cvComponentTypes.includes('experience');
      }

      // JD "requirement" or "responsibility" can match any CV component type
      // as they represent broad job requirements
      if (m.jdComponent.type === 'requirement' || m.jdComponent.type === 'responsibility') {
        return true;
      }

      return false;
    });

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

      // Step 4: Perform seniority analysis if JD level detected
      let seniorityAnalysis = undefined;
      if (jdMetadata.seniorityLevel) {
        try {
          console.log(`🎯 Analyzing seniority match (JD level: ${jdMetadata.seniorityLevel})...`);
          const userAnalysis = await SeniorityAnalysisService.analyzeSeniorityLevel(userId);
          const matchResult = await SeniorityAnalysisService.validateSeniorityMatch(
            userId,
            jdMetadata.seniorityLevel
          );

          seniorityAnalysis = {
            userLevel: matchResult.userLevel,
            jdLevel: matchResult.jdLevel,
            isMatch: matchResult.isMatch,
            gap: matchResult.gap,
            advice: matchResult.advice,
            confidence: userAnalysis.confidence,
          };

          console.log(`✅ Seniority analysis: ${matchResult.userLevel} vs ${matchResult.jdLevel} (${matchResult.isMatch ? 'Match' : 'Mismatch'})`);
        } catch (seniorityError: any) {
          console.warn('⚠️ Seniority analysis failed:', seniorityError.message);
          // Continue without seniority analysis
        }
      }

      const results: JDMatchingResults = {
        jdMetadata,
        jdComponents,
        matches,
        overallScore,
        categoryScores,
        suggestions,
        missingComponents,
        seniorityAnalysis,
      };

      console.log(`✅ Matching complete! Overall score: ${overallScore}%`);
      return results;
    } catch (error: any) {
      console.error('❌ Error in JD matching workflow:', error.message);
      throw error;
    }
  }
}
