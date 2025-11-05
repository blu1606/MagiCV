import { SupabaseService } from './supabase-service';
import { ProfessionalSummaryService } from './professional-summary-service';
import type { Component, Profile } from '@/lib/supabase';
import type { MatchResult, JDMatchingResults } from '@/lib/types/jd-matching';

/**
 * CV Data Enhancer Service
 *
 * GIẢI QUYẾT VẤN ĐỀ: CV thiếu thông tin cần thiết
 *
 * Strategy:
 * 1. ALWAYS include ALL education (không phụ thuộc vào matching)
 * 2. ALWAYS include profile contact info (phone, address, email)
 * 3. Add professional summary
 * 4. Ensure minimum quality thresholds (ít nhất 2 experiences, 5 skills)
 */
export class CVDataEnhancerService {
  /**
   * Enhance CV data to ensure completeness
   *
   * Takes matched components + ensures essential data is included
   */
  static async enhanceCVData(
    userId: string,
    matches: MatchResult[],
    jdMetadata: JDMatchingResults['jdMetadata'],
    options?: {
      minimumExperiences?: number;
      minimumSkills?: number;
      includeAllEducation?: boolean;
    }
  ): Promise<{
    profile: ProfileData;
    professionalSummary?: string;
    experiences: ExperienceData[];
    education: EducationData[];
    skills: SkillsData;
    projects: ProjectData[];
    awards: AwardData[];
    certifications: CertificationData[];
  }> {
    const {
      minimumExperiences = 2,
      minimumSkills = 5,
      includeAllEducation = true,
    } = options || {};

    console.log('🔧 Enhancing CV data for completeness...');

    // 1. Get profile with all fields
    const profile = await this.getCompleteProfile(userId);

    // 2. Get ALL user components (not just matched)
    const allComponents = await SupabaseService.getComponentsByUserId(userId);

    // 3. Group matched components
    const matchedByType = this.groupMatchedComponents(matches);

    // 4. ALWAYS include ALL education
    const education = includeAllEducation
      ? this.getAllEducation(allComponents, matchedByType.education)
      : this.formatEducation(matchedByType.education);

    console.log(`✓ Including ${education.length} education entries (${matchedByType.education.length} matched + ${education.length - matchedByType.education.length} essential)`);

    // 5. Ensure minimum experiences
    const experiences = await this.ensureMinimumExperiences(
      matchedByType.experience,
      allComponents,
      minimumExperiences
    );

    console.log(`✓ Including ${experiences.length} experiences (minimum: ${minimumExperiences})`);

    // 6. Ensure minimum skills
    const skills = this.ensureMinimumSkills(
      matchedByType.skill,
      allComponents,
      minimumSkills
    );

    console.log(`✓ Including ${skills.technical.length} skills (minimum: ${minimumSkills})`);

    // 7. Format projects
    const projects = this.formatProjects(matchedByType.project);

    // 8. Extract awards/certifications from highlights
    const { awards, certifications } = this.extractAwardsAndCertifications(allComponents);

    // 9. Generate professional summary
    let professionalSummary: string | undefined;
    try {
      professionalSummary = await ProfessionalSummaryService.generateFromMatches(
        matches,
        jdMetadata,
        jdMetadata.seniorityLevel
      );
      console.log('✓ Professional summary generated');
    } catch (error) {
      console.warn('⚠️ Professional summary generation failed, using fallback');
    }

    return {
      profile,
      professionalSummary,
      experiences,
      education,
      skills,
      projects,
      awards,
      certifications,
    };
  }

  /**
   * Get complete profile with all contact info
   */
  private static async getCompleteProfile(userId: string): Promise<ProfileData> {
    const dbProfile = await SupabaseService.getProfileById(userId);
    const { email } = await SupabaseService.getUserInfo(userId);

    if (!dbProfile) {
      throw new Error('Profile not found');
    }

    // Cast to any to access new fields (phone, address, etc.)
    const fullProfile = dbProfile as any;

    return {
      name: fullProfile.full_name || 'Your Name',
      email: email || '',
      phone: fullProfile.phone || '',
      address: fullProfile.address || '',
      city: fullProfile.city || '',
      state: fullProfile.state || '',
      zip: fullProfile.zip || '',
      country: fullProfile.country || 'Vietnam',
      linkedin: fullProfile.linkedin_url || '',
      github: fullProfile.github_url || '',
      portfolio: fullProfile.portfolio_url || '',
      city_state_zip: this.buildCityStateZip(fullProfile),
    };
  }

