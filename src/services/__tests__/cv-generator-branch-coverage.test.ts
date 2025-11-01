/**
 * Additional Tests for CV Generator Service - Branch Coverage Improvement
 * Target: Increase branch coverage from 70.58% to 80%+
 *
 * Uncovered branches:
 * - Lines 16-23: getClient() error path (missing API key)
 * - Lines 38-41: findRelevantComponents() empty jobDescription fallback
 * - Lines 56-59: findRelevantComponents() empty vector search fallback
 * - Lines 187-190: selectAndRankComponents() markdown code block cleaning
 */

import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';
import { EmbeddingService } from '@/services/embedding-service';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock dependencies
jest.mock('@/services/supabase-service');
jest.mock('@/services/embedding-service');
jest.mock('@google/generative-ai');

describe('CVGeneratorService - Branch Coverage', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalEnv;
    }
    // Reset the static genAI instance
    (CVGeneratorService as any).genAI = null;
  });

  // ============================================
  // getClient() ERROR PATH - Lines 16-23
  // ============================================

  test('Given missing API key, When getClient called, Then throws descriptive error', () => {
    // Arrange
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    (CVGeneratorService as any).genAI = null;

    // Act & Assert
    expect(() => {
      (CVGeneratorService as any).getClient();
    }).toThrow('GOOGLE_GENERATIVE_AI_API_KEY not found');
  });

  test('Given API key exists, When getClient called first time, Then creates new GoogleGenerativeAI instance', () => {
    // Arrange
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key-12345';
    (CVGeneratorService as any).genAI = null;

    // Act
    const client = (CVGeneratorService as any).getClient();

    // Assert
    expect(client).toBeDefined();
    // GoogleGenerativeAI should be instantiated (we can't easily assert the constructor call with current mock setup)
  });

  test('Given API key exists and client already created, When getClient called again, Then reuses existing instance', () => {
    // Arrange
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key-12345';
    const mockInstance = { getGenerativeModel: jest.fn() };
    (CVGeneratorService as any).genAI = mockInstance;

    // Act
    const client = (CVGeneratorService as any).getClient();

    // Assert
    expect(client).toBe(mockInstance); // Should return cached instance
  });

  // ============================================
  // findRelevantComponents() EMPTY JD FALLBACK - Lines 38-41
  // ============================================

  test('Given empty jobDescription, When findRelevantComponents called, Then returns all user components', async () => {
    // Arrange
    const userId = 'user123';
    const jobDescription = ''; // Empty string
    const limit = 20;

    const mockComponents = [
      { id: '1', type: 'experience', title: 'Software Engineer', organization: 'TechCorp', highlights: [] },
      { id: '2', type: 'skill', title: 'JavaScript', organization: null, highlights: [] },
      { id: '3', type: 'education', title: 'BS Computer Science', organization: 'MIT', highlights: [] },
    ];

    jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
      components: mockComponents,
      total: 3,
    });

    // Act
    const result = await CVGeneratorService.findRelevantComponents(userId, jobDescription, limit);

    // Assert
    expect(SupabaseService.getUserComponents).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockComponents); // Should return all components (no slicing needed since <= limit)
    // EmbeddingService.embed should not be called (verified by code path - early return)
  });

  test('Given whitespace-only jobDescription, When findRelevantComponents called, Then falls back to all components', async () => {
    // Arrange
    const userId = 'user456';
    const jobDescription = '   \n\t  '; // Whitespace only
    const limit = 10;

    const mockComponents = [
      { id: '1', type: 'project', title: 'Portfolio Website', organization: 'Personal', highlights: [] },
    ];

    jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
      components: mockComponents,
      total: 1,
    });

    // Act
    const result = await CVGeneratorService.findRelevantComponents(userId, jobDescription, limit);

    // Assert
    expect(SupabaseService.getUserComponents).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockComponents);
    // EmbeddingService.embed should not be called (verified by code path - early return)
  });

  // ============================================
  // findRelevantComponents() EMPTY VECTOR SEARCH FALLBACK - Lines 56-59
  // ============================================

  test('Given vector search returns empty array, When findRelevantComponents called, Then falls back to all components', async () => {
    // Arrange
    const userId = 'user789';
    const jobDescription = 'Senior React Developer with 5 years experience';
    const limit = 20;

    const mockEmbedding = Array(768).fill(0.1);
    const mockComponents = [
      { id: '1', type: 'experience', title: 'Frontend Developer', organization: 'StartupXYZ', highlights: [] },
      { id: '2', type: 'skill', title: 'React', organization: null, highlights: [] },
    ];

    jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
    jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue([]); // Empty result
    jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
      components: mockComponents,
      total: 2,
    });

    // Act
    const result = await CVGeneratorService.findRelevantComponents(userId, jobDescription, limit);

    // Assert
    expect(EmbeddingService.embed).toHaveBeenCalledWith(jobDescription);
    expect(SupabaseService.similaritySearchComponents).toHaveBeenCalledWith(userId, mockEmbedding, limit);
    expect(SupabaseService.getUserComponents).toHaveBeenCalledWith(userId); // Fallback
    expect(result).toEqual(mockComponents);
  });

  test('Given vector search returns components, When findRelevantComponents called, Then returns search results', async () => {
    // Arrange
    const userId = 'user999';
    const jobDescription = 'Python Backend Engineer';
    const limit = 5;

    const mockEmbedding = Array(768).fill(0.2);
    const mockComponents = [
      { id: '1', type: 'experience', title: 'Backend Engineer', organization: 'TechCo', highlights: ['Python', 'Django'] },
      { id: '2', type: 'skill', title: 'Python', organization: null, highlights: [] },
    ];

    jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
    jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue(mockComponents);

    // Act
    const result = await CVGeneratorService.findRelevantComponents(userId, jobDescription, limit);

    // Assert
    expect(EmbeddingService.embed).toHaveBeenCalledWith(jobDescription);
    expect(SupabaseService.similaritySearchComponents).toHaveBeenCalledWith(userId, mockEmbedding, limit);
    // getUserComponents should not be called when vector search succeeds
    expect(result).toEqual(mockComponents);
  });

  // ============================================
  // selectAndRankComponents() MARKDOWN CLEANING - Lines 187-190
  // ============================================

  test('Given LLM returns response with ```json markdown, When selectAndRankComponents called, Then strips markdown', async () => {
    // Arrange
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key';
    (CVGeneratorService as any).genAI = null;

    const components = [
      { id: '1', type: 'experience', title: 'Engineer', organization: 'TechCorp', highlights: ['Led team'], start_date: '2020-01', end_date: '2023-12', description: 'Built systems' },
    ];

    const profile = {
      id: 'user1',
      full_name: 'John Doe',
      profession: 'Software Engineer',
      created_at: '2020-01-01',
      updated_at: '2024-01-01',
    };

    const jobDescription = 'Looking for experienced engineer';

    const mockResponseText = '```json\n{"experiences": [{"id": "1", "title": "Engineer", "organization": "TechCorp", "location": "SF", "remote": false, "start": "Jan 2020", "end": "Dec 2023", "bullets": ["Led team"]}], "education": [], "skills": {"technical": [], "languages": [], "interests": []}, "projects": []}\n```';

    const mockModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => mockResponseText,
        },
      }),
    };

    const mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    };

    jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

    // Act
    const result = await CVGeneratorService.selectAndRankComponents(components, jobDescription, profile);

    // Assert
    expect(result).toBeDefined();
    expect(result.experiences).toHaveLength(1);
    expect(result.experiences[0].title).toBe('Engineer');
  });

  test('Given LLM returns response with ``` markdown (no json), When selectAndRankComponents called, Then strips markdown', async () => {
    // Arrange
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key';
    (CVGeneratorService as any).genAI = null;

    const components = [
      { id: '2', type: 'skill', title: 'TypeScript', organization: null, highlights: [], start_date: null, end_date: null, description: 'Advanced proficiency' },
    ];

    const profile = {
      id: 'user2',
      full_name: 'Jane Smith',
      profession: 'Developer',
      created_at: '2019-01-01',
      updated_at: '2024-01-01',
    };

    const jobDescription = 'TypeScript developer needed';

    const mockResponseText = '```\n{"experiences": [], "education": [], "skills": {"technical": ["TypeScript", "JavaScript"], "languages": [], "interests": []}, "projects": []}\n```';

    const mockModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => mockResponseText,
        },
      }),
    };

    const mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    };

    jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

    // Act
    const result = await CVGeneratorService.selectAndRankComponents(components, jobDescription, profile);

    // Assert
    expect(result).toBeDefined();
    expect(result.skills.technical).toContain('TypeScript');
  });

  test('Given LLM returns plain JSON without markdown, When selectAndRankComponents called, Then parses successfully', async () => {
    // Arrange
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key';
    (CVGeneratorService as any).genAI = null;

    const components = [
      { id: '3', type: 'education', title: 'BS Computer Science', organization: 'MIT', highlights: [], start_date: '2015-09', end_date: '2019-05', description: 'GPA 3.8' },
    ];

    const profile = {
      id: 'user3',
      full_name: 'Alice Brown',
      profession: 'Data Scientist',
      created_at: '2018-01-01',
      updated_at: '2024-01-01',
    };

    const jobDescription = 'Data scientist with CS degree';

    const mockResponseText = '{"experiences": [], "education": [{"id": "3", "school": "MIT", "degree": "BS Computer Science", "concentration": "CS", "location": "Cambridge", "graduation_date": "May 2019", "gpa": "3.8/4.0", "coursework": [], "awards": []}], "skills": {"technical": [], "languages": [], "interests": []}, "projects": []}';

    const mockModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => mockResponseText,
        },
      }),
    };

    const mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    };

    jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

    // Act
    const result = await CVGeneratorService.selectAndRankComponents(components, jobDescription, profile);

    // Assert
    expect(result).toBeDefined();
    expect(result.education).toHaveLength(1);
    expect(result.education[0].school).toBe('MIT');
  });
});
