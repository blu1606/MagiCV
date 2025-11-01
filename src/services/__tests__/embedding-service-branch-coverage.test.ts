/**
 * Additional Tests for Embedding Service - Branch Coverage Improvement
 * Target: Increase branch coverage from 63% to 80%+
 *
 * Focus: Missing branches in extractTextFromComponent switch statement
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { EmbeddingService } from '@/services/embedding-service';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock Google Generative AI
jest.mock('@google/generative-ai');

describe('EmbeddingService - Additional Branch Coverage', () => {
  let mockGenAI: any;
  let mockModel: any;
  const mockEmbeddingValues = Array(768).fill(0.1);

  beforeEach(() => {
    jest.clearAllMocks();

    mockModel = {
      embedContent: jest.fn(),
    };

    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    };

    jest.spyOn(EmbeddingService as any, 'getClient').mockReturnValue(mockGenAI);

    mockModel.embedContent.mockResolvedValue({
      embedding: {
        values: mockEmbeddingValues,
      },
    });
  });

  // ============================================
  // LINKEDIN_EDUCATION - Line 128-129
  // ============================================

  test('Given linkedin_education with all fields, When embedComponent called, Then extracts degree, field, school', async () => {
    const componentType = 'linkedin_education';
    const data = {
      degree: 'Master of Science',
      field: 'Computer Science',
      school: 'MIT',
      description: 'Focus on AI and Machine Learning',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Master of Science');
    expect(calledText).toContain('Computer Science');
    expect(calledText).toContain('MIT');
    expect(calledText).toContain('Focus on AI');
  });

  test('Given linkedin_education with missing degree, When embedComponent called, Then handles gracefully', async () => {
    const componentType = 'linkedin_education';
    const data = {
      field: 'Software Engineering',
      school: 'Stanford University',
      description: 'Graduated with honors',
    };

    const result = await EmbeddingService.embedComponent(componentType, data);

    expect(result).toEqual(mockEmbeddingValues);
    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Software Engineering');
    expect(calledText).toContain('Stanford University');
  });

  test('Given linkedin_education with missing field, When embedComponent called, Then handles gracefully', async () => {
    const componentType = 'linkedin_education';
    const data = {
      degree: 'Bachelor of Arts',
      school: 'Harvard',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Bachelor of Arts');
    expect(calledText).toContain('Harvard');
  });

  test('Given linkedin_education with empty description, When embedComponent called, Then still works', async () => {
    const componentType = 'linkedin_education';
    const data = {
      degree: 'PhD',
      field: 'Physics',
      school: 'Caltech',
      description: '',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('PhD');
    expect(calledText).toContain('Physics');
  });

  // ============================================
  // LINKEDIN_SKILL - Line 131-132
  // ============================================

  test('Given linkedin_skill with name, When embedComponent called, Then extracts skill name', async () => {
    const componentType = 'linkedin_skill';
    const data = {
      name: 'Python Programming',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Python Programming');
  });

  test('Given linkedin_skill with complex name, When embedComponent called, Then handles correctly', async () => {
    const componentType = 'linkedin_skill';
    const data = {
      name: 'Full Stack Development (React, Node.js, PostgreSQL)',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Full Stack Development');
    expect(calledText).toContain('React');
  });

  // ============================================
  // BRANCH VARIATIONS - Test optional fields
  // ============================================

  test('Given github_repository with missing topics, When embedComponent called, Then handles empty array', async () => {
    const componentType = 'github_repository';
    const data = {
      name: 'test-repo',
      description: 'Test repository',
      language: 'JavaScript',
      topics: [], // Empty topics array
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('test-repo');
    expect(calledText).toContain('JavaScript');
  });

  test('Given github_repository with null language, When embedComponent called, Then handles null', async () => {
    const componentType = 'github_repository';
    const data = {
      name: 'markdown-repo',
      description: 'Documentation only',
      language: null,
      topics: ['docs'],
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('markdown-repo');
    expect(calledText).toContain('docs');
  });

  test('Given linkedin_language with empty proficiency, When embedComponent called, Then handles empty string', async () => {
    const componentType = 'linkedin_language';
    const data = {
      name: 'Mandarin',
      proficiency: '', // Empty proficiency
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Mandarin');
  });

  test('Given jd_skill with level but not required, When embedComponent called, Then does not include Required tag', async () => {
    const componentType = 'jd_skill';
    const data = {
      skill: 'Docker',
      level: 'Intermediate',
      required: false, // Not required
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Docker');
    expect(calledText).toContain('Intermediate');
    expect(calledText).not.toContain('(Required)');
  });

  test('Given jd_skill without level, When embedComponent called, Then handles missing level', async () => {
    const componentType = 'jd_skill';
    const data = {
      skill: 'Kubernetes',
      required: true,
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Kubernetes');
    expect(calledText).toContain('(Required)');
  });

  test('Given jd_requirement with requirement field, When embedComponent called, Then uses requirement', async () => {
    const componentType = 'jd_requirement';
    const data = {
      requirement: 'Must have 5+ years experience',
      description: 'Alternative description',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('5+ years experience');
  });

  test('Given jd_requirement without requirement but with description, When embedComponent called, Then uses description', async () => {
    const componentType = 'jd_requirement';
    const data = {
      description: 'Strong communication skills',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Strong communication skills');
  });

  test('Given jd_requirement with neither requirement nor description, When embedComponent called, Then returns empty string', async () => {
    const componentType = 'jd_requirement';
    const data = {};

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    // Should still call embed but with minimal text
    expect(mockModel.embedContent).toHaveBeenCalled();
  });

  test('Given jd_metadata with all fields empty, When embedComponent called, Then handles all empty', async () => {
    const componentType = 'jd_metadata';
    const data = {
      title: '',
      company: '',
      description: '',
    };

    await EmbeddingService.embedComponent(componentType, data);

    expect(mockModel.embedContent).toHaveBeenCalled();
  });

  test('Given jd_metadata with only title, When embedComponent called, Then uses only title', async () => {
    const componentType = 'jd_metadata';
    const data = {
      title: 'Senior DevOps Engineer',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Senior DevOps Engineer');
  });

  test('Given linkedin_profile with empty headline, When embedComponent called, Then uses only summary', async () => {
    const componentType = 'linkedin_profile';
    const data = {
      headline: '',
      summary: 'Experienced software engineer passionate about open source',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('open source');
  });

  test('Given github_profile with name but no login, When embedComponent called, Then uses name', async () => {
    const componentType = 'github_profile';
    const data = {
      name: 'John Doe',
      bio: 'Open source contributor',
      company: 'Tech Corp',
      location: 'San Francisco',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('John Doe');
    expect(calledText).toContain('Open source contributor');
  });

  test('Given github_profile with login but no name, When embedComponent called, Then uses login', async () => {
    const componentType = 'github_profile';
    const data = {
      login: 'johndoe123',
      bio: 'Code enthusiast',
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('johndoe123');
    expect(calledText).toContain('Code enthusiast');
  });

  test('Given linkedin_experience with empty skills array, When embedComponent called, Then handles empty skills', async () => {
    const componentType = 'linkedin_experience';
    const data = {
      title: 'Junior Developer',
      company: 'StartupXYZ',
      description: 'Learning and growing',
      skills: [], // Empty skills
    };

    await EmbeddingService.embedComponent(componentType, data);

    const calledText = mockModel.embedContent.mock.calls[0][0];
    expect(calledText).toContain('Junior Developer');
    expect(calledText).toContain('StartupXYZ');
  });
});
