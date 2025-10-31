import { githubTool } from '@/mastra/tools/github-tool';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { EmbeddingService } from './embedding-service';
import { SupabaseService } from './supabase-service';
import type { Component } from '@/lib/supabase';

/**
 * GitHub Component Service
 * Crawls GitHub profile and converts data into CV components with embeddings
 */
export class GitHubComponentService {
  /**
   * Crawl GitHub profile and create components
   */
  static async crawlAndCreateComponents(
    userId: string,
    githubUsername: string,
    options?: {
      includeReadme?: boolean;
      maxRepos?: number;
      onProgress?: (message: string, current: number, total: number) => void;
    }
  ): Promise<{
    success: boolean;
    componentsCreated: number;
    errors: Array<{ type: string; error: string }>;
    profile?: any;
  }> {
    const includeReadme = options?.includeReadme !== false;
    const maxRepos = options?.maxRepos || 50;
    const onProgress = options?.onProgress;

    try {
      console.log(`🚀 Starting GitHub crawl for: ${githubUsername}`);
      onProgress?.('Fetching GitHub data...', 0, 100);

      // Call GitHub tool
      const runtimeContext = new RuntimeContext();
      const result = await githubTool.execute({
        context: {
          username: githubUsername,
          includeReadme,
          maxRepos,
        },
        runtimeContext,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch GitHub data');
      }

      const { profile, repositories, languageStats, topProjects, statistics } = result.data;

      console.log(`✅ Fetched ${repositories.length} repositories`);
      onProgress?.('Converting to components...', 20, 100);

      const componentsCreated: Component[] = [];
      const errors: Array<{ type: string; error: string }> = [];

      // 1. Create profile/bio component (if bio exists)
      if (profile.bio) {
        try {
          const bioComponent = await this.createProfileComponent(userId, profile);
          componentsCreated.push(bioComponent);
          console.log(`✓ Created profile component`);
        } catch (error: any) {
          errors.push({ type: 'profile', error: error.message });
        }
      }

      onProgress?.('Creating project components...', 30, 100);

      // 2. Create project components from top repositories
      const projectsToProcess = topProjects.slice(0, 10); // Top 10 projects
      for (let i = 0; i < projectsToProcess.length; i++) {
        const project = projectsToProcess[i];
        try {
          const projectComponent = await this.createProjectComponent(
            userId,
            project,
            repositories.find((r) => r.name === project.name)
          );
          componentsCreated.push(projectComponent);
          console.log(`✓ Created project: ${project.name}`);
        } catch (error: any) {
          errors.push({ type: 'project', error: error.message });
        }

        // Update progress
        const progress = 30 + ((i + 1) / projectsToProcess.length) * 50;
        onProgress?.(`Creating projects... (${i + 1}/${projectsToProcess.length})`, progress, 100);
      }

      onProgress?.('Creating skill components...', 80, 100);

      // 3. Create skill components from primary languages
      const skillsToProcess = languageStats.primaryLanguages.slice(0, 10); // Top 10 languages
      for (let i = 0; i < skillsToProcess.length; i++) {
        const lang = skillsToProcess[i];
        try {
          const skillComponent = await this.createSkillComponent(userId, lang, repositories);
          componentsCreated.push(skillComponent);
          console.log(`✓ Created skill: ${lang.language}`);
        } catch (error: any) {
          errors.push({ type: 'skill', error: error.message });
        }

        // Update progress
        const progress = 80 + ((i + 1) / skillsToProcess.length) * 20;
        onProgress?.(`Creating skills... (${i + 1}/${skillsToProcess.length})`, progress, 100);
      }

      onProgress?.('Complete!', 100, 100);

      console.log(`✅ Created ${componentsCreated.length} components total`);
      console.log(`   Profile: 1, Projects: ${topProjects.length}, Skills: ${skillsToProcess.length}`);

      if (errors.length > 0) {
        console.warn(`⚠️ ${errors.length} errors occurred during conversion`);
      }

      return {
        success: true,
        componentsCreated: componentsCreated.length,
        errors,
        profile,
      };
    } catch (error: any) {
      console.error('❌ GitHub crawl error:', error.message);
      return {
        success: false,
        componentsCreated: 0,
        errors: [{ type: 'general', error: error.message }],
      };
    }
  }

  /**
   * Create profile/bio component
   */
  private static async createProfileComponent(
    userId: string,
    profile: any
  ): Promise<Component> {
    const title = profile.name || profile.login;
    const description = [
      profile.bio,
      profile.company ? `Company: ${profile.company}` : null,
      profile.location ? `Location: ${profile.location}` : null,
      profile.blog ? `Website: ${profile.blog}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const highlights = [
      `${profile.followers} followers on GitHub`,
      `${profile.public_repos} public repositories`,
      profile.email ? `Email: ${profile.email}` : null,
    ].filter(Boolean) as string[];

    // Generate embedding
    const embeddingText = `${title} - ${description} ${highlights.join(', ')}`;
    const embedding = await EmbeddingService.embed(embeddingText);

    // Create component in database
    const component = await SupabaseService.createComponent({
      user_id: userId,
      type: 'education', // Use education type for profile/bio
      title: title,
      organization: 'GitHub Profile',
      description: description,
      highlights: highlights,
      embedding,
      src: 'github',
    });

    return component;
  }

  /**
   * Create project component from repository
   */
  private static async createProjectComponent(
    userId: string,
    project: any,
    repoDetails?: any
  ): Promise<Component> {
    const title = project.name.replace(/-/g, ' ').replace(/_/g, ' ');

    // Build description
    let description = project.description || 'GitHub repository';

    // Add README summary if available
    if (repoDetails?.readme) {
      // Take first 200 characters of README
      const readmeSummary = repoDetails.readme
        .replace(/[#*`]/g, '') // Remove markdown formatting
        .substring(0, 300)
        .trim();
      if (readmeSummary) {
        description += `\n\n${readmeSummary}...`;
      }
    }

