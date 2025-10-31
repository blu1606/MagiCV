/**
 * Unit Tests for CVGeneratorService.generateCVContent()
 * 
 * Tests CV content generation with component selection and ranking
 * Target: Cover lines 198-276 and error paths
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';
import { LaTeXService } from '@/services/latex-service';
import type { Component, Profile } from '@/lib/supabase';

// Mock dependencies BEFORE imports
jest.mock('@google/generative-ai');
jest.mock('@/services/supabase-service');
jest.mock('@/services/embedding-service');
jest.mock('@/services/pdf-service');
jest.mock('@/services/latex-service');

// Import after mocking
import { SupabaseService } from '@/services/supabase-service';
import { LaTeXService } from '@/services/latex-service';

describe('CVGeneratorService.generateCVContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Given valid inputs, When generateCVContent called, Then returns CV data structure', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Senior Software Engineer';
    const mockProfile: Profile = {
      id: userId,
      full_name: 'John Doe',
      profession: 'Software Engineer',
    } as Profile;

    const mockComponents: Component[] = [
      {
        id: 'comp_1',
        user_id: userId,
        type: 'experience',
        title: 'Senior Developer',
        organization: 'TechCorp',
      } as Component,
    ];

    jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
    jest.spyOn(CVGeneratorService, 'matchComponentsByCategories').mockResolvedValue(mockComponents);
    jest.spyOn(CVGeneratorService, 'selectAndRankComponents').mockResolvedValue({
      experiences: [
        {
          id: 'comp_1',
          title: 'Senior Developer',
          organization: 'TechCorp',
        },
      ],
      education: [],
      skills: { technical: [], languages: [], interests: [] },
      projects: [],
    });

    // Act
    const result = await CVGeneratorService.generateCVContent(userId, jobDescription);

    // Assert
    expect(result).toHaveProperty('profile');
    expect(result).toHaveProperty('margins');
    expect(result).toHaveProperty('education');
    expect(result).toHaveProperty('experience');
    expect(result).toHaveProperty('skills');
    expect(result.profile.name).toBe('John Doe');
    expect(CVGeneratorService.matchComponentsByCategories).toHaveBeenCalled();
    expect(CVGeneratorService.selectAndRankComponents).toHaveBeenCalled();
  });

  test('Given profile not found, When generateCVContent called, Then throws error', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';

    jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(null);

    // Act & Assert
    await expect(CVGeneratorService.generateCVContent(userId, jobDescription))
      .rejects.toThrow('Profile not found');
  });

  test('Given no components found, When generateCVContent called, Then throws error', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockProfile: Profile = {
      id: userId,
      full_name: 'John Doe',
    } as Profile;

    jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
    jest.spyOn(CVGeneratorService, 'matchComponentsByCategories').mockResolvedValue([]);

    // Act & Assert
    await expect(CVGeneratorService.generateCVContent(userId, jobDescription))
      .rejects.toThrow('No components found for this user');
  });

  test('Given includeProjects option, When generateCVContent called, Then includes projects in experience', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockProfile: Profile = {
      id: userId,
      full_name: 'John Doe',
    } as Profile;

    const mockComponents: Component[] = [
      { id: 'comp_1', type: 'experience', title: 'Developer' } as Component,
    ];

    jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
    jest.spyOn(CVGeneratorService, 'matchComponentsByCategories').mockResolvedValue(mockComponents);
    jest.spyOn(CVGeneratorService, 'selectAndRankComponents').mockResolvedValue({
      experiences: [{ id: 'comp_1', title: 'Developer' }],
      education: [],
      skills: { technical: [], languages: [], interests: [] },
      projects: [{ id: 'proj_1', title: 'AI Project' }],
    });

    // Act
    const result = await CVGeneratorService.generateCVContent(userId, jobDescription, {
      includeProjects: true,
    });

    // Assert
    expect(result.experience).toHaveLength(2); // experience + project
    expect(result.experience.some((e: any) => e.title === 'AI Project')).toBe(true);
  });

  test('Given profile without full_name, When generateCVContent called, Then uses default name', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockProfile: Profile = {
      id: userId,
      // No full_name
    } as Profile;

    const mockComponents: Component[] = [
      { id: 'comp_1', type: 'experience', title: 'Developer' } as Component,
    ];

    jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
    jest.spyOn(CVGeneratorService, 'matchComponentsByCategories').mockResolvedValue(mockComponents);
    jest.spyOn(CVGeneratorService, 'selectAndRankComponents').mockResolvedValue({
      experiences: [],
      education: [],
      skills: { technical: [], languages: [], interests: [] },
      projects: [],
    });

    // Act
    const result = await CVGeneratorService.generateCVContent(userId, jobDescription);

    // Assert
    expect(result.profile.name).toBe('Your Name');
  });

  test('Given custom options, When generateCVContent called, Then passes options to matchComponentsByCategories', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockProfile: Profile = {
      id: userId,
      full_name: 'John Doe',
    } as Profile;

    const mockComponents: Component[] = [
      { id: 'comp_1', type: 'experience', title: 'Developer' } as Component,
    ];

    jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
    jest.spyOn(CVGeneratorService, 'matchComponentsByCategories').mockResolvedValue(mockComponents);
    jest.spyOn(CVGeneratorService, 'selectAndRankComponents').mockResolvedValue({
      experiences: [],
      education: [],
      skills: { technical: [], languages: [], interests: [] },
      projects: [],
    });

    // Act
    await CVGeneratorService.generateCVContent(userId, jobDescription);

    // Assert
    expect(CVGeneratorService.matchComponentsByCategories).toHaveBeenCalledWith(
      userId,
      jobDescription,
      { categoriesLimit: 10, topKPerCategory: 5 } // Default values
    );
  });

  test('Given error in matchComponentsByCategories, When generateCVContent called, Then throws error', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockProfile: Profile = {
      id: userId,
      full_name: 'John Doe',
    } as Profile;

    jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
    jest.spyOn(CVGeneratorService, 'matchComponentsByCategories').mockRejectedValue(
      new Error('Matching failed')
    );

    // Act & Assert
    await expect(CVGeneratorService.generateCVContent(userId, jobDescription))
      .rejects.toThrow('Matching failed');
  });

  test('Given error in selectAndRankComponents, When generateCVContent called, Then throws error', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockProfile: Profile = {
      id: userId,
      full_name: 'John Doe',
    } as Profile;

    const mockComponents: Component[] = [
      { id: 'comp_1', type: 'experience', title: 'Developer' } as Component,
    ];

    jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
    jest.spyOn(CVGeneratorService, 'matchComponentsByCategories').mockResolvedValue(mockComponents);
    jest.spyOn(CVGeneratorService, 'selectAndRankComponents').mockRejectedValue(
      new Error('Ranking failed')
    );

    // Act & Assert
    await expect(CVGeneratorService.generateCVContent(userId, jobDescription))
      .rejects.toThrow('Ranking failed');
  });
});

