/**
 * Unit Tests for CVGeneratorService.calculateMatchScore()
 * 
 * Tests CV-JD matching score calculation
 * 
 * Coverage:
 * - Happy Path: 1 test (normal scoring)
 * - Edge Cases: 1 test (perfect score, zero score)
 * - Error Handling: 1 test (no components found)
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock services
jest.mock('@/services/embedding-service');
jest.mock('@/services/supabase-service');

import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';
import { EmbeddingService } from '@/services/embedding-service';

const originalConsole = global.console;

describe('CVGeneratorService.calculateMatchScore', () => {
  
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
     * Test: Calculate match score with diverse components
     */
    test('Given user with diverse components, When calculateMatchScore called, Then returns score between 0-100', async () => {
      // Arrange
      const userId = 'user_123';
      const jobDescription = 'Senior Full Stack Developer with 5+ years experience';

      const mockComponents = [
        // 3 experiences
        {
          id: 'exp_1',
          user_id: userId,
          type: 'experience',
          title: 'Senior Developer',
          organization: 'Tech Corp',
          description: 'Full stack development',
          highlights: ['Led team'],
          start_date: '2020-01',
          end_date: '2023-12',
          embedding: Array(768).fill(0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'exp_2',
          user_id: userId,
          type: 'experience',
          title: 'Frontend Developer',
          organization: 'Web Co',
          description: 'React development',
          highlights: [],
          start_date: '2018-01',
          end_date: '2020-01',
          embedding: Array(768).fill(0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'exp_3',
          user_id: userId,
          type: 'experience',
          title: 'Backend Developer',
          organization: 'API Inc',
          description: 'Node.js APIs',
          highlights: [],
          start_date: '2016-01',
          end_date: '2018-01',
          embedding: Array(768).fill(0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // 2 education
        {
          id: 'edu_1',
          user_id: userId,
          type: 'education',
          title: 'BSc Computer Science',
          organization: 'University',
          description: 'GPA 3.8',
          highlights: [],
          start_date: '2012-09',
          end_date: '2016-05',
          embedding: Array(768).fill(0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'edu_2',
          user_id: userId,
          type: 'education',
          title: 'MSc Software Engineering',
          organization: 'Tech University',
          description: 'Thesis on distributed systems',
          highlights: [],
          start_date: '2016-09',
          end_date: '2018-05',
          embedding: Array(768).fill(0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // 5 skills
        ...Array(5).fill(null).map((_, i) => ({
          id: `skill_${i+1}`,
          user_id: userId,
          type: 'skill',
          title: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'][i],
          organization: null,
          description: 'Proficient',
          highlights: [],
          start_date: null,
          end_date: null,
          embedding: Array(768).fill(0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      ];

      // Mock embedding service
      jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(Array(768).fill(0));
      
      // Mock findRelevantComponents to return mock components
      jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: mockComponents,
        total: mockComponents.length,
      });

      // Act
      const result = await CVGeneratorService.calculateMatchScore(userId, jobDescription);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('matches');
      expect(result).toHaveProperty('suggestions');

      // Score should be between 0-100
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);

      // Matches breakdown
      expect(result.matches).toHaveProperty('experience');
      expect(result.matches).toHaveProperty('education');
      expect(result.matches).toHaveProperty('skills');
      
      // Note: Service counts from returned components (10 components total)
      expect(result.matches.experience).toBeGreaterThan(0);
      expect(result.matches.education).toBeGreaterThan(0);
      expect(result.matches.skills).toBeGreaterThan(0);

      // Suggestions should be an array
      expect(Array.isArray(result.suggestions)).toBe(true);
      
      // With good components, should have high score
      expect(result.score).toBeGreaterThan(50);

      // Verify console log
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('Calculating match score')
      );
    });
  });

  // ============================================
  // EDGE CASE TESTS
  // ============================================

  describe('Edge Cases', () => {
    /**
     * Test: Zero components = zero score
     */
    test('Given user with no components, When calculateMatchScore called, Then returns zero score with suggestions', async () => {
      // Arrange
      const userId = 'user_empty';
      const jobDescription = 'Software Engineer';

      // Mock no components
      jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(Array(768).fill(0));
      jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: [],
        total: 0,
      });

      // Act
      const result = await CVGeneratorService.calculateMatchScore(userId, jobDescription);

      // Assert
      expect(result.score).toBe(0);
      expect(result.matches.experience).toBe(0);
      expect(result.matches.education).toBe(0);
      expect(result.matches.skills).toBe(0);

      // Should have suggestions to improve
      expect(result.suggestions.length).toBeGreaterThan(0);
      
      // Suggestions should mention adding components
      const hasExperienceSuggestion = result.suggestions.some(s => 
        s.toLowerCase().includes('experience')
      );
      const hasEducationSuggestion = result.suggestions.some(s => 
        s.toLowerCase().includes('education')
      );
      const hasSkillsSuggestion = result.suggestions.some(s => 
        s.toLowerCase().includes('skill')
      );

      expect(hasExperienceSuggestion || hasEducationSuggestion || hasSkillsSuggestion).toBe(true);
    });

    /**
     * Test: Maximum components = high score
     */
    test('Given user with many relevant components, When calculateMatchScore called, Then returns high score', async () => {
      // Arrange
      const userId = 'user_perfect';
      const jobDescription = 'Senior Software Engineer';

      // Create many components for perfect score
      const mockComponents = [
        // 4+ experiences (max score 40)
        ...Array(4).fill(null).map((_, i) => ({
          id: `exp_${i+1}`,
          user_id: userId,
          type: 'experience',
          title: `Developer ${i+1}`,
          organization: `Company ${i+1}`,
          description: 'Work',
          highlights: [],
          start_date: '2020-01',
          end_date: '2023-12',
          embedding: Array(768).fill(0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        // 2+ education (max score 30)
        ...Array(2).fill(null).map((_, i) => ({
          id: `edu_${i+1}`,
          user_id: userId,
          type: 'education',
          title: `Degree ${i+1}`,
          organization: `University ${i+1}`,
          description: 'Study',
          highlights: [],
          start_date: '2016-09',
          end_date: '2020-05',
          embedding: Array(768).fill(0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        // 15+ skills (max score 30)
        ...Array(15).fill(null).map((_, i) => ({
          id: `skill_${i+1}`,
          user_id: userId,
          type: 'skill',
          title: `Skill ${i+1}`,
          organization: null,
          description: 'Proficient',
          highlights: [],
          start_date: null,
          end_date: null,
          embedding: Array(768).fill(0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      ];

      jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(Array(768).fill(0));
      jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: mockComponents,
        total: mockComponents.length,
      });

      // Act
      const result = await CVGeneratorService.calculateMatchScore(userId, jobDescription);

      // Assert
      expect(result.score).toBeGreaterThanOrEqual(90); // Near perfect score
      expect(result.matches.experience).toBeGreaterThanOrEqual(4);
      expect(result.matches.education).toBeGreaterThanOrEqual(2);
      expect(result.matches.skills).toBeGreaterThanOrEqual(15);

      // Should have few or no suggestions
      expect(result.suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling', () => {
    /**
     * Test: Error finding components
     */
    test('Given error finding components, When calculateMatchScore called, Then throws error', async () => {
      // Arrange
      const userId = 'user_error';
      const jobDescription = 'Software Engineer';

      // Mock embedding service to fail
      jest.spyOn(EmbeddingService, 'embed').mockRejectedValue(
        new Error('Embedding service unavailable')
      );

      // Act & Assert
      await expect(
        CVGeneratorService.calculateMatchScore(userId, jobDescription)
      ).rejects.toThrow();

      // Verify error was logged
      expect(global.console.error).toHaveBeenCalled();
    });
  });
});