  /**
   * Build city_state_zip string from profile
   */
  private static buildCityStateZip(profile: any): string {
    const parts: string[] = [];

    if (profile.city) parts.push(profile.city);
    if (profile.state) parts.push(profile.state);
    if (profile.zip) parts.push(profile.zip);

    return parts.length > 0 ? parts.join(', ') : '';
  }

  /**
   * Group matched components by type
   */
  private static groupMatchedComponents(matches: MatchResult[]): {
    experience: MatchResult[];
    education: MatchResult[];
    skill: MatchResult[];
    project: MatchResult[];
  } {
    return {
      experience: matches.filter(m => m.cvComponent?.type === 'experience'),
      education: matches.filter(m => m.cvComponent?.type === 'education'),
      skill: matches.filter(m => m.cvComponent?.type === 'skill'),
      project: matches.filter(m => m.cvComponent?.type === 'project'),
    };
  }

  /**
   * ALWAYS include ALL education, regardless of matching
   */
  private static getAllEducation(
    allComponents: Component[],
    matchedEducation: MatchResult[]
  ): EducationData[] {
    // Get all education components
    const allEducation = allComponents.filter(c => c.type === 'education');

    // IDs that were already matched
    const matchedIds = new Set(matchedEducation.map(m => m.cvComponent!.id));

    // Format matched education first (sorted by match score)
    const formatted = matchedEducation
      .sort((a, b) => b.score - a.score)
      .map(m => this.formatEducationComponent(m.cvComponent!));

    // Add remaining unmatched education
    const unmatched = allEducation
      .filter(edu => !matchedIds.has(edu.id))
      .sort((a, b) => {
        // Sort by date (most recent first)
        return (b.end_date || '9999').localeCompare(a.end_date || '9999');
      })
      .map(edu => this.formatEducationComponent(edu));

    return [...formatted, ...unmatched];
  }

  /**
   * Format single education component
   */
  private static formatEducationComponent(component: Component): EducationData {
    return {
      school: component.organization || 'University',
      degree: component.title,
      concentration: component.description || '',
      location: 'Location', // TODO: Extract from description or add to schema
      graduation_date: this.formatDate(component.end_date) || 'Present',
      gpa: this.extractGPA(component),
      coursework: this.extractCoursework(component),
      awards: this.extractAwards(component),
    };
  }

  /**
   * Format education from matches
   */
  private static formatEducation(matchedEducation: MatchResult[]): EducationData[] {
    return matchedEducation.map(m => this.formatEducationComponent(m.cvComponent!));
  }

  /**
   * Ensure minimum number of experiences
   * If matched < minimum, add top unmatched experiences
   */
  private static async ensureMinimumExperiences(
    matchedExperiences: MatchResult[],
    allComponents: Component[],
    minimum: number
  ): Promise<ExperienceData[]> {
    // Format matched experiences
    const formatted = matchedExperiences
      .sort((a, b) => b.score - a.score)
      .map(m => this.formatExperienceComponent(m.cvComponent!));

    // If we have enough, return
    if (formatted.length >= minimum) {
      return formatted;
    }

    // Otherwise, add top unmatched experiences
    const matchedIds = new Set(matchedExperiences.map(m => m.cvComponent!.id));
    const unmatchedExperiences = allComponents
      .filter(c => c.type === 'experience' && !matchedIds.has(c.id))
      .sort((a, b) => {
        // Sort by most recent first
        return (b.end_date || '9999').localeCompare(a.end_date || '9999');
      });

    const needed = minimum - formatted.length;
    const additional = unmatchedExperiences
      .slice(0, needed)
      .map(exp => this.formatExperienceComponent(exp));

    return [...formatted, ...additional];
  }

  /**
   * Format single experience component
   */
  private static formatExperienceComponent(component: Component): ExperienceData {
    return {
      title: component.title,
      organization: component.organization || 'Company',
      location: 'Location', // TODO: Extract or add to schema
      remote: false, // TODO: Detect from description
      start: this.formatDate(component.start_date) || 'N/A',
      end: this.formatDate(component.end_date) || 'Present',
      bullets: component.highlights.length > 0
        ? component.highlights
        : [component.description || 'No description'],
    };
  }

  /**
   * Ensure minimum number of skills
   */
  private static ensureMinimumSkills(
    matchedSkills: MatchResult[],
    allComponents: Component[],
    minimum: number
  ): SkillsData {
    // Get matched skill titles
    const matchedTitles = matchedSkills.map(m => m.cvComponent!.title);

    // If we have enough, return
    if (matchedTitles.length >= minimum) {
      return {
        technical: matchedTitles,
        languages: [], // TODO: Extract from components
        interests: [],
      };
    }

    // Otherwise, add top unmatched skills
    const matchedIds = new Set(matchedSkills.map(m => m.cvComponent!.id));
    const unmatchedSkills = allComponents
      .filter(c => c.type === 'skill' && !matchedIds.has(c.id))
      .slice(0, minimum - matchedTitles.length);

    return {
      technical: [
        ...matchedTitles,
        ...unmatchedSkills.map(s => s.title),
      ],
      languages: [], // TODO: Detect language skills
      interests: [],
    };
  }

