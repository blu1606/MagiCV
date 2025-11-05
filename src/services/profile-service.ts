import { SupabaseService } from './supabase-service';
import type { Profile, Language } from '@/lib/supabase';

/**
 * Profile Service
 * Manages user profile data including contact info, summary, soft skills, and languages
 * Part of Solution A: Hybrid Architecture
 */
export class ProfileService {
  /**
   * Get user profile by user ID
   */
  static async getProfile(userId: string): Promise<Profile> {
    try {
      const profile = await SupabaseService.getProfileById(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      return profile;
    } catch (error: any) {
      console.error('❌ Error getting profile:', error.message);
      throw error;
    }
  }

  /**
   * Get complete user info (profile + email from auth)
   */
  static async getCompleteProfile(userId: string): Promise<{
    profile: Profile;
    email: string;
  }> {
    try {
      const { profile, email } = await SupabaseService.getUserInfo(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      return { profile, email: profile.email || email || '' };
    } catch (error: any) {
      console.error('❌ Error getting complete profile:', error.message);
      throw error;
    }
  }

  /**
   * Update user profile
   * Supports partial updates - only updates provided fields
   */
  static async updateProfile(
    userId: string,
    updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Profile> {
    try {
      console.log('📝 Updating profile for user:', userId);

      const updated = await SupabaseService.updateProfile(userId, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      console.log('✅ Profile updated successfully');
      return updated;
    } catch (error: any) {
      console.error('❌ Error updating profile:', error.message);
      throw error;
    }
  }

  /**
   * Update contact information
   */
  static async updateContactInfo(
    userId: string,
    contactInfo: {
      email?: string;
      phone?: string;
      location?: string;
      linkedin_url?: string;
      github_url?: string;
      website_url?: string;
    }
  ): Promise<Profile> {
    return this.updateProfile(userId, contactInfo);
  }

  /**
   * Update professional summary
   */
  static async updateProfessionalSummary(
    userId: string,
    summary: {
      professional_title?: string;
      summary?: string;
      bio?: string;
    }
  ): Promise<Profile> {
    return this.updateProfile(userId, summary);
  }

  /**
   * Update soft skills
   */
  static async updateSoftSkills(
    userId: string,
    softSkills: string[]
  ): Promise<Profile> {
    return this.updateProfile(userId, { soft_skills: softSkills });
  }

  /**
   * Add soft skill
   */
  static async addSoftSkill(userId: string, skill: string): Promise<Profile> {
    const profile = await this.getProfile(userId);
    const currentSkills = profile.soft_skills || [];

    // Avoid duplicates
    if (currentSkills.includes(skill)) {
      return profile;
    }

    return this.updateProfile(userId, {
      soft_skills: [...currentSkills, skill],
    });
  }

  /**
   * Remove soft skill
   */
  static async removeSoftSkill(
    userId: string,
    skill: string
  ): Promise<Profile> {
    const profile = await this.getProfile(userId);
    const currentSkills = profile.soft_skills || [];

    return this.updateProfile(userId, {
      soft_skills: currentSkills.filter((s) => s !== skill),
    });
  }

  /**
   * Update languages
   */
  static async updateLanguages(
    userId: string,
    languages: Language[]
  ): Promise<Profile> {
    return this.updateProfile(userId, { languages });
  }

  /**
   * Add language
   */
  static async addLanguage(
    userId: string,
    language: Language
  ): Promise<Profile> {
    const profile = await this.getProfile(userId);
    const currentLanguages = profile.languages || [];

    // Check for duplicate language name
    const existingIndex = currentLanguages.findIndex(
      (l) => l.name.toLowerCase() === language.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Update existing language level
      const updatedLanguages = [...currentLanguages];
      updatedLanguages[existingIndex] = language;
      return this.updateProfile(userId, { languages: updatedLanguages });
    }

    // Add new language
    return this.updateProfile(userId, {
      languages: [...currentLanguages, language],
    });
  }

  /**
   * Remove language
   */
  static async removeLanguage(
    userId: string,
    languageName: string
  ): Promise<Profile> {
    const profile = await this.getProfile(userId);
    const currentLanguages = profile.languages || [];

    return this.updateProfile(userId, {
      languages: currentLanguages.filter(
        (l) => l.name.toLowerCase() !== languageName.toLowerCase()
      ),
    });
  }

  /**
   * Update interests
   */
  static async updateInterests(
    userId: string,
    interests: string[]
  ): Promise<Profile> {
    return this.updateProfile(userId, { interests });
  }

  /**
   * Add interest
   */
  static async addInterest(userId: string, interest: string): Promise<Profile> {
    const profile = await this.getProfile(userId);
    const currentInterests = profile.interests || [];

    // Avoid duplicates
    if (currentInterests.includes(interest)) {
      return profile;
    }

    return this.updateProfile(userId, {
      interests: [...currentInterests, interest],
    });
  }

  /**
   * Remove interest
   */
  static async removeInterest(
    userId: string,
    interest: string
  ): Promise<Profile> {
    const profile = await this.getProfile(userId);
    const currentInterests = profile.interests || [];

    return this.updateProfile(userId, {
      interests: currentInterests.filter((i) => i !== interest),
    });
  }

  /**
   * Ensure profile has all required fields for CV generation
   * Returns profile with default values for missing fields
   */
  static async getProfileForCV(userId: string): Promise<{
    name: string;
    email: string;
    phone: string;
    location: string;
    professional_title: string;
    summary: string;
    soft_skills: string[];
    languages: Language[];
    interests: string[];
    linkedin_url?: string;
    github_url?: string;
    website_url?: string;
  }> {
    const { profile, email } = await this.getCompleteProfile(userId);

    return {
      name: profile.full_name || 'Your Name',
      email: profile.email || email || 'email@example.com',
      phone: profile.phone || '(000) 000-0000',
      location: profile.location || 'City, Country',
      professional_title: profile.professional_title || profile.profession || 'Professional Title',
      summary: profile.summary || 'Professional summary goes here.',
      soft_skills: profile.soft_skills || [],
      languages: profile.languages || [],
      interests: profile.interests || [],
      linkedin_url: profile.linkedin_url,
      github_url: profile.github_url,
      website_url: profile.website_url,
    };
  }

  /**
   * Check if profile is complete (all required fields filled)
   */
  static async isProfileComplete(userId: string): Promise<{
    complete: boolean;
    missingFields: string[];
  }> {
    const profile = await this.getProfile(userId);

    const requiredFields: (keyof Profile)[] = [
      'full_name',
      'email',
      'phone',
      'location',
      'professional_title',
      'summary',
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = profile[field];
      return !value || value === '';
    });

    return {
      complete: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Generate default professional summary based on profile data
   * Uses existing data to create a basic summary if none exists
   */
  static generateDefaultSummary(profile: Profile): string {
    const title = profile.professional_title || profile.profession || 'Professional';
    const name = profile.full_name ? profile.full_name.split(' ')[0] : 'I';

    const templates = [
      `${title} with expertise in software development and problem-solving. Passionate about building high-quality solutions and collaborating with cross-functional teams.`,
      `Experienced ${title} focused on delivering impactful results. Strong background in technical leadership and innovation.`,
      `${title} dedicated to continuous learning and excellence. Proven track record in developing scalable solutions and mentoring teams.`,
    ];

    // Pick a random template
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Initialize profile with default values if missing
   * Useful for new users or incomplete profiles
   */
  static async initializeProfile(userId: string): Promise<Profile> {
    try {
      const profile = await this.getProfile(userId);

      const updates: Partial<Profile> = {};

      // Set defaults for missing fields
      if (!profile.professional_title && profile.profession) {
        updates.professional_title = profile.profession;
      }

      if (!profile.summary) {
        updates.summary = this.generateDefaultSummary(profile);
      }

      if (!profile.soft_skills || profile.soft_skills.length === 0) {
        updates.soft_skills = [
          'Communication',
          'Problem Solving',
          'Teamwork',
          'Adaptability',
        ];
      }

      if (!profile.languages || profile.languages.length === 0) {
        updates.languages = [{ name: 'English', level: 'Native' }];
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        return this.updateProfile(userId, updates);
      }

      return profile;
    } catch (error: any) {
      console.error('❌ Error initializing profile:', error.message);
      throw error;
    }
  }
}
