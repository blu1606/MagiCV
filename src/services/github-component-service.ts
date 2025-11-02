import { githubTool } from '@/mastra/tools';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { EmbeddingService } from './embedding-service';
import { SupabaseService } from './supabase-service';
import type { Component } from '@/lib/supabase';

type LanguageStat = { language: string; count: number; percentage: number };

type GithubRepository = {
  name: string;
  description?: string;
  language?: string;
  stars: number;
  url: string;
  topics: string[];
  readme?: string;
};

type GithubProjectSummary = {
  name: string;
  description?: string;
  stars: number;
  url: string;
  language?: string;
  topics: string[];
};

type AggregatedSkillCategory = {
  id: string;
  name: string;
  summary: string;
  technologies: string[];
  repoCount: number;
  notableProjects: string[];
  languageBreakdown: Array<{ language: string; count: number; percentage: number }>;
  totalPercentage: number;
};

type CategoryDefinition = {
  id: string;
  title: string;
  summary: string;
  keywords: {
    languages?: string[];
    topics?: string[];
    text?: string[];
  };
};

type CategoryAggregateInternal = {
  definition: CategoryDefinition;
  score: number;
  repoMap: Map<string, { name: string; stars: number; url: string }>;
  technologies: Map<string, number>;
  languageMap: Map<string, { count: number; percentage: number }>;
  totalPercentage: number;
};

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    summary: 'Interactive web interfaces, design systems, and client-side architecture.',
    keywords: {
      languages: ['javascript', 'typescript', 'html', 'css'],
      topics: [
        'frontend',
        'front-end',
        'react',
        'nextjs',
        'next.js',
        'vue',
        'nuxt',
        'angular',
        'svelte',
        'tailwind',
        'ui',
        'ux',
        'design-system',
        'web',
        'storybook'
      ],
      text: ['component', 'ui', 'ux', 'frontend', 'front-end', 'web app', 'design system']
    }
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Platforms',
    summary: 'End-to-end product delivery spanning client, API, and integration layers.',
    keywords: {
      languages: ['typescript', 'javascript', 'python', 'go', 'java', 'ruby', 'php', 'csharp'],
      topics: [
        'fullstack',
        'full-stack',
        'webapp',
        'web-app',
        'saas',
        'integration',
        'nodejs',
        'node.js',
        'nestjs',
        'express',
        'graphql',
        'rest',
        'api',
        'apis',
        'microservice',
        'microservices'
      ],
      text: ['fullstack', 'full-stack', 'end-to-end', 'platform', 'product']
    }
  },
  {
    id: 'backend',
    title: 'Backend & APIs',
    summary: 'Scalable services, data models, and resilient API design.',
    keywords: {
      languages: ['python', 'go', 'java', 'csharp', 'scala', 'rust', 'kotlin', 'php', 'typescript', 'javascript'],
      topics: [
        'backend',
        'back-end',
        'api',
        'apis',
        'serverless',
        'microservice',
        'database',
        'sql',
        'graphql',
        'rest',
        'fastapi',
        'spring',
        'django',
        'flask',
        'nest',
        'prisma',
        'typeorm'
      ],
      text: ['backend', 'back-end', 'api', 'service', 'microservice', 'database']
    }
  },
  {
    id: 'data-ai',
    title: 'AI & Data Science',
    summary: 'Machine learning systems, analytics pipelines, and data processing.',
    keywords: {
      languages: ['python', 'r', 'julia', 'scala'],
      topics: [
        'ai',
        'ml',
        'machine-learning',
        'deep-learning',
        'data',
        'analytics',
        'pytorch',
        'tensorflow',
        'scikit-learn',
        'numpy',
        'pandas',
        'langchain',
        'huggingface',
        'llm',
        'nlp',
        'computer-vision',
        'cv'
      ],
      text: ['machine learning', 'data science', 'analytics', 'mlops', 'ai']
    }
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud Infrastructure',
    summary: 'Cloud platforms, CI/CD automation, and container orchestration.',
    keywords: {
      languages: ['go', 'python', 'typescript', 'javascript', 'bash', 'shell'],
      topics: [
        'devops',
        'cloud',
        'aws',
        'azure',
        'gcp',
        'kubernetes',
        'docker',
        'terraform',
        'infrastructure',
        'ci',
        'cd',
        'github-actions',
        'helm',
        'serverless',
        'iac',
        'observability',
        'monitoring'
      ],
      text: ['deployment', 'infrastructure', 'cloud', 'ci/cd', 'automation']
    }
  },
  {
    id: 'mobile',
    title: 'Mobile Engineering',
    summary: 'Native and cross-platform mobile application development.',
    keywords: {
      languages: ['swift', 'kotlin', 'java', 'dart', 'objectivec', 'csharp'],
      topics: ['mobile', 'android', 'ios', 'react-native', 'flutter'],
      text: ['mobile', 'android', 'ios']
    }
  },
  {
    id: 'automation',
    title: 'Automation & Tooling',
    summary: 'Developer tooling, scripting workflows, and productivity automation.',
    keywords: {
      languages: ['python', 'typescript', 'javascript', 'bash', 'shell', 'ruby'],
      topics: [
        'automation',
        'scripting',
        'cli',
        'tooling',
        'workflow',
        'productivity',
        'infrastructure',
        'testing',
        'ci',
        'cd'
      ],
      text: ['automation', 'tooling', 'workflow', 'productivity', 'scripting']
    }
  },
  {
    id: 'security',
    title: 'Security & Reliability',
    summary: 'Secure coding practices, platform hardening, and reliability engineering.',
    keywords: {
      languages: ['rust', 'go', 'c', 'cpp', 'python'],
      topics: [
        'security',
        'infosec',
        'encryption',
        'crypto',
        'penetration-testing',
        'threat',
        'reliability',
        'site-reliability',
        'sre',
        'observability'
      ],
      text: ['security', 'reliability', 'sre', 'observability']
    }
  }
];

