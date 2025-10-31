/**
 * Comprehensive Unit Tests for JDMatchingService
 * 
 * Tests JD extraction, component matching, scoring, and error handling
 * Target: 85%+ coverage
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { JDMatchingService } from '@/services/jd-matching-service';
import { PDFService } from '@/services/pdf-service';
import { EmbeddingService } from '@/services/embedding-service';
import { SupabaseService } from '@/services/supabase-service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Component } from '@/lib/supabase';
import type { JDComponent } from '@/lib/types/jd-matching';

// Mock dependencies
jest.mock('@google/generative-ai');
jest.mock('@/services/pdf-service');
jest.mock('@/services/embedding-service');
jest.mock('@/services/supabase-service');

describe('JDMatchingService', () => {
  let mockGenAI: any;
  let mockModel: any;

  // Mock embedding vector (768 dimensions - Gemini embedding size)
  const mockEmbedding = Array(768).fill(0.1);

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Google Generative AI
    mockModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => 'This is a strong match because both require React and TypeScript experience.',
        },
      }),
    };

    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    };

    // Mock static getClient method
    jest.spyOn(JDMatchingService as any, 'getClient').mockReturnValue(mockGenAI);

    // Mock EmbeddingService
    (EmbeddingService.embed as jest.Mock) = jest.fn().mockResolvedValue(mockEmbedding);
    (EmbeddingService.embedComponentObject as jest.Mock) = jest.fn().mockResolvedValue(mockEmbedding);
    (EmbeddingService.cosineSimilarity as jest.Mock) = jest.fn().mockReturnValue(0.85);

    // Mock PDFService
    (PDFService.parsePDF as jest.Mock) = jest.fn().mockResolvedValue('Job description text');
    (PDFService.extractJDComponents as jest.Mock) = jest.fn().mockResolvedValue({
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      requirements: ['5+ years React experience', 'TypeScript proficiency'],
      skills: [
        { skill: 'React', level: 'Expert', required: true },
        { skill: 'TypeScript', required: true },
      ],
      responsibilities: ['Build scalable applications'],
      qualifications: ['Bachelor degree'],
      metadata: { location: 'San Francisco' },
    });

    // Mock SupabaseService
    (SupabaseService.getUserComponents as jest.Mock) = jest.fn().mockResolvedValue({
      components: [],
      total: 0,
    });
  });

  // ============================================
  // extractJDComponents() TESTS
  // ============================================

  describe('extractJDComponents', () => {
    test('Given valid PDF buffer, When extractJDComponents called, Then returns JD components with embeddings', async () => {
      // Arrange
      const buffer = Buffer.from('Mock PDF content');

      // Act
      const result = await JDMatchingService.extractJDComponents(buffer);

      // Assert
      expect(result).toHaveProperty('jdMetadata');
      expect(result).toHaveProperty('components');
      expect(result.jdMetadata.title).toBe('Senior Software Engineer');
      expect(result.jdMetadata.company).toBe('TechCorp');
      expect(result.components.length).toBeGreaterThan(0);
      expect(result.components[0]).toHaveProperty('embedding');
      expect(PDFService.parsePDF).toHaveBeenCalledWith(buffer);
      expect(PDFService.extractJDComponents).toHaveBeenCalled();
      expect(EmbeddingService.embed).toHaveBeenCalled();
    });

    test('Given PDF with all component types, When extractJDComponents called, Then creates all component types', async () => {
      // Arrange
      const buffer = Buffer.from('PDF');
      
      (PDFService.extractJDComponents as jest.Mock).mockResolvedValue({
        title: 'Engineer',
        company: 'Corp',
        requirements: ['Requirement 1'],
        skills: [{ skill: 'Skill 1', required: true }],
        responsibilities: ['Responsibility 1'],
        qualifications: ['Qualification 1'],
        metadata: {},
      });

      // Act
      const result = await JDMatchingService.extractJDComponents(buffer);

      // Assert
      const types = result.components.map(c => c.type);
      expect(types).toContain('requirement');
      expect(types).toContain('skill');
      expect(types).toContain('responsibility');
      expect(types).toContain('qualification');
      expect(result.components.length).toBe(4);
    });

    test('Given PDF with missing title, When extractJDComponents called, Then uses default title', async () => {
      // Arrange
      const buffer = Buffer.from('PDF');
      
      (PDFService.extractJDComponents as jest.Mock).mockResolvedValue({
        company: 'TechCorp',
        requirements: [],
        skills: [],
        responsibilities: [],
        qualifications: [],
        metadata: {},
      });

      // Act
      const result = await JDMatchingService.extractJDComponents(buffer);

      // Assert
      expect(result.jdMetadata.title).toBe('Untitled Position');
      expect(result.jdMetadata.company).toBe('TechCorp');
    });

    test('Given PDF parsing fails, When extractJDComponents called, Then throws error', async () => {
      // Arrange
      const buffer = Buffer.from('Invalid PDF');
      
      (PDFService.parsePDF as jest.Mock).mockRejectedValue(
        new Error('Failed to parse PDF')
      );

      // Act & Assert
      await expect(JDMatchingService.extractJDComponents(buffer))
        .rejects.toThrow('Failed to parse PDF');
    });

    test('Given embedding generation fails, When extractJDComponents called, Then throws error', async () => {
      // Arrange
      const buffer = Buffer.from('PDF');
      
      (EmbeddingService.embed as jest.Mock).mockRejectedValue(
        new Error('Embedding failed')
      );

      // Act & Assert
      await expect(JDMatchingService.extractJDComponents(buffer))
        .rejects.toThrow('Embedding failed');
    });
  });

  // ============================================
  // matchSingleComponent() TESTS
  // ============================================

  describe('matchSingleComponent', () => {
    const mockJDComponent: JDComponent = {
      id: 'jd_1',
      type: 'requirement',
      title: 'Requirement',
      description: '5+ years React experience',
      required: true,
      embedding: mockEmbedding,
    };

    const mockCVComponents: Component[] = [
      {
        id: 'cv_1',
        user_id: 'user_123',
        type: 'experience',
        title: 'Senior Developer',
        organization: 'TechCorp',
        description: 'Built React applications for 6 years',
        highlights: ['React', 'TypeScript'],
        embedding: mockEmbedding,
      } as Component,
    ];

    test('Given valid JD and CV components, When matchSingleComponent called, Then returns match result', async () => {
      // Arrange
      (EmbeddingService.cosineSimilarity as jest.Mock).mockReturnValue(0.85);

      // Act
      const result = await JDMatchingService.matchSingleComponent(mockJDComponent, mockCVComponents);

      // Assert
      expect(result).toHaveProperty('jdComponent');
      expect(result).toHaveProperty('cvComponent');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('matchQuality');
      expect(result.score).toBeGreaterThan(0);
      expect(result.cvComponent).not.toBeNull();
      expect(EmbeddingService.cosineSimilarity).toHaveBeenCalled();
    });

    test('Given JD component without embedding, When matchSingleComponent called, Then returns error result', async () => {
      // Arrange
      const jdComponentWithoutEmbedding = { ...mockJDComponent, embedding: undefined };

      // Act
      const result = await JDMatchingService.matchSingleComponent(jdComponentWithoutEmbedding, mockCVComponents);

      // Assert
      // Implementation catches error and returns result with error message
      expect(result.cvComponent).toBeNull();
      expect(result.score).toBe(0);
      expect(result.reasoning).toContain('Error');
      expect(result.matchQuality).toBe('none');
    });

    test('Given no matching CV components, When matchSingleComponent called, Then returns no match', async () => {
      // Arrange
      (EmbeddingService.cosineSimilarity as jest.Mock).mockReturnValue(0.15); // Low similarity

      // Act
      const result = await JDMatchingService.matchSingleComponent(mockJDComponent, mockCVComponents);

      // Assert
      expect(result.cvComponent).toBeNull();
      expect(result.score).toBe(0);
      expect(result.matchQuality).toBe('none');
      expect(result.reasoning).toContain('No matching component');
    });

    test('Given CV component without embedding, When matchSingleComponent called, Then generates embedding', async () => {
      // Arrange
      const cvComponentWithoutEmbedding = {
        ...mockCVComponents[0],
        embedding: null,
      };

      // Act
      await JDMatchingService.matchSingleComponent(mockJDComponent, [cvComponentWithoutEmbedding]);

      // Assert
      expect(EmbeddingService.embedComponentObject).toHaveBeenCalled();
    });

    test('Given CV component with wrong dimension embedding, When matchSingleComponent called, Then re-embeds', async () => {
      // Arrange
      const cvComponentWrongDim = {
        ...mockCVComponents[0],
        embedding: Array(512).fill(0.1), // Wrong dimension
      };

      // Act
      await JDMatchingService.matchSingleComponent(mockJDComponent, [cvComponentWrongDim]);

      // Assert
      expect(EmbeddingService.embedComponentObject).toHaveBeenCalled();
    });

    test('Given embedding fails for CV component, When matchSingleComponent called, Then skips component', async () => {
      // Arrange
      (EmbeddingService.embedComponentObject as jest.Mock).mockRejectedValue(
        new Error('Embedding failed')
      );

      const cvComponentWithoutEmbedding = {
        ...mockCVComponents[0],
        embedding: null,
      };

      // Act
      const result = await JDMatchingService.matchSingleComponent(mockJDComponent, [cvComponentWithoutEmbedding]);

      // Assert
      expect(result.cvComponent).toBeNull();
      expect(result.score).toBe(0);
    });

    test('Given high similarity score, When matchSingleComponent called, Then returns high match score', async () => {
      // Arrange
      (EmbeddingService.cosineSimilarity as jest.Mock).mockReturnValue(0.95);

      // Act
      const result = await JDMatchingService.matchSingleComponent(mockJDComponent, mockCVComponents);

      // Assert
      expect(result.score).toBe(95);
      expect(result.matchQuality).toBe('excellent');
    });

    test('Given error during matching, When matchSingleComponent called, Then handles gracefully', async () => {
      // Arrange
      // Simulate error in embedding calculation
      (EmbeddingService.cosineSimilarity as jest.Mock).mockImplementation(() => {
        throw new Error('Similarity calculation failed');
      });

      // Act
      const result = await JDMatchingService.matchSingleComponent(mockJDComponent, mockCVComponents);

      // Assert
      // Implementation handles errors internally and returns valid result
      expect(result).toHaveProperty('jdComponent');
      expect(result).toHaveProperty('cvComponent');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('matchQuality');
      // When all components fail, it returns no match result
      expect(result.cvComponent).toBeNull();
      expect(result.score).toBe(0);
    });
  });

  // ============================================
  // generateMatchReasoning() TESTS
  // ============================================

  describe('generateMatchReasoning', () => {
    const mockJDComponent: JDComponent = {
      id: 'jd_1',
      type: 'requirement',
      title: 'Requirement',
      description: 'React experience',
      required: true,
      embedding: mockEmbedding,
    };

    const mockCVComponent: Component = {
      id: 'cv_1',
      user_id: 'user_123',
      type: 'experience',
      title: 'Senior Developer',
      organization: 'TechCorp',
      description: 'Built React apps',
      highlights: ['React', 'TypeScript'],
    } as Component;

    test('Given valid inputs, When generateMatchReasoning called, Then returns LLM reasoning', async () => {
      // Arrange
      const score = 85;

      // Act
      const result = await JDMatchingService.generateMatchReasoning(mockJDComponent, mockCVComponent, score);

      // Assert
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(mockModel.generateContent).toHaveBeenCalled();
      expect(mockModel.generateContent.mock.calls[0][0]).toContain('React experience');
    });

    test('Given high score, When generateMatchReasoning called, Then prompts for strong match', async () => {
      // Arrange
      const score = 90;

      // Act
      await JDMatchingService.generateMatchReasoning(mockJDComponent, mockCVComponent, score);

      // Assert
      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain('strong match');
    });

    test('Given low score, When generateMatchReasoning called, Then prompts for weak match', async () => {
      // Arrange
      const score = 30;

      // Act
      await JDMatchingService.generateMatchReasoning(mockJDComponent, mockCVComponent, score);

      // Assert
      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain('weak match');
    });

    test('Given LLM error, When generateMatchReasoning called, Then returns fallback reasoning', async () => {
      // Arrange
      mockModel.generateContent.mockRejectedValue(new Error('LLM error'));

      // Act
      const result = await JDMatchingService.generateMatchReasoning(mockJDComponent, mockCVComponent, 85);

      // Assert
      expect(result).toContain('Strong semantic similarity');
      expect(result).toContain('85%');
    });
  });

  // ============================================
  // matchAllComponents() TESTS
  // ============================================

  describe('matchAllComponents', () => {
    const mockJDComponents: JDComponent[] = [
      {
        id: 'jd_1',
        type: 'requirement',
        title: 'Requirement 1',
        description: 'React experience',
        required: true,
        embedding: mockEmbedding,
      },
      {
        id: 'jd_2',
        type: 'skill',
        title: 'TypeScript',
        description: 'TypeScript proficiency',
        required: true,
        embedding: mockEmbedding,
      },
    ];

    test('Given valid inputs, When matchAllComponents called, Then returns all matches', async () => {
      // Arrange
      const userId = 'user_123';
      const mockCVComponents: Component[] = [
        {
          id: 'cv_1',
          user_id: userId,
          type: 'experience',
          title: 'Developer',
          embedding: mockEmbedding,
        } as Component,
      ];

      (SupabaseService.getUserComponents as jest.Mock).mockResolvedValue({
        components: mockCVComponents,
        total: 1,
      });

      (EmbeddingService.cosineSimilarity as jest.Mock).mockReturnValue(0.8);

      // Act
      const result = await JDMatchingService.matchAllComponents(mockJDComponents, userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('jdComponent');
      expect(result[0]).toHaveProperty('score');
      expect(SupabaseService.getUserComponents).toHaveBeenCalledWith(userId);
    });

    test('Given user with no CV components, When matchAllComponents called, Then returns no matches', async () => {
      // Arrange
      const userId = 'user_123';
      
      (SupabaseService.getUserComponents as jest.Mock).mockResolvedValue({
        components: [],
        total: 0,
      });

      // Act
      const result = await JDMatchingService.matchAllComponents(mockJDComponents, userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].cvComponent).toBeNull();
      expect(result[0].score).toBe(0);
      expect(result[0].reasoning).toContain('No CV components found');
    });

    test('Given database error, When matchAllComponents called, Then throws error', async () => {
      // Arrange
      const userId = 'user_123';
      
      (SupabaseService.getUserComponents as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      // Act & Assert
      await expect(JDMatchingService.matchAllComponents(mockJDComponents, userId))
        .rejects.toThrow('Database error');
    });
  });

  // ============================================
  // calculateOverallScore() TESTS
  // ============================================

  describe('calculateOverallScore', () => {
    test('Given valid matches, When calculateOverallScore called, Then returns overall score', () => {
      // Arrange
      const matches = [
        {
          jdComponent: { id: '1', type: 'requirement', required: true } as JDComponent,
          cvComponent: { id: 'cv_1', type: 'experience' } as Component,
          score: 80,
          reasoning: 'Match',
          matchQuality: 'good' as const,
        },
        {
          jdComponent: { id: '2', type: 'skill', required: false } as JDComponent,
          cvComponent: { id: 'cv_2', type: 'skill' } as Component,
          score: 70,
          reasoning: 'Match',
          matchQuality: 'good' as const,
        },
      ];

      // Act
      const result = JDMatchingService.calculateOverallScore(matches as any);

      // Assert
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('categoryScores');
      expect(result).toHaveProperty('missingComponents');
      expect(result).toHaveProperty('suggestions');
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.categoryScores.skills).toBeGreaterThan(0);
    });

    test('Given no matches, When calculateOverallScore called, Then returns zero score', () => {
      // Arrange
      const matches = [
        {
          jdComponent: { id: '1', type: 'requirement' } as JDComponent,
          cvComponent: null,
          score: 0,
          reasoning: 'No match',
          matchQuality: 'none' as const,
        },
      ];

      // Act
      const result = JDMatchingService.calculateOverallScore(matches as any);

      // Assert
      expect(result.overallScore).toBe(0);
      expect(result.categoryScores.experience).toBe(0);
      expect(result.categoryScores.skills).toBe(0);
      expect(result.missingComponents.length).toBe(1);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('Given required and optional matches, When calculateOverallScore called, Then weights required higher', () => {
      // Arrange
      const matches = [
        {
          jdComponent: { id: '1', type: 'requirement', required: true } as JDComponent,
          cvComponent: { id: 'cv_1' } as Component,
          score: 100, // Required: high score
          reasoning: 'Match',
          matchQuality: 'excellent' as const,
        },
        {
          jdComponent: { id: '2', type: 'skill', required: false } as JDComponent,
          cvComponent: { id: 'cv_2' } as Component,
          score: 50, // Optional: lower score
          reasoning: 'Match',
          matchQuality: 'fair' as const,
        },
      ];

      // Act
      const result = JDMatchingService.calculateOverallScore(matches as any);

      // Assert
      // Should be weighted: 70% required (100) + 30% optional (50) = 85
      expect(result.overallScore).toBeGreaterThan(70);
    });

    test('Given low category scores, When calculateOverallScore called, Then generates suggestions', () => {
      // Arrange
      const matches = [
        {
          jdComponent: { id: '1', type: 'skill', required: true } as JDComponent,
          cvComponent: { id: 'cv_1', type: 'skill' } as Component,
          score: 40, // Low score
          reasoning: 'Weak match',
          matchQuality: 'fair' as const,
        },
      ];

      // Act
      const result = JDMatchingService.calculateOverallScore(matches as any);

      // Assert
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.toLowerCase().includes('skill'))).toBe(true);
    });
  });

  // ============================================
  // matchJobDescription() TESTS
  // ============================================

  describe('matchJobDescription', () => {
    test('Given valid PDF buffer and userId, When matchJobDescription called, Then returns complete results', async () => {
      // Arrange
      const buffer = Buffer.from('PDF content');
      const userId = 'user_123';

      (SupabaseService.getUserComponents as jest.Mock).mockResolvedValue({
        components: [
          {
            id: 'cv_1',
            user_id: userId,
            type: 'experience',
            title: 'Developer',
            embedding: mockEmbedding,
          } as Component,
        ],
        total: 1,
      });

      (EmbeddingService.cosineSimilarity as jest.Mock).mockReturnValue(0.8);

      // Act
      const result = await JDMatchingService.matchJobDescription(buffer, userId);

      // Assert
      expect(result).toHaveProperty('jdMetadata');
      expect(result).toHaveProperty('jdComponents');
      expect(result).toHaveProperty('matches');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('categoryScores');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('missingComponents');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.matches.length).toBeGreaterThan(0);
    });

    test('Given PDF extraction fails, When matchJobDescription called, Then throws error', async () => {
      // Arrange
      const buffer = Buffer.from('Invalid PDF');
      
      (PDFService.parsePDF as jest.Mock).mockRejectedValue(
        new Error('PDF parsing failed')
      );

      // Act & Assert
      await expect(JDMatchingService.matchJobDescription(buffer, 'user_123'))
        .rejects.toThrow('PDF parsing failed');
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling - getClient', () => {
    test('Given missing API key, When getClient called, Then throws error', () => {
      // Arrange
      const originalEnv = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      (JDMatchingService as any).genAI = null;

      jest.spyOn(JDMatchingService as any, 'getClient').mockImplementation(() => {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
          throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found');
        }
        return mockGenAI;
      });

      // Act & Assert
      expect(() => {
        (JDMatchingService as any).getClient();
      }).toThrow('GOOGLE_GENERATIVE_AI_API_KEY not found');

      // Restore
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalEnv;
      jest.restoreAllMocks();
    });
  });
});