    const highlights = [
      project.language ? `Built with ${project.language}` : null,
      project.stars > 0 ? `⭐ ${project.stars} stars` : null,
      project.topics.length > 0 ? `Topics: ${project.topics.join(', ')}` : null,
      repoDetails ? `Repository: ${repoDetails.url}` : `Repository: ${project.url}`,
    ].filter(Boolean) as string[];

    // Generate embedding
    const embeddingText = `${title} - ${description} ${highlights.join(', ')}`;
    const embedding = await EmbeddingService.embed(embeddingText);

    // Create component in database
    const component = await SupabaseService.createComponent({
      user_id: userId,
      type: 'project',
      title: title,
      organization: 'GitHub',
      description: description,
      highlights: highlights,
      embedding,
      src: 'github',
    });

    return component;
  }

  /**
   * Create skill component from language
   */
  private static async createSkillComponent(
    userId: string,
    languageStat: { language: string; count: number; percentage: number },
    repositories: any[]
  ): Promise<Component> {
    const { language, count, percentage } = languageStat;

    // Find repositories using this language
    const reposWithLang = repositories
      .filter((r) => r.language === language)
      .slice(0, 5); // Top 5 repos

    const description = `Experienced in ${language} with ${count} repositories (${percentage}% of total projects)`;

    const highlights = [
      `${count} projects using ${language}`,
      reposWithLang.length > 0
        ? `Projects: ${reposWithLang.map((r) => r.name).join(', ')}`
        : null,
      ...reposWithLang.map((r) => (r.stars > 0 ? `${r.name}: ⭐ ${r.stars} stars` : null)),
    ].filter(Boolean) as string[];

    // Generate embedding
    const embeddingText = `${language} - ${description} ${highlights.join(', ')}`;
    const embedding = await EmbeddingService.embed(embeddingText);

    // Create component in database
    const component = await SupabaseService.createComponent({
      user_id: userId,
      type: 'skill',
      title: language,
      organization: 'GitHub',
      description: description,
      highlights: highlights.slice(0, 5), // Limit to 5 highlights
      embedding,
      src: 'github',
    });

    return component;
  }
}