const FALLBACK_SKILL_CATEGORY: AggregatedSkillCategory = {
  id: 'software',
  name: 'Software Engineering',
  summary: 'End-to-end software development across multiple stacks and product surfaces.',
  technologies: [],
  repoCount: 0,
  notableProjects: [],
  languageBreakdown: [],
  totalPercentage: 0
};

const CATEGORY_LOOKUP = new Map(CATEGORY_DEFINITIONS.map((definition) => [definition.id, definition]));

const LANGUAGE_TO_CATEGORY_MAP: Record<string, string[]> = {
  javascript: ['frontend', 'fullstack', 'automation'],
  typescript: ['frontend', 'backend', 'fullstack'],
  html: ['frontend', 'fullstack'],
  css: ['frontend', 'fullstack'],
  python: ['backend', 'data-ai', 'automation'],
  go: ['backend', 'devops', 'security'],
  java: ['backend', 'fullstack'],
  csharp: ['backend', 'fullstack'],
  ruby: ['backend', 'fullstack'],
  php: ['backend', 'fullstack'],
  rust: ['backend', 'security'],
  kotlin: ['backend', 'mobile', 'fullstack'],
  swift: ['mobile', 'fullstack'],
  dart: ['mobile', 'fullstack'],
  cpp: ['backend', 'security'],
  c: ['backend', 'security'],
  scala: ['backend', 'data-ai'],
  r: ['data-ai'],
  julia: ['data-ai'],
  sql: ['backend', 'data-ai'],
  shell: ['automation', 'devops'],
  bash: ['automation', 'devops'],
  powershell: ['automation'],
  dockerfile: ['devops', 'automation'],
  makefile: ['automation'],
  fsharp: ['backend', 'automation'],
  objectivec: ['mobile', 'fullstack'],
  jupyter_notebook: ['data-ai', 'fullstack'],
};

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

      const skillCategories = this.buildSkillCategories(
        languageStats.primaryLanguages,
        repositories,
        topProjects
      );
      const skillsToProcess = skillCategories.slice(0, 5);

      for (let i = 0; i < skillsToProcess.length; i++) {
        const category = skillsToProcess[i];
        try {
          const skillComponent = await this.createSkillComponent(userId, category);
          componentsCreated.push(skillComponent);
          console.log(`✓ Created skill category: ${category.name}`);
        } catch (error: any) {
          errors.push({ type: 'skill', error: error.message });
        }

        const progressBase = skillsToProcess.length === 0 ? 100 : 80 + ((i + 1) / skillsToProcess.length) * 20;
        onProgress?.(
          `Creating skills... (${Math.min(i + 1, skillsToProcess.length)}/${skillsToProcess.length || 1})`,
          progressBase,
          100
        );
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

  private static buildSkillCategories(
    languageStats: LanguageStat[] = [],
    repositories: GithubRepository[] = [],
    topProjects: GithubProjectSummary[] = []
  ): AggregatedSkillCategory[] {
    const aggregateMap: Record<string, CategoryAggregateInternal> = {};
    const ensureAggregate = (definition: CategoryDefinition): CategoryAggregateInternal => {
      if (!aggregateMap[definition.id]) {
        aggregateMap[definition.id] = {
          definition,
          score: 0,
          repoMap: new Map(),
          technologies: new Map(),
          languageMap: new Map(),
          totalPercentage: 0,
        };
      }
      return aggregateMap[definition.id];
    };

    const overallTechnologies = new Map<string, number>();
    const overallLanguageMap = new Map<string, { count: number; percentage: number }>();

    for (const stat of languageStats || []) {
      if (!stat || !stat.language) continue;
      const language = stat.language.trim();
      if (!language) continue;

      const categories = this.getCategoriesForLanguage(language);
      const languageEntry = overallLanguageMap.get(language) || { count: 0, percentage: 0 };
      languageEntry.count += stat.count;
      languageEntry.percentage = Math.max(languageEntry.percentage, stat.percentage ?? 0);
      overallLanguageMap.set(language, languageEntry);

      this.recordTechnology(overallTechnologies, language, stat.count);

      for (const categoryId of categories) {
        const definition = this.getCategoryDefinition(categoryId);
        if (!definition) continue;

        const aggregate = ensureAggregate(definition);
        const entry = aggregate.languageMap.get(language) || { count: 0, percentage: 0 };
        entry.count += stat.count;
        entry.percentage = Math.max(entry.percentage, stat.percentage ?? 0);
        aggregate.languageMap.set(language, entry);
        aggregate.totalPercentage += stat.percentage ?? 0;
        this.recordTechnology(aggregate.technologies, language, stat.count * 2);
        aggregate.score += stat.count * 2 + (stat.percentage ?? 0) / 5;
      }
    }

    for (const repo of repositories || []) {
      if (!repo) continue;

      if (repo.language) {
        this.recordTechnology(overallTechnologies, repo.language, 1);
      }
      for (const topic of repo.topics || []) {
        this.recordTechnology(overallTechnologies, this.formatTechnology(topic), 1);
      }

      const repoLanguageKey = repo.language ? this.normalizeLanguageKey(repo.language) : undefined;
      const topics = (repo.topics || []).map((topic) => topic.toLowerCase());
      const text = `${repo.description ?? ''} ${(repo.readme ?? '').slice(0, 400)}`.toLowerCase();

      const matchedIds = CATEGORY_DEFINITIONS.filter((definition) =>
        this.matchesRepository(definition, repoLanguageKey, topics, text)
      ).map((definition) => definition.id);

      const fallbackIds =
        matchedIds.length > 0 ? matchedIds : this.getCategoriesForLanguage(repo.language ?? '');

      const categoryIds = Array.from(new Set(fallbackIds));
      for (const categoryId of categoryIds) {
        const definition = this.getCategoryDefinition(categoryId);
        if (!definition) continue;

        const aggregate = ensureAggregate(definition);
        if (!aggregate.repoMap.has(repo.name)) {
          aggregate.repoMap.set(repo.name, { name: repo.name, stars: repo.stars, url: repo.url });
          aggregate.score += 5;
        }
        aggregate.score += Math.min(repo.stars, 250) / 25;

        if (repo.language) {
          this.recordTechnology(aggregate.technologies, repo.language, 3);
        }
        for (const topic of repo.topics || []) {
          this.recordTechnology(aggregate.technologies, this.formatTechnology(topic), 1);
        }
      }
    }

    const fallbackCategory = this.buildFallbackCategory(
      overallLanguageMap,
      overallTechnologies,
      repositories,
      topProjects
    );

    const aggregated = Object.values(aggregateMap)
      .map((aggregate) => {
        const languageBreakdown = Array.from(aggregate.languageMap.entries()).map(
          ([language, data]) => ({
            language,
            count: data.count,
            percentage: data.percentage ?? 0,
          })
        );
        const totalPercentage = languageBreakdown.reduce(
          (acc, item) => acc + (item.percentage ?? 0),
          0
        );
        return {
          id: aggregate.definition.id,
          name: aggregate.definition.title,
          summary: aggregate.definition.summary,
          technologies: this.pickTopTechnologies(aggregate.technologies, 10),
          repoCount: aggregate.repoMap.size,
          notableProjects: this.pickTopProjects(aggregate.repoMap, 3),
          languageBreakdown,
          totalPercentage: totalPercentage > 0 ? Math.min(Math.round(totalPercentage), 100) : 0,
          score: aggregate.score,
        };
      })
      .filter(
        (category) =>
          category.score > 0 &&
          (category.repoCount > 0 || category.languageBreakdown.length > 0)
      )
      .sort((a, b) => b.score - a.score);

    let selected = aggregated.map(({ score, ...rest }) => rest);

    const hasFallback = selected.some((category) => category.id === fallbackCategory.id);
    if (!hasFallback && (fallbackCategory.repoCount > 0 || fallbackCategory.languageBreakdown.length > 0)) {
      selected = [fallbackCategory, ...selected];
    } else if (hasFallback) {
      selected = selected.map((category) =>
        category.id === fallbackCategory.id ? fallbackCategory : category
      );
    }

    if (selected.length === 0 && (fallbackCategory.repoCount > 0 || fallbackCategory.languageBreakdown.length > 0)) {
      selected = [fallbackCategory];
    }

    selected = selected.slice(0, 5);

    if (selected.length < 3) {
      selected = this.ensureMinimumSkillCategories(selected, fallbackCategory);
    }

    return selected.slice(0, 5);
  }

  private static ensureMinimumSkillCategories(
    categories: AggregatedSkillCategory[],
    fallbackCategory: AggregatedSkillCategory
  ): AggregatedSkillCategory[] {
    const existing = [...categories];
    const seen = new Set(existing.map((category) => category.id));

    if (!seen.has(fallbackCategory.id) && (fallbackCategory.repoCount > 0 || fallbackCategory.languageBreakdown.length > 0)) {
      existing.unshift(fallbackCategory);
      seen.add(fallbackCategory.id);
    }

    const derivedConfigs = [
      {
        id: 'product-delivery',
        name: 'Product Delivery & Execution',
        summary: 'Translating requirements into shipped features with rapid iteration and tight feedback loops.',
      },
      {
        id: 'technical-enablement',
        name: 'Technical Enablement & Tooling',
        summary: 'Improving engineering velocity through automation, quality gates, and developer tooling.',
      },
    ];

    for (const config of derivedConfigs) {
      if (existing.length >= 3) break;
      if (seen.has(config.id)) continue;

      existing.push({
        id: config.id,
        name: config.name,
        summary: config.summary,
        technologies: fallbackCategory.technologies.slice(0, 6),
        repoCount: fallbackCategory.repoCount,
        notableProjects: fallbackCategory.notableProjects.slice(0, 3),
        languageBreakdown: fallbackCategory.languageBreakdown.slice(0, 4),
        totalPercentage: fallbackCategory.totalPercentage,
      });
      seen.add(config.id);
    }

    return existing.slice(0, 5);
  }

  private static buildFallbackCategory(
    languageMap: Map<string, { count: number; percentage: number }>,
    technologyMap: Map<string, number>,
    repositories: GithubRepository[] = [],
    topProjects: GithubProjectSummary[] = []
  ): AggregatedSkillCategory {
    const languages = Array.from(languageMap.entries()).map(([language, data]) => ({
      language,
      count: data.count,
      percentage: data.percentage ?? 0,
    }));
    const totalPercentage = languages.reduce((acc, item) => acc + (item.percentage ?? 0), 0);

    const projectMap = new Map<string, { name: string; stars: number; url: string }>();
    for (const project of topProjects || []) {
      if (!project) continue;
      projectMap.set(project.name, {
        name: project.name,
        stars: project.stars,
        url: project.url,
      });
    }
    if (projectMap.size === 0) {
      for (const repo of repositories || []) {
        if (!repo) continue;
        if (!projectMap.has(repo.name)) {
          projectMap.set(repo.name, {
            name: repo.name,
            stars: repo.stars,
            url: repo.url,
          });
        }
      }
    }

    return {
      id: FALLBACK_SKILL_CATEGORY.id,
      name: FALLBACK_SKILL_CATEGORY.name,
      summary: FALLBACK_SKILL_CATEGORY.summary,
      technologies: this.pickTopTechnologies(technologyMap, 10),
      repoCount: repositories?.length ?? 0,
      notableProjects: this.pickTopProjects(projectMap, 3),
      languageBreakdown: languages,
      totalPercentage: totalPercentage > 0 ? Math.min(Math.round(totalPercentage), 100) : 0,
    };
  }

  private static normalizeLanguageKey(language: string): string {
    const lower = language.toLowerCase().trim();
    if (lower === 'c#' || lower === 'c sharp') return 'csharp';
    if (lower === 'c++' || lower === 'cpp') return 'cpp';
    if (lower === 'objective-c' || lower === 'objective c' || lower === 'objective-c++') return 'objectivec';
    if (lower === 'f#' || lower === 'f sharp') return 'fsharp';
    if (lower === 'jupyter notebook') return 'jupyter_notebook';
    return lower.replace(/[^a-z0-9]+/g, '_');
  }

  private static getCategoriesForLanguage(language: string): string[] {
    if (!language) {
      return ['fullstack', 'backend', 'automation'];
    }
    const normalized = this.normalizeLanguageKey(language);
    const categories = LANGUAGE_TO_CATEGORY_MAP[normalized] || [];
    const set = new Set<string>(categories);
    if (set.size === 0) {
      set.add('fullstack');
      set.add('backend');
    }
    if (set.size < 3) {
      set.add('automation');
    }
    return Array.from(set);
  }

  private static getCategoryDefinition(categoryId: string): CategoryDefinition | undefined {
    return CATEGORY_LOOKUP.get(categoryId);
  }

  private static matchesRepository(
    definition: CategoryDefinition,
    repoLanguageKey: string | undefined,
    topics: string[],
    text: string
  ): boolean {
    const languageMatch =
      repoLanguageKey && definition.keywords.languages?.includes(repoLanguageKey);
    const topicMatch =
      topics.length > 0 &&
      (definition.keywords.topics || []).some((keyword) => topics.includes(keyword));
    const textMatch =
      (definition.keywords.text || []).some((keyword) => text.includes(keyword));

    return Boolean(languageMatch || topicMatch || textMatch);
  }

  private static recordTechnology(techMap: Map<string, number>, label: string, weight = 1) {
    if (!label) return;
    const formatted = label.trim();
    if (!formatted) return;
    techMap.set(formatted, (techMap.get(formatted) || 0) + weight);
  }

  private static pickTopTechnologies(techMap: Map<string, number>, limit = 8): string[] {
    return Array.from(techMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, limit);
  }

  private static pickTopProjects(
    repoMap: Map<string, { name: string; stars: number; url: string }>,
    limit = 3
  ): string[] {
    return Array.from(repoMap.values())
      .sort((a, b) => b.stars - a.stars)
      .map((repo) => repo.name)
      .slice(0, limit);
  }

  private static formatTechnology(value: string): string {
    if (!value) return value;
    return value
      .replace(/[_-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Create skill component from aggregated category
   */
  private static async createSkillComponent(
    userId: string,
    category: AggregatedSkillCategory
  ): Promise<Component> {
    const { name, summary, technologies, repoCount, notableProjects, languageBreakdown, totalPercentage } =
      category;

    const keyTechnologies = technologies.slice(0, 6);
    const supportingTechnologies = technologies.slice(6, 12);
    const languageSummary = languageBreakdown
      .slice(0, 4)
      .map((item) => {
        const percentage =
          typeof item.percentage === 'number' && item.percentage > 0
            ? `${Math.round(item.percentage)}%`
            : `${item.count} repos`;
        return `${item.language} (${percentage})`;
      })
      .join(', ');

    const descriptionParts = [
      summary,
      repoCount > 0
        ? `Drawn from ${repoCount} repositories${
            totalPercentage ? ` covering approximately ${Math.min(Math.round(totalPercentage), 100)}% of the portfolio` : ''
          }.`
        : null,
      keyTechnologies.length > 0 ? `Key technologies: ${keyTechnologies.join(', ')}.` : null,
    ].filter(Boolean);

    const description = descriptionParts.join(' ');

    const highlights = [
      repoCount > 0 ? `${repoCount} repositories contribute to this focus area` : null,
      languageSummary ? `Languages: ${languageSummary}` : null,
      notableProjects.length > 0
        ? `Notable projects: ${notableProjects.slice(0, 3).join(', ')}`
        : null,
      supportingTechnologies.length > 0
        ? `Supporting tools: ${supportingTechnologies.join(', ')}`
        : null,
    ].filter(Boolean) as string[];

    const embeddingText = `${name} - ${description} ${highlights.join(', ')}`;
    const embedding = await EmbeddingService.embed(embeddingText);

    return SupabaseService.createComponent({
      user_id: userId,
      type: 'skill',
      title: name,
      organization: 'GitHub',
      description,
      highlights: highlights.slice(0, 5),
      embedding,
      src: 'github',
    });
  }
}
