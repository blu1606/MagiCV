import { getSupabaseAdmin } from '@/lib/supabase';
import type { Profile, Account, Component, CV, CVPdf, ComponentType, ProviderType, LegacySourceType } from '@/lib/supabase';

/**
 * Supabase Service - Updated to match actual database schema
 */
export class SupabaseService {
  private static supabase = getSupabaseAdmin();

  /**
   * Profile operations (replaces User operations)
   */
  static async createProfile(id: string, full_name?: string, avatar_url?: string, profession?: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert({ id, full_name, avatar_url, profession })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get user email from auth.users
   */
  static async getUserEmail(userId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.auth.admin.getUserById(userId);

      if (error) {
        console.error('Error fetching user email:', error);
        return null;
      }

      return data?.user?.email || null;
    } catch (error) {
      console.error('Exception fetching user email:', error);
      return null;
    }
  }

  /**
   * Get complete user info (profile + email)
   */
  static async getUserInfo(userId: string): Promise<{
    profile: Profile | null;
    email: string | null;
  }> {
    const [profile, email] = await Promise.all([
      this.getProfileById(userId),
      this.getUserEmail(userId),
    ]);

    return { profile, email };
  }

  static async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select()
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteProfile(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Legacy User methods for backward compatibility
   */
  static async createUser(email: string, name?: string): Promise<any> {
    // For backward compatibility, we create a profile with a generated UUID
    // In real app, this should use Supabase Auth to create user first
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (authError) throw authError;

    const profile = await this.createProfile(authData.user.id, name);
    return {
      id: profile.id,
      email,
      name: profile.full_name,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  }

  static async getUserByEmail(email: string): Promise<any> {
    const { data, error } = await this.supabase.auth.admin.listUsers();
    if (error) throw error;
    
    const user = data.users.find(u => u.email === email);
    if (!user) return null;

    const profile = await this.getProfileById(user.id);
    return profile ? {
      id: profile.id,
      email: user.email,
      name: profile.full_name,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    } : null;
  }

  static async getUserById(id: string): Promise<any> {
    const profile = await this.getProfileById(id);
    if (!profile) return null;

    const { data: authData } = await this.supabase.auth.admin.getUserById(id);
    
    return {
      id: profile.id,
      email: authData?.user?.email || '',
      name: profile.full_name,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  }

  static async getAllUsers(): Promise<any[]> {
    const profiles = await this.getAllProfiles();
    const { data: authData } = await this.supabase.auth.admin.listUsers();
    
    return profiles.map(p => {
      const authUser = authData?.users.find(u => u.id === p.id);
      return {
        id: p.id,
        email: authUser?.email || '',
        name: p.full_name,
        created_at: p.created_at,
        updated_at: p.updated_at,
      };
    });
  }

  static async updateUser(id: string, updates: any): Promise<any> {
    const profile = await this.updateProfile(id, { full_name: updates.name });
    return {
      id: profile.id,
      email: updates.email || '',
      name: profile.full_name,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  }

  static async deleteUser(id: string): Promise<void> {
    await this.deleteProfile(id);
  }

  /**
   * Account operations
   */
  static async createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .insert(account)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Upsert account - Create or update if exists
   */
  static async upsertAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .upsert(account, {
        onConflict: 'provider,provider_account_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAccountsByUserId(userId: string): Promise<Account[]> {
    const { data, error } = await this.supabase
      .from('accounts')
      .select()
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  static async getAccountByProvider(userId: string, provider: ProviderType): Promise<Account | null> {
    const { data, error } = await this.supabase
      .from('accounts')
      .select()
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Component operations
   */
  static async createComponent(component: Omit<Component, 'id' | 'created_at' | 'updated_at'>): Promise<Component> {
    // Convert legacy data to new schema
    const componentData: any = {
      user_id: component.user_id,
      account_id: component.account_id,
      type: component.type,
      title: component.title,
      organization: component.organization,
      start_date: component.start_date,
      end_date: component.end_date,
      description: component.description,
      highlights: component.highlights || [],
      embedding: component.embedding,
      src: component.src,
    };

    const { data, error } = await this.supabase
      .from('components')
      .insert(componentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserComponents(userId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    components: Component[];
  }> {
    const { data, error } = await this.supabase
      .from('components')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const components = data || [];
    const byType = {
      experience: components.filter(c => c.type === 'experience').length,
      project: components.filter(c => c.type === 'project').length,
      education: components.filter(c => c.type === 'education').length,
      skill: components.filter(c => c.type === 'skill').length,
    };

    return {
      total: components.length,
      byType,
      components,
    };
  }

  /**
   * Alias for getUserComponents - returns just components array
   */
  static async getComponentsByUserId(userId: string): Promise<Component[]> {
    const { data, error } = await this.supabase
      .from('components')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  }

  static async getComponentsByType(userId: string, type: ComponentType): Promise<Component[]> {
    const { data, error } = await this.supabase
      .from('components')
      .select()
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Legacy method for backward compatibility
  static async getComponentsBySource(userId: string, source: LegacySourceType): Promise<Component[]> {
    const { data, error } = await this.supabase
      .from('components')
      .select()
      .eq('user_id', userId)
      .eq('src', source)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async deleteUserComponents(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('components')
      .delete()
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data?.length || 0;
  }

  static async deleteComponentsBySource(userId: string, source: LegacySourceType): Promise<number> {
    const { data, error } = await this.supabase
      .from('components')
      .delete()
      .eq('user_id', userId)
      .eq('src', source)
      .select();

    if (error) throw error;
    return data?.length || 0;
  }

  static async getComponentById(id: string): Promise<Component | null> {
    const { data, error } = await this.supabase
      .from('components')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateComponent(id: string, updates: Partial<Component>): Promise<Component> {
    const { data, error } = await this.supabase
      .from('components')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteComponent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('components')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * CV operations
   */
  static async createCV(cv: Omit<CV, 'id' | 'created_at' | 'updated_at'>): Promise<CV> {
    const { data, error } = await this.supabase
      .from('cvs')
      .insert(cv)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getCVsByUserId(userId: string): Promise<CV[]> {
    const { data, error } = await this.supabase
      .from('cvs')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getCVById(id: string): Promise<CV | null> {
    const { data, error } = await this.supabase
      .from('cvs')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateCV(id: string, updates: Partial<CV>): Promise<CV> {
    const { data, error } = await this.supabase
      .from('cvs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCV(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('cvs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * CV PDF operations
   */
  static async createCVPdf(cvPdf: Omit<CVPdf, 'id' | 'created_at' | 'updated_at'>): Promise<CVPdf> {
    const { data, error } = await this.supabase
      .from('cv_pdfs')
      .insert(cvPdf)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getCVPdfsByUserId(userId: string): Promise<CVPdf[]> {
    const { data, error } = await this.supabase
      .from('cv_pdfs')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getCVPdfsByCVId(cvId: string): Promise<CVPdf[]> {
    const { data, error } = await this.supabase
      .from('cv_pdfs')
      .select()
      .eq('cv_id', cvId)
      .order('version', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Supabase Storage operations for CV PDFs
   */
  static async uploadCVPdf(
    userId: string,
    filename: string,
    fileBuffer: Buffer
  ): Promise<{ path: string; url: string }> {
    const path = `${userId}/${Date.now()}-${filename}`;
    
    const { data, error } = await this.supabase.storage
      .from('cv_pdfs')
      .upload(path, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = this.supabase.storage
      .from('cv_pdfs')
      .getPublicUrl(path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  }

  static async deleteCVPdfFile(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from('cv_pdfs')
      .remove([path]);

    if (error) throw error;
  }

  /**
   * Legacy Job Description methods (mapped to CV operations)
   */
  static async createJobDescription(jd: any): Promise<any> {
    // Map job description to CV format
    const cv = await this.createCV({
      user_id: jd.user_id,
      title: jd.title,
      job_description: jd.raw_text,
      content: jd.parsed_data || {},
    });

    // If there's a PDF path, create CV PDF record
    if (jd.pdf_path) {
      const cvPdf = await this.createCVPdf({
        user_id: jd.user_id,
        cv_id: cv.id,
        file_url: jd.pdf_url || jd.pdf_path,
        filename: jd.pdf_path,
        mime_type: 'application/pdf',
        version: 1,
      });
    }

    return {
      id: cv.id,
      user_id: cv.user_id,
      title: cv.title,
      company: jd.company,
      pdf_path: jd.pdf_path,
      pdf_url: jd.pdf_url,
      raw_text: cv.job_description,
      parsed_data: cv.content,
      embedding: jd.embedding,
      created_at: cv.created_at,
      updated_at: cv.updated_at,
    };
  }

  static async getJobDescriptions(userId: string): Promise<any[]> {
    const cvs = await this.getCVsByUserId(userId);
    return cvs.map(cv => ({
      id: cv.id,
      user_id: cv.user_id,
      title: cv.title,
      raw_text: cv.job_description,
      parsed_data: cv.content,
      created_at: cv.created_at,
      updated_at: cv.updated_at,
    }));
  }

  static async getJobDescriptionById(id: string): Promise<any> {
    const cv = await this.getCVById(id);
    if (!cv) return null;

    return {
      id: cv.id,
      user_id: cv.user_id,
      title: cv.title,
      raw_text: cv.job_description,
      parsed_data: cv.content,
      created_at: cv.created_at,
      updated_at: cv.updated_at,
    };
  }

  static async updateJobDescription(id: string, updates: any): Promise<any> {
    const cv = await this.updateCV(id, {
      title: updates.title,
      job_description: updates.raw_text,
      content: updates.parsed_data,
    });

    return {
      id: cv.id,
      user_id: cv.user_id,
      title: cv.title,
      raw_text: cv.job_description,
      parsed_data: cv.content,
      created_at: cv.created_at,
      updated_at: cv.updated_at,
    };
  }

  static async deleteJobDescription(id: string): Promise<void> {
    await this.deleteCV(id);
  }

  /**
   * Legacy data normalization methods - convert to new schema
   */
  static async saveGitHubData(userId: string, githubData: any) {
    const results = [];

    // Upsert GitHub account (create or update if exists)
    const account = await this.upsertAccount({
      user_id: userId,
      provider: 'github',
      provider_account_id: githubData.profile.login,
    });

    // Group skills by language/technology domain (3-5 general skill components)
    // Use languageStats to create meaningful skill groups
    const languageGroups = this.groupGitHubLanguagesIntoSkills(githubData);

    for (const skillGroup of languageGroups) {
      const skillComponent = await this.createComponent({
        user_id: userId,
        account_id: account.id,
        type: 'skill',
        title: skillGroup.title,
        description: skillGroup.description,
        highlights: skillGroup.highlights,
        src: 'github',
      });
      results.push(skillComponent);
    }

    // Save top repositories as project components (based on stars and activity)
    // Limit to top projects from topProjects array (already sorted by stars)
    const topRepos = githubData.topProjects?.slice(0, 10) || githubData.repositories.slice(0, 10);

    for (const repo of topRepos) {
      const repoComponent = await this.createComponent({
        user_id: userId,
        account_id: account.id,
        type: 'project',
        title: repo.name,
        organization: githubData.profile.login,
        description: repo.description || 'No description',
        highlights: [
          `Language: ${repo.language || 'N/A'}`,
          `Stars: ${repo.stars || repo.stargazers_count || 0}`,
          `Forks: ${repo.forks || repo.forks_count || 0}`,
          ...(repo.topics || []).map((t: string) => `Topic: ${t}`),
        ],
        src: 'github',
      });
      results.push(repoComponent);
    }

    return {
      accountId: account.id,
      componentIds: results.map(r => r.id),
      totalSaved: results.length,
      skillGroups: languageGroups.length,
      projects: topRepos.length,
    };
  }

  /**
   * Group GitHub languages into 3-5 general skill components
   * Groups similar languages/technologies together
   */
  private static groupGitHubLanguagesIntoSkills(githubData: any): Array<{
    title: string;
    description: string;
    highlights: string[];
  }> {
    const profile = githubData.profile;
    const languageStats = githubData.languageStats;
    const repos = githubData.repositories || [];

    // Extract all technologies from languages and topics
    const primaryLanguages = languageStats?.primaryLanguages || [];
    const allTopics = new Set<string>();
    repos.forEach((repo: any) => {
      (repo.topics || []).forEach((topic: string) => allTopics.add(topic));
    });

    // Define technology domains (broader categories)
    const domains = {
      'Frontend Development': {
        languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'React', 'Angular', 'Svelte'],
        keywords: ['frontend', 'web', 'ui', 'react', 'vue', 'angular', 'next', 'nuxt', 'css', 'tailwind', 'bootstrap'],
      },
      'Backend Development': {
        languages: ['Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#', 'Rust', 'Kotlin', 'Scala'],
        keywords: ['backend', 'api', 'server', 'django', 'flask', 'spring', 'express', 'fastapi', 'node'],
      },
      'Mobile Development': {
        languages: ['Swift', 'Kotlin', 'Dart', 'Objective-C'],
        keywords: ['mobile', 'android', 'ios', 'flutter', 'react-native', 'swiftui'],
      },
      'Data Science & AI': {
        languages: ['Python', 'R', 'Julia'],
        keywords: ['ml', 'machine-learning', 'ai', 'deep-learning', 'data-science', 'tensorflow', 'pytorch', 'sklearn', 'pandas', 'numpy'],
      },
      'DevOps & Cloud': {
        languages: ['Shell', 'PowerShell', 'Dockerfile'],
        keywords: ['devops', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'ci-cd', 'terraform', 'ansible'],
      },
      'Database & Data Engineering': {
        languages: ['SQL', 'PLpgSQL'],
        keywords: ['database', 'sql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'data'],
      },
    };

    // Map languages and topics to domains
    const domainMatches: Record<string, {
      languages: Set<string>;
      topics: Set<string>;
      repoCount: number;
    }> = {};

    primaryLanguages.forEach((lang: any) => {
      for (const [domain, config] of Object.entries(domains)) {
        if (config.languages.includes(lang.language)) {
          if (!domainMatches[domain]) {
            domainMatches[domain] = { languages: new Set(), topics: new Set(), repoCount: 0 };
          }
          domainMatches[domain].languages.add(lang.language);
          domainMatches[domain].repoCount += lang.count;
        }
      }
    });

    // Match topics to domains
    allTopics.forEach(topic => {
      for (const [domain, config] of Object.entries(domains)) {
        if (config.keywords.some(kw => topic.toLowerCase().includes(kw))) {
          if (!domainMatches[domain]) {
            domainMatches[domain] = { languages: new Set(), topics: new Set(), repoCount: 0 };
          }
          domainMatches[domain].topics.add(topic);
        }
      }
    });

    // Create skill components (limit to 3-5)
    const skillGroups = Object.entries(domainMatches)
      .filter(([_, data]) => data.languages.size > 0 || data.topics.size > 0)
      .sort((a, b) => b[1].repoCount - a[1].repoCount)
      .slice(0, 5)
      .map(([domain, data]) => {
        const languages = Array.from(data.languages);
        const topics = Array.from(data.topics).slice(0, 8); // Limit topics

        return {
          title: domain,
          description: `Experienced in ${domain.toLowerCase()} with ${data.repoCount} project${data.repoCount !== 1 ? 's' : ''} using ${languages.join(', ')}`,
          highlights: [
            `Languages: ${languages.join(', ') || 'N/A'}`,
            `Projects: ${data.repoCount}`,
            ...(topics.length > 0 ? [`Technologies: ${topics.join(', ')}`] : []),
            `GitHub: @${profile.login}`,
          ],
        };
      });

    // If we have fewer than 3 skill groups, add a general "Software Development" skill
    if (skillGroups.length < 3 && primaryLanguages.length > 0) {
      const allLanguages = primaryLanguages.slice(0, 10).map((l: any) => l.language);
      skillGroups.push({
        title: 'Software Development',
        description: `Software engineer with experience in ${allLanguages.slice(0, 3).join(', ')} and ${githubData.statistics.totalStars} GitHub stars across ${githubData.statistics.repositoryTypes.original} original repositories`,
        highlights: [
          `Languages: ${allLanguages.join(', ')}`,
          `Total Stars: ${githubData.statistics.totalStars}`,
          `Public Repos: ${profile.public_repos}`,
          `Followers: ${profile.followers}`,
        ],
      });
    }

    return skillGroups.slice(0, 5); // Ensure max 5 skill components
  }

  static async saveYouTubeData(userId: string, youtubeData: any) {
    const results = [];

    // Save channel as skill
    const channelComponent = await this.createComponent({
      user_id: userId,
      type: 'skill',
      title: 'YouTube Channel',
      description: youtubeData.channel.description,
      highlights: [
        `Subscribers: ${youtubeData.channel.subscriberCount || 0}`,
        `Videos: ${youtubeData.channel.videoCount || 0}`,
        `Views: ${youtubeData.channel.viewCount || 0}`,
      ],
      src: 'youtube',
    });
    results.push(channelComponent);

    // Save videos as projects
    for (const video of youtubeData.videos) {
      const videoComponent = await this.createComponent({
        user_id: userId,
        type: 'project',
        title: video.title,
        description: video.description,
        highlights: [
          `Views: ${video.viewCount || 0}`,
          `Likes: ${video.likeCount || 0}`,
          `Published: ${video.publishedAt || 'N/A'}`,
        ],
        src: 'youtube',
      });
      results.push(videoComponent);
    }

    return {
      componentIds: results.map(r => r.id),
      totalSaved: results.length,
    };
  }

  static async saveLinkedInData(userId: string, linkedinData: any) {
    const results = [];

    // Get or create LinkedIn account
    let account = await this.getAccountByProvider(userId, 'linkedin');
    if (!account && linkedinData.profile.id) {
      account = await this.createAccount({
        user_id: userId,
        provider: 'linkedin',
        provider_account_id: linkedinData.profile.id,
      });
    }

    // Save experiences
    for (const exp of linkedinData.experiences || []) {
      const expComponent = await this.createComponent({
        user_id: userId,
        account_id: account?.id,
        type: 'experience',
        title: exp.title,
        organization: exp.company,
        start_date: exp.startDate,
        end_date: exp.endDate,
        description: exp.description || '',
        highlights: (exp.skills || []).map((s: string) => `Skill: ${s}`),
        src: 'linkedin',
      });
      results.push(expComponent);
    }

    // Save education
    for (const edu of linkedinData.education || []) {
      const eduComponent = await this.createComponent({
        user_id: userId,
        account_id: account?.id,
        type: 'education',
        title: edu.degree || 'Degree',
        organization: edu.school,
        start_date: edu.startDate,
        end_date: edu.endDate,
        description: `${edu.field || ''} - ${edu.description || ''}`,
        highlights: [],
        src: 'linkedin',
      });
      results.push(eduComponent);
    }

    // Save skills
    for (const skill of linkedinData.skills || []) {
      const skillComponent = await this.createComponent({
        user_id: userId,
        account_id: account?.id,
        type: 'skill',
        title: skill.name || skill,
        description: typeof skill === 'object' ? skill.endorsements : '',
        highlights: [],
        src: 'linkedin',
      });
      results.push(skillComponent);
    }

    return {
      accountId: account?.id,
      componentCounts: {
        experiences: (linkedinData.experiences || []).length,
        education: (linkedinData.education || []).length,
        skills: (linkedinData.skills || []).length,
      },
      totalSaved: results.length,
    };
  }

  /**
   * Vector search operations
   */
  static async similaritySearchComponents(
    userId: string,
    embedding: number[],
    limit: number = 10
  ): Promise<Component[]> {
    // Try using SQL function first
    const { data, error } = await this.supabase.rpc('match_components', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
      user_id_param: userId,
    });

    // If SQL function doesn't exist, use fallback
    if (error && error.message.includes('function match_components')) {
      console.warn('⚠️ match_components function not found, using fallback search');
      return this.fallbackComponentSearch(userId, embedding, limit);
    }

    if (error) throw error;
    return data || [];
  }

  /**
   * Fallback search when SQL function is not available
   * Fetches all components and calculates similarity in JavaScript
   */
  private static async fallbackComponentSearch(
    userId: string,
    queryEmbedding: number[],
    limit: number
  ): Promise<Component[]> {
    // Get all components for user
    const { data: components, error } = await this.supabase
      .from('components')
      .select()
      .eq('user_id', userId)
      .not('embedding', 'is', null);

    if (error) throw error;
    if (!components || components.length === 0) return [];

    // Calculate similarity for each component
    const withSimilarity = components.map((comp: any) => {
      const similarity = comp.embedding 
        ? this.calculateCosineSimilarity(queryEmbedding, comp.embedding)
        : 0;
      return { ...comp, similarity };
    });

    // Sort by similarity and return top N
    return withSimilarity
      .filter(c => c.similarity > 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private static calculateCosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  static async similaritySearchJobDescriptions(
    userId: string,
    embedding: number[],
    limit: number = 5
  ): Promise<any[]> {
    // Try using SQL function first
    const { data, error } = await this.supabase.rpc('match_cvs', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
      user_id_param: userId,
    });

    // If SQL function doesn't exist, use fallback
    if (error && error.message.includes('function match_cvs')) {
      console.warn('⚠️ match_cvs function not found, using fallback search');
      const cvs = await this.getCVsByUserId(userId);
      return cvs.slice(0, limit).map((cv: any) => ({
        id: cv.id,
        user_id: cv.user_id,
        title: cv.title,
        raw_text: cv.job_description,
        parsed_data: cv.content,
        created_at: cv.created_at,
        updated_at: cv.updated_at,
        similarity: 0.5, // Default similarity when no embedding search
      }));
    }

    if (error) throw error;
    return (data || []).map((cv: any) => ({
      id: cv.id,
      user_id: cv.user_id,
      title: cv.title,
      raw_text: cv.job_description,
      parsed_data: cv.content,
      created_at: cv.created_at,
      updated_at: cv.updated_at,
      similarity: cv.similarity,
    }));
  }
}
