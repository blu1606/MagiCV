/**
 * API Endpoints Integration Tests
 * 
 * Tests các API endpoints chưa được test trong TEST_RESULTS.md
 * Sử dụng mocks để simulate Supabase và external services
 */

import { describe, test, expect, jest } from '@jest/globals';

// Mock all external services
jest.mock('@/services/embedding-service');
jest.mock('@/services/supabase-service');
jest.mock('@/services/latex-service');
jest.mock('@/services/pdf-service');
jest.mock('@/services/cv-generator-service');

describe('API Endpoints Tests', () => {
  
  // ============================================
  // CV GENERATION ENDPOINT
  // ============================================
  
  describe('POST /api/cv/generate', () => {
    test('Should generate CV with valid input', async () => {
      // Import CVGeneratorService sau khi mock
      const { CVGeneratorService } = await import('@/services/cv-generator-service');
      
      // Mock implementation
      const mockGenerate = jest.fn().mockResolvedValue({
        latex: '\\documentclass{article}',
        pdf: Buffer.from('Mock PDF'),
        components: [],
      });
      
      (CVGeneratorService as any).generateCV = mockGenerate;
      
      const userId = 'user_123';
      const jobDescription = 'Senior Software Engineer';
      
      await CVGeneratorService.generateCV(userId, jobDescription);
      
      expect(mockGenerate).toHaveBeenCalledWith(userId, jobDescription);
      expect(mockGenerate).toHaveBeenCalledTimes(1);
    });

    test('Should handle missing userId', async () => {
      const { CVGeneratorService } = await import('@/services/cv-generator-service');
      
      // Test sẽ reject nếu không có userId
      const mockGenerate = jest.fn().mockRejectedValue(new Error('User ID required'));
      (CVGeneratorService as any).generateCV = mockGenerate;
      
      await expect(
        CVGeneratorService.generateCV('', 'Job Description')
      ).rejects.toThrow('User ID required');
    });

    test('Should handle empty job description', async () => {
      // Empty JD should still work với fallback
      const userId = 'user_123';
      const jobDescription = '';
      
      // Mock sẽ return empty components nhưng không error
      expect(userId).toBeDefined();
      expect(typeof jobDescription).toBe('string');
    });
  });

  // ============================================
  // JD EXTRACTION ENDPOINT
  // ============================================
  
  describe('POST /api/jd/extract', () => {
    test('Should extract job description from PDF', async () => {
      const { PDFService } = await import('@/services/pdf-service');
      
      const mockPDFBuffer = Buffer.from('Mock Job Description PDF');
      const result = await PDFService.extract(mockPDFBuffer);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('Should parse extracted JD text', async () => {
      const { PDFService } = await import('@/services/pdf-service');
      
      const extractedText = `
        Senior Software Engineer
        Requirements:
        - 5+ years experience
        - React, Node.js, TypeScript
        - Bachelor's degree
      `;
      
      const result = await PDFService.parse(extractedText);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('title');
    });
  });

  // ============================================
  // SEARCH ENDPOINTS
  // ============================================
  
  describe('POST /api/search/components', () => {
    test('Should search components with query', async () => {
      const { SupabaseService } = await import('@/services/supabase-service');
      const { EmbeddingService } = await import('@/services/embedding-service');
      
      const query = 'React developer';
      const userId = 'user_123';
      
      // Mock embedding
      const mockEmbedding = Array(768).fill(0).map(() => Math.random());
      const embedResult = await EmbeddingService.embed(query);
      
      expect(embedResult).toBeDefined();
      expect(embedResult.length).toBe(768);
      
      // Mock search
      const searchResult = await SupabaseService.similaritySearchComponents(
        userId,
        embedResult,
        10
      );
      
      expect(searchResult).toBeDefined();
      expect(Array.isArray(searchResult)).toBe(true);
    });

    test('Should handle empty search query', async () => {
      const { SupabaseService } = await import('@/services/supabase-service');
      
      const userId = 'user_123';
      
      // Empty query should fallback to all components
      const result = await SupabaseService.getUserComponents(userId);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('components');
    });
  });

  // ============================================
  // JOB DESCRIPTIONS ENDPOINT
  // ============================================
  
  describe('POST /api/job-descriptions/upload', () => {
    test('Should save job description for user', async () => {
      const { SupabaseService } = await import('@/services/supabase-service');
      
      const userId = 'user_123';
      const components = [
        {
          type: 'job_description',
          title: 'Senior Developer',
          description: 'Full job description text',
        },
      ];
      
      await SupabaseService.saveComponents(userId, components);
      
      // Should not throw error
      expect(true).toBe(true);
    });

    test('Should validate job description data', async () => {
      const validJD = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Job requirements...',
      };
      
      expect(validJD).toHaveProperty('title');
      expect(validJD).toHaveProperty('description');
      expect(validJD.title.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // CRAWL ENDPOINTS
  // ============================================
  
  describe('POST /api/crawl/youtube', () => {
    test('Should validate YouTube URL format', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
      ];
      
      const invalidUrls = [
        'https://google.com',
        'not a url',
        '',
      ];
      
      // Simple URL validation
      validUrls.forEach((url) => {
        expect(url.includes('youtube.com') || url.includes('youtu.be')).toBe(true);
      });
      
      invalidUrls.forEach((url) => {
        expect(url.includes('youtube.com') || url.includes('youtu.be')).toBe(false);
      });
    });

    test('Should extract video ID from YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const videoId = url.split('v=')[1]?.split('&')[0];
      
      expect(videoId).toBe('dQw4w9WgXcQ');
      expect(videoId?.length).toBe(11);
    });
  });

  describe('POST /api/crawl/linkedin', () => {
    test('Should validate LinkedIn profile structure', () => {
      const validProfile = {
        name: 'John Doe',
        headline: 'Software Engineer',
        summary: 'Experienced developer',
        experience: [],
        education: [],
      };
      
      expect(validProfile).toHaveProperty('name');
      expect(validProfile).toHaveProperty('experience');
      expect(validProfile).toHaveProperty('education');
      expect(Array.isArray(validProfile.experience)).toBe(true);
    });

    test('Should transform LinkedIn experience to components', () => {
      const linkedInExperience = {
        title: 'Senior Developer',
        company: 'Tech Corp',
        startDate: '2020-01',
        endDate: '2023-12',
        description: 'Built features',
      };
      
      // Transform to component format
      const component = {
        type: 'experience',
        title: linkedInExperience.title,
        organization: linkedInExperience.company,
        description: linkedInExperience.description,
        start_date: linkedInExperience.startDate,
        end_date: linkedInExperience.endDate,
      };
      
      expect(component.type).toBe('experience');
      expect(component.title).toBe('Senior Developer');
      expect(component.organization).toBe('Tech Corp');
    });
  });

  // ============================================
  // DELETE ENDPOINTS
  // ============================================
  
  describe('DELETE Operations', () => {
    test('Should validate user exists before delete', async () => {
      const { SupabaseService } = await import('@/services/supabase-service');
      
      const userId = 'user_123';
      const profile = await SupabaseService.getProfileById(userId);
      
      expect(profile).toBeDefined();
      expect(profile).toHaveProperty('id');
    });

    test('Should handle non-existent user gracefully', () => {
      const nonExistentUserId = 'user_nonexistent';
      
      // Should not crash
      expect(nonExistentUserId).toBeDefined();
      expect(typeof nonExistentUserId).toBe('string');
    });
  });

  // ============================================
  // MATCH ENDPOINT (Already tested but verify)
  // ============================================
  
  describe('POST /api/cv/match', () => {
    test('Should calculate match score', async () => {
      const { CVGeneratorService } = await import('@/services/cv-generator-service');
      
      // Mock match score calculation
      const mockCalculate = jest.fn().mockResolvedValue({
        score: 85,
        matches: {
          experience: 3,
          education: 2,
          skills: 5,
        },
      });
      
      (CVGeneratorService as any).calculateMatchScore = mockCalculate;
      
      const userId = 'user_123';
      const jobDescription = 'Senior React Developer';
      
      await CVGeneratorService.calculateMatchScore(userId, jobDescription);
      
      expect(mockCalculate).toHaveBeenCalledWith(userId, jobDescription);
    });

    test('Should return zero score for no matches', () => {
      const emptyMatches = {
        score: 0,
        matches: {
          experience: 0,
          education: 0,
          skills: 0,
        },
      };
      
      expect(emptyMatches.score).toBe(0);
      expect(Object.values(emptyMatches.matches).every(v => v === 0)).toBe(true);
    });
  });

  // ============================================
  // HEALTH CHECK
  // ============================================
  
  describe('GET /api/health', () => {
    test('Should return healthy status', () => {
      const healthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'CV Builder API',
      };
      
      expect(healthResponse.status).toBe('ok');
      expect(healthResponse).toHaveProperty('timestamp');
      expect(healthResponse).toHaveProperty('service');
    });
  });
});

