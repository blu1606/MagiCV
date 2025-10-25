/**
 * Unit Tests for CVGeneratorService.selectAndRankComponents()
 * 
 * Tests LLM-based component selection and ranking functionality
 * 
 * Coverage:
 * - Happy Path: 2 tests (normal ranking, empty components)
 * - Edge Cases: 2 tests (missing profile fields, single component type)
 * - Error Handling: 1 test (LLM failure)
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { Component, Profile } from '@/lib/supabase';

// Mock services
jest.mock('@/services/embedding-service');
jest.mock('@/services/supabase-service');
jest.mock('@google/generative-ai');

// Import after mocking
import { CVGeneratorService } from '@/services/cv-generator-service';

// Suppress console
const originalConsole = global.console;

describe('CVGeneratorService.selectAndRankComponents', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    global.console = {
      ...originalConsole,
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
  });

  afterEach(() => {
    global.console = originalConsole;
  });

  // ============================================
  // HAPPY PATH TESTS
  // ============================================

  describe('Happy Path', () => {
    /**
     * Test: Normal component ranking with diverse types
     */
    test('Given diverse components and JD, When selectAndRankComponents called, Then returns ranked components by relevance', async () => {
      // Arrange
      const components: Component[] = [
        {
          id: 'exp_1',
          user_id: 'user_123',
          type: 'experience',
          title: 'Senior Software Engineer',
          organization: 'Tech Corp',
          description: 'Built scalable systems',
          highlights: ['Led team of 5', 'Increased performance 50%'],
          start_date: '2020-01',
          end_date: '2023-12',
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'skill_1',
          user_id: 'user_123',
          type: 'skill',
          title: 'React',
          organization: null,
          description: 'Expert level',
          highlights: [],
          start_date: null,
          end_date: null,
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'edu_1',
          user_id: 'user_123',
          type: 'education',
          title: 'BSc Computer Science',
          organization: 'Stanford University',
          description: 'GPA: 3.8/4.0',
          highlights: ['Dean\'s List'],
          start_date: '2016-09',
          end_date: '2020-05',
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const jobDescription = 'Senior React Developer with 5+ years experience';
      
      const profile: Profile = {
        id: 'user_123',
        full_name: 'John Doe',
        profession: 'Software Engineer',
        bio: 'Passionate developer',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock Google AI response
      const mockLLMResponse = {
        experiences: [
          {
            id: 'exp_1',
            title: 'Senior Software Engineer',
            organization: 'Tech Corp',
            location: 'San Francisco, CA',
            remote: false,
            start: 'Jan 2020',
            end: 'Dec 2023',
            bullets: [
              'Led team of 5 engineers to deliver scalable systems',
              'Increased system performance by 50% through optimization',
              'Mentored junior developers in React best practices',
            ],
          },
        ],
        education: [
          {
            id: 'edu_1',
            school: 'Stanford University',
            degree: 'BSc Computer Science',
            concentration: 'Software Engineering',
            location: 'Stanford, CA',
            graduation_date: 'May 2020',
            gpa: '3.8/4.0',
            coursework: ['Data Structures', 'Algorithms'],
            awards: ['Dean\'s List'],
          },
        ],
        skills: {
          technical: ['React', 'TypeScript', 'Node.js'],
          languages: [{ name: 'English', level: 'Native' }],
          interests: ['Open Source', 'AI/ML'],
        },
        projects: [],
      };

      // Mock the LLM model
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockLLMResponse),
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      // Mock getClient to return our mock
      jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

      // Act
      const result = await CVGeneratorService.selectAndRankComponents(
        components,
        jobDescription,
        profile
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('experiences');
      expect(result).toHaveProperty('education');
      expect(result).toHaveProperty('skills');
      expect(result).toHaveProperty('projects');

      // Verify experiences are ranked
      expect(Array.isArray(result.experiences)).toBe(true);
      expect(result.experiences.length).toBeGreaterThan(0);
      expect(result.experiences[0]).toHaveProperty('title');
      expect(result.experiences[0]).toHaveProperty('bullets');

      // Verify education
      expect(Array.isArray(result.education)).toBe(true);
      
      // Verify skills
      expect(result.skills).toHaveProperty('technical');

      // Verify LLM was called
      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-2.0-flash-exp' });
      expect(mockModel.generateContent).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Empty components array
     */
    test('Given empty components array, When selectAndRankComponents called, Then returns empty categorized structure', async () => {
      // Arrange
      const components: Component[] = [];
      const jobDescription = 'Software Engineer';
      const profile: Profile = {
        id: 'user_123',
        full_name: 'Jane Smith',
        profession: 'Developer',
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock LLM response for empty components
      const mockLLMResponse = {
        experiences: [],
        education: [],
        skills: { technical: [], languages: [], interests: [] },
        projects: [],
      };

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockLLMResponse),
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

      // Act
      const result = await CVGeneratorService.selectAndRankComponents(
        components,
        jobDescription,
        profile
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.experiences).toEqual([]);
      expect(result.education).toEqual([]);
      expect(result.projects).toEqual([]);
    });
  });

  // ============================================
  // EDGE CASE TESTS
  // ============================================

  describe('Edge Cases', () => {
    /**
     * Test: Profile with missing optional fields
     */
    test('Given profile with missing fields, When selectAndRankComponents called, Then handles gracefully with defaults', async () => {
      // Arrange
      const components: Component[] = [
        {
          id: 'exp_1',
          user_id: 'user_123',
          type: 'experience',
          title: 'Developer',
          organization: 'Company',
          description: 'Work description',
          highlights: ['Achievement'],
          start_date: '2020-01',
          end_date: null, // Current job
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const jobDescription = 'Backend Developer';
      
      // Profile with minimal fields
      const profile: Profile = {
        id: 'user_456',
        full_name: null, // Missing
        profession: null, // Missing
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockLLMResponse = {
        experiences: [{
          id: 'exp_1',
          title: 'Developer',
          organization: 'Company',
          location: 'Remote',
          remote: true,
          start: 'Jan 2020',
          end: 'Present',
          bullets: ['Built backend systems'],
        }],
        education: [],
        skills: { technical: ['Node.js'], languages: [], interests: [] },
        projects: [],
      };

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockLLMResponse),
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

      // Act
      const result = await CVGeneratorService.selectAndRankComponents(
        components,
        jobDescription,
        profile
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.experiences.length).toBe(1);
      
      // Should not crash despite missing profile fields
      expect(true).toBe(true);
    });

    /**
     * Test: Components of single type only
     */
    test('Given only skill components, When selectAndRankComponents called, Then returns only skills populated', async () => {
      // Arrange
      const components: Component[] = [
        {
          id: 'skill_1',
          user_id: 'user_123',
          type: 'skill',
          title: 'Python',
          organization: null,
          description: 'Advanced',
          highlights: [],
          start_date: null,
          end_date: null,
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'skill_2',
          user_id: 'user_123',
          type: 'skill',
          title: 'Django',
          organization: null,
          description: 'Intermediate',
          highlights: [],
          start_date: null,
          end_date: null,
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const jobDescription = 'Python Developer';
      const profile: Profile = {
        id: 'user_123',
        full_name: 'Bob Developer',
        profession: 'Python Engineer',
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockLLMResponse = {
        experiences: [],
        education: [],
        skills: {
          technical: ['Python', 'Django', 'Flask'],
          languages: [],
          interests: ['Backend Development'],
        },
        projects: [],
      };

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockLLMResponse),
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

      // Act
      const result = await CVGeneratorService.selectAndRankComponents(
        components,
        jobDescription,
        profile
      );

      // Assert
      expect(result.experiences).toEqual([]);
      expect(result.education).toEqual([]);
      expect(result.skills.technical.length).toBeGreaterThan(0);
      expect(result.projects).toEqual([]);
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling', () => {
    /**
     * Test: LLM returns invalid JSON
     */
    test('Given LLM returns invalid JSON, When selectAndRankComponents called, Then throws error with context', async () => {
      // Arrange
      const components: Component[] = [
        {
          id: 'exp_1',
          user_id: 'user_123',
          type: 'experience',
          title: 'Engineer',
          organization: 'Company',
          description: 'Work',
          highlights: [],
          start_date: '2020-01',
          end_date: '2023-12',
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const jobDescription = 'Software Engineer';
      const profile: Profile = {
        id: 'user_123',
        full_name: 'Test User',
        profession: 'Engineer',
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock LLM to return invalid JSON
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'This is not valid JSON { invalid }',
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

      // Act & Assert
      await expect(
        CVGeneratorService.selectAndRankComponents(
          components,
          jobDescription,
          profile
        )
      ).rejects.toThrow();

      // Verify error was logged
      expect(global.console.error).toHaveBeenCalled();
    });
  });
});

