/**
 * Error Path Tests for GitHubComponentService
 * 
 * Tests error handling scenarios and edge cases
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { GitHubComponentService } from '@/services/github-component-service';
import { EmbeddingService } from '@/services/embedding-service';
import { SupabaseService } from '@/services/supabase-service';

// Mock dependencies
jest.mock('@/services/embedding-service');
jest.mock('@/services/supabase-service');
jest.mock('@/mastra/tools');

describe('GitHubComponentService - Error Paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (EmbeddingService.embed as jest.Mock) = jest.fn().mockResolvedValue(Array(768).fill(0.1));
    (SupabaseService.createComponent as jest.Mock) = jest.fn().mockResolvedValue({ id: 'comp_123' });
  });

  test('Given GitHub tool execution fails, When crawlAndCreateComponents called, Then returns error result', async () => {
    // Arrange
    const { githubTool } = require('@/mastra/tools');
    githubTool.execute = jest.fn().mockResolvedValue({
      success: false,
      error: 'GitHub API rate limit exceeded',
    });

    // Act
    const result = await GitHubComponentService.crawlAndCreateComponents(
      'user_123',
      'testuser'
    );

    // Assert
    expect(result.success).toBe(false);
    expect(result.componentsCreated).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error).toContain('rate limit');
  });

  test('Given GitHub tool returns no data, When crawlAndCreateComponents called, Then returns error result', async () => {
    // Arrange
    const { githubTool } = require('@/mastra/tools');
    githubTool.execute = jest.fn().mockResolvedValue({
      success: true,
      data: null,
    });

    // Act
    const result = await GitHubComponentService.crawlAndCreateComponents(
      'user_123',
      'testuser'
    );

    // Assert
    expect(result.success).toBe(false);
    expect(result.errors[0].error).toContain('Failed to fetch');
  });

  test('Given embedding service fails during profile component creation, When crawlAndCreateComponents called, Then continues with other components', async () => {
    // Arrange
    const { githubTool } = require('@/mastra/tools');
    githubTool.execute = jest.fn().mockResolvedValue({
      success: true,
      data: {
        profile: { bio: 'Test bio', login: 'testuser', followers: 10, public_repos: 5 },
        repositories: [],
        languageStats: { primaryLanguages: [] },
        topProjects: [],
        statistics: {},
      },
    });

    // Mock embedding service to fail for profile
    (EmbeddingService.embed as jest.Mock)
      .mockRejectedValueOnce(new Error('Embedding API error'))
      .mockResolvedValue(Array(768).fill(0.1)); // Success for other components

    // Mock SupabaseService
    (SupabaseService.createComponent as jest.Mock).mockResolvedValue({
      id: 'comp_123',
    });

    // Act
    const result = await GitHubComponentService.crawlAndCreateComponents(
      'user_123',
      'testuser'
    );

    // Assert
    expect(result.success).toBe(true);
    expect(result.errors.some(e => e.type === 'profile')).toBe(true);
  });

  test('Given SupabaseService fails during component creation, When crawlAndCreateComponents called, Then collects error and continues', async () => {
    // Arrange
    const { githubTool } = require('@/mastra/tools');
    githubTool.execute = jest.fn().mockResolvedValue({
      success: true,
      data: {
        profile: { bio: 'Test bio', login: 'testuser', followers: 10, public_repos: 5 },
        repositories: [{ name: 'repo1', language: 'JavaScript', stars: 10, topics: [] }],
        languageStats: { primaryLanguages: [{ language: 'JavaScript', count: 1, percentage: 100 }] },
        topProjects: [{ name: 'repo1', description: 'Test', language: 'JavaScript', stars: 10, topics: [], url: 'https://github.com/repo1' }],
        statistics: {},
      },
    });

    // Mock embedding service
    (EmbeddingService.embed as jest.Mock).mockResolvedValue(Array(768).fill(0.1));

    // Mock SupabaseService to fail on first call
    (SupabaseService.createComponent as jest.Mock)
      .mockRejectedValueOnce(new Error('Database connection failed'))
      .mockResolvedValue({ id: 'comp_123' }); // Success for subsequent calls

    // Act
    const result = await GitHubComponentService.crawlAndCreateComponents(
      'user_123',
      'testuser'
    );

    // Assert
    expect(result.success).toBe(true);
    expect(result.errors.length).toBeGreaterThan(0);
    // Should continue processing despite errors
    expect(result.componentsCreated).toBeGreaterThan(0);
  });

  test('Given embedding service fails for multiple components, When crawlAndCreateComponents called, Then collects all errors', async () => {
    // Arrange
    const { githubTool } = require('@/mastra/tools');
    githubTool.execute = jest.fn().mockResolvedValue({
      success: true,
      data: {
        profile: { bio: 'Test bio', login: 'testuser', followers: 10, public_repos: 5 },
        repositories: [
          { name: 'repo1', language: 'JavaScript', stars: 10, topics: [] },
          { name: 'repo2', language: 'Python', stars: 5, topics: [] },
        ],
        languageStats: {
          primaryLanguages: [
            { language: 'JavaScript', count: 1, percentage: 50 },
            { language: 'Python', count: 1, percentage: 50 },
          ],
        },
        topProjects: [
          { name: 'repo1', description: 'Test', language: 'JavaScript', stars: 10, topics: [], url: 'https://github.com/repo1' },
          { name: 'repo2', description: 'Test', language: 'Python', stars: 5, topics: [], url: 'https://github.com/repo2' },
        ],
        statistics: {},
      },
    });

    // Mock embedding service to fail multiple times
    (EmbeddingService.embed as jest.Mock)
      .mockRejectedValueOnce(new Error('Embedding API error 1'))
      .mockRejectedValueOnce(new Error('Embedding API error 2'))
      .mockResolvedValue(Array(768).fill(0.1)); // Success for remaining

    (SupabaseService.createComponent as jest.Mock).mockResolvedValue({ id: 'comp_123' });

    // Act
    const result = await GitHubComponentService.crawlAndCreateComponents(
      'user_123',
      'testuser'
    );

    // Assert
    expect(result.success).toBe(true);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  test('Given empty repositories and languages, When crawlAndCreateComponents called, Then handles gracefully', async () => {
    // Arrange
    const { githubTool } = require('@/mastra/tools');
    githubTool.execute = jest.fn().mockResolvedValue({
      success: true,
      data: {
        profile: { bio: 'Test bio', login: 'testuser', followers: 0, public_repos: 0 },
        repositories: [],
        languageStats: { primaryLanguages: [] },
        topProjects: [],
        statistics: {},
      },
    });

    // Act
    const result = await GitHubComponentService.crawlAndCreateComponents(
      'user_123',
      'testuser'
    );

    // Assert
    expect(result.success).toBe(true);
    // Should create profile component if bio exists, even with empty repos
    expect(result.componentsCreated).toBe(1); // Only profile component
  });

  test('Given profile without bio, When crawlAndCreateComponents called, Then skips profile component', async () => {
    // Arrange
    const { githubTool } = require('@/mastra/tools');
    githubTool.execute = jest.fn().mockResolvedValue({
      success: true,
      data: {
        profile: { login: 'testuser', followers: 10, public_repos: 5 }, // No bio
        repositories: [],
        languageStats: { primaryLanguages: [] },
        topProjects: [],
        statistics: {},
      },
    });

    // Act
    const result = await GitHubComponentService.crawlAndCreateComponents(
      'user_123',
      'testuser'
    );

    // Assert
    // Service succeeds even with no components to create (no bio = no profile component, no repos = no projects)
    expect(result.success).toBe(true);
    // Profile component should not be created if no bio
    expect(result.componentsCreated).toBe(0);
    // Should not have attempted to create profile component (no bio check)
    // Note: Service may still process but create 0 components
  });
});