  /**
   * Format projects
   */
  private static formatProjects(matchedProjects: MatchResult[]): ProjectData[] {
    return matchedProjects.map(m => {
      const comp = m.cvComponent!;
      return {
        title: comp.title,
        description: comp.description || '',
        technologies: this.extractTechnologies(comp),
        highlights: comp.highlights,
      };
    });
  }

  /**
   * Extract technologies from project component
   * Look for common tech patterns in description/highlights
   */
  private static extractTechnologies(component: Component): string[] {
    const text = `${component.description || ''} ${component.highlights.join(' ')}`;

    // Common tech keywords to look for
    const techPatterns = [
      /\b(React|Vue|Angular|Node\.?js|Python|Java|JavaScript|TypeScript|Go|Rust|C\+\+|C#)\b/gi,
      /\b(MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|DynamoDB)\b/gi,
      /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|GitHub Actions)\b/gi,
    ];

    const technologies = new Set<string>();

    for (const pattern of techPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => technologies.add(match));
      }
    }

    return Array.from(technologies).slice(0, 5); // Limit to 5 technologies
  }

  /**
   * Extract awards and certifications from components
   */
  private static extractAwardsAndCertifications(components: Component[]): {
    awards: AwardData[];
    certifications: CertificationData[];
  } {
    const awards: AwardData[] = [];
    const certifications: CertificationData[] = [];

    // Keywords to detect awards
    const awardKeywords = ['award', 'recognition', 'honor', 'prize', 'medal', 'won'];
    const certKeywords = ['certified', 'certification', 'certificate', 'credential'];

    for (const comp of components) {
      const text = `${comp.title} ${comp.description}`.toLowerCase();

      // Check highlights for awards/certs
      for (const highlight of comp.highlights) {
        const hlText = highlight.toLowerCase();

        if (awardKeywords.some(kw => hlText.includes(kw))) {
          awards.push({
            title: highlight,
            date: this.formatDate(comp.end_date) || '',
            organization: comp.organization || '',
          });
        }

        if (certKeywords.some(kw => hlText.includes(kw))) {
          certifications.push({
            title: highlight,
            issuer: comp.organization || '',
            date: this.formatDate(comp.end_date) || '',
          });
        }
      }
    }

    return { awards, certifications };
  }

  /**
   * Format date from ISO to readable
   */
  private static formatDate(dateStr: string | null | undefined): string | null {
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

  /**
   * Extract GPA from component description
   */
  private static extractGPA(component: Component): string {
    const text = component.description || '';
    const gpaMatch = text.match(/GPA:?\s*([\d.]+)/i);
    return gpaMatch ? gpaMatch[1] : '';
  }

  /**
   * Extract coursework from highlights
   */
  private static extractCoursework(component: Component): string[] {
    // Look for highlights mentioning courses
    return component.highlights
      .filter(h => h.toLowerCase().includes('course') || h.toLowerCase().includes('class'))
      .slice(0, 3);
  }

  /**
   * Extract awards from highlights
   */
  private static extractAwards(component: Component): string[] {
    const awardKeywords = ['award', 'honor', 'dean', 'scholarship', 'prize'];
    return component.highlights
      .filter(h => awardKeywords.some(kw => h.toLowerCase().includes(kw)))
      .slice(0, 2);
  }
}

// Type definitions
export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  linkedin: string;
  github: string;
  portfolio: string;
  city_state_zip: string;
}

export interface ExperienceData {
  title: string;
  organization: string;
  location: string;
  remote: boolean;
  start: string;
  end: string;
  bullets: string[];
}

export interface EducationData {
  school: string;
  degree: string;
  concentration: string;
  location: string;
  graduation_date: string;
  gpa: string;
  coursework: string[];
  awards: string[];
}

export interface SkillsData {
  technical: string[];
  languages: Array<{ name: string; level: string }> | [];
  interests: string[];
}

export interface ProjectData {
  title: string;
  description: string;
  technologies: string[];
  highlights: string[];
}

export interface AwardData {
  title: string;
  date: string;
  organization: string;
}

export interface CertificationData {
  title: string;
  issuer: string;
  date: string;
}
