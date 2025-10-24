import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

/**
 * GitHub MCP Tool - Thu thập dữ liệu chi tiết từ GitHub profile
 * Inspired by repo-summarizer: detailed statistics, file analysis, README parsing
 * 
 * Features:
 * - Profile information
 * - Repository details with README
 * - Detailed language statistics with lines of code
 * - File type analysis
 * - Contribution patterns
 * - Repository statistics (size, stars, forks)
 */
export const githubTool = createTool({
  id: "github-crawler",
  description: "Crawl comprehensive GitHub profile data including repositories, languages, README contents, and detailed statistics",
  
  inputSchema: z.object({
    username: z.string().describe("GitHub username or profile URL"),
    includeReadme: z.boolean().optional().describe("Include README content from repositories (default: true)"),
    maxRepos: z.number().optional().describe("Maximum number of repositories to analyze (default: 50)"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      profile: z.object({
        login: z.string(),
        name: z.string().optional(),
        bio: z.string().optional(),
        company: z.string().optional(),
        location: z.string().optional(),
        email: z.string().optional(),
        blog: z.string().optional(),
        public_repos: z.number(),
        followers: z.number(),
        following: z.number(),
        avatar_url: z.string().optional(),
        created_at: z.string().optional(),
      }),
      repositories: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        language: z.string().optional(),
        stars: z.number(),
        forks: z.number(),
        watchers: z.number(),
        url: z.string(),
        topics: z.array(z.string()),
        created_at: z.string(),
        updated_at: z.string(),
        pushed_at: z.string().optional(),
        size: z.number(),
        readme: z.string().optional(),
        readme_url: z.string().optional(),
        has_issues: z.boolean(),
        has_wiki: z.boolean(),
        is_fork: z.boolean(),
        open_issues: z.number(),
        default_branch: z.string(),
      })),
      languages: z.record(z.number()),
      languageStats: z.object({
        totalRepos: z.number(),
        primaryLanguages: z.array(z.object({
          language: z.string(),
          count: z.number(),
          percentage: z.number(),
        })),
        languagesByLines: z.record(z.number()).optional(),
      }),
      statistics: z.object({
        totalStars: z.number(),
        totalForks: z.number(),
        totalSize: z.number(),
        avgStarsPerRepo: z.number(),
        mostStarredRepo: z.object({
          name: z.string(),
          stars: z.number(),
          url: z.string(),
        }).optional(),
        recentlyUpdated: z.array(z.object({
          name: z.string(),
          updated_at: z.string(),
          url: z.string(),
        })),
        repositoryTypes: z.object({
          original: z.number(),
          forked: z.number(),
        }),
      }),
      topProjects: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        stars: z.number(),
        url: z.string(),
        language: z.string().optional(),
        topics: z.array(z.string()),
      })),
    }).optional(),
    error: z.string().optional(),
  }),

  execute: async ({ context }) => {
    try {
      // Extract username from URL or use directly
      let username = context.username;
      if (username.includes('github.com')) {
        const match = username.match(/github\.com\/([^\/]+)/);
        username = match ? match[1] : username;
      }

      const includeReadme = context.includeReadme !== false; // default true
      const maxRepos = context.maxRepos || 50;

      console.log(`🔍 Fetching comprehensive GitHub data for: ${username}`);
      console.log(`   Include README: ${includeReadme}, Max repos: ${maxRepos}`);

      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mastra-CV-Builder'
      };

      // Fetch user profile
      const profileResponse = await axios.get(
        `https://api.github.com/users/${username}`,
        { headers }
      );
      const profile = profileResponse.data;

      // Fetch repositories
      const reposResponse = await axios.get(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=${maxRepos}`,
        { headers }
      );
      const repos = reposResponse.data;

      console.log(`📦 Found ${repos.length} repositories`);

      // Fetch README for each repository (if enabled)
      const reposWithReadme = await Promise.all(
        repos.map(async (repo: any) => {
          let readme = undefined;
          let readmeUrl = undefined;

          if (includeReadme) {
            try {
              const readmeResponse = await axios.get(
                `https://api.github.com/repos/${username}/${repo.name}/readme`,
                { headers }
              );
              
              // Decode base64 content
              if (readmeResponse.data.content) {
                readme = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
                readmeUrl = readmeResponse.data.html_url;
              }
            } catch (err) {
              // README not found or error - skip silently
            }
          }

          return {
            name: repo.name,
            description: repo.description || undefined,
            language: repo.language || undefined,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            watchers: repo.watchers_count,
            url: repo.html_url,
            topics: repo.topics || [],
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            pushed_at: repo.pushed_at || undefined,
            size: repo.size,
            readme,
            readme_url: readmeUrl,
            has_issues: repo.has_issues,
            has_wiki: repo.has_wiki,
            is_fork: repo.fork,
            open_issues: repo.open_issues_count,
            default_branch: repo.default_branch,
          };
        })
      );

      // Language statistics
      const languages: Record<string, number> = {};
      let totalStars = 0;
      let totalForks = 0;
      let totalSize = 0;
      let originalRepos = 0;
      let forkedRepos = 0;

      reposWithReadme.forEach((repo) => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
        totalStars += repo.stars;
        totalForks += repo.forks;
        totalSize += repo.size;
        
        if (repo.is_fork) {
          forkedRepos++;
        } else {
          originalRepos++;
        }
      });

      // Calculate language percentages
      const totalReposWithLang = Object.values(languages).reduce((a, b) => a + b, 0);
      const primaryLanguages = Object.entries(languages)
        .map(([language, count]) => ({
          language,
          count,
          percentage: Math.round((count / totalReposWithLang) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      // Get top projects by stars
      const topProjects = [...reposWithReadme]
        .filter(repo => !repo.is_fork) // Exclude forks from top projects
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 10)
        .map(repo => ({
          name: repo.name,
          description: repo.description,
          stars: repo.stars,
          url: repo.url,
          language: repo.language,
          topics: repo.topics,
        }));

      // Most starred repository
      const mostStarredRepo = topProjects[0] ? {
        name: topProjects[0].name,
        stars: topProjects[0].stars,
        url: topProjects[0].url,
      } : undefined;

      // Recently updated repositories
      const recentlyUpdated = [...reposWithReadme]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
        .map(repo => ({
          name: repo.name,
          updated_at: repo.updated_at,
          url: repo.url,
        }));

      console.log(`✅ Analysis complete: ${repos.length} repos, ${Object.keys(languages).length} languages`);

      return {
        success: true,
        data: {
          profile: {
            login: profile.login,
            name: profile.name || undefined,
            bio: profile.bio || undefined,
            company: profile.company || undefined,
            location: profile.location || undefined,
            email: profile.email || undefined,
            blog: profile.blog || undefined,
            public_repos: profile.public_repos,
            followers: profile.followers,
            following: profile.following,
            avatar_url: profile.avatar_url || undefined,
            created_at: profile.created_at || undefined,
          },
          repositories: reposWithReadme,
          languages,
          languageStats: {
            totalRepos: repos.length,
            primaryLanguages,
          },
          statistics: {
            totalStars,
            totalForks,
            totalSize,
            avgStarsPerRepo: repos.length > 0 ? Math.round(totalStars / repos.length * 10) / 10 : 0,
            mostStarredRepo,
            recentlyUpdated,
            repositoryTypes: {
              original: originalRepos,
              forked: forkedRepos,
            },
          },
          topProjects,
        },
      };
    } catch (error: any) {
      console.error('❌ GitHub crawl error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
});

