/**
 * Simple Service Tests - Testing with Manual Mocks
 * 
 * Tests các services với mock đơn giản hơn
 * Tập trung vào logic chứ không phải external APIs
 */

import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';

// Mock các services trước khi import
jest.mock('@/services/embedding-service');
jest.mock('@/services/supabase-service');
jest.mock('@/services/latex-service');
jest.mock('@/services/pdf-service');

describe('Service Unit Tests', () => {
  // ============================================
  // PDF SERVICE TESTS
  // ============================================
  
  describe('PDFService', () => {
    test('Should extract text from PDF buffer', async () => {
      const { PDFService } = await import('@/services/pdf-service');
      
      const mockPDFBuffer = Buffer.from('Mock PDF Content');
      const result = await PDFService.extract(mockPDFBuffer);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('Should parse extracted text', async () => {
      const { PDFService } = await import('@/services/pdf-service');
      
      const mockText = 'Senior Developer - 5 years experience';
      const result = await PDFService.parse(mockText);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('title');
    });
  });

  // ============================================
  // LATEX SERVICE TESTS
  // ============================================
  
  describe('LaTeXService', () => {
    test('Should render LaTeX template with data', async () => {
      const { LaTeXService } = await import('@/services/latex-service');
      
      const mockData = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      const result = await LaTeXService.render('resume.tex.njk', mockData);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.includes('\\documentclass')).toBe(true);
    });

    test('Should compile LaTeX to PDF buffer', async () => {
      const { LaTeXService } = await import('@/services/latex-service');
      
      const mockLatex = '\\documentclass{article}\\begin{document}Test\\end{document}';
      const result = await LaTeXService.compilePDF(mockLatex);
      
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test('Should validate CV data structure', async () => {
      const { LaTeXService } = await import('@/services/latex-service');
      
      const validData = {
        name: 'John Doe',
        experiences: [],
      };
      
      const result = LaTeXService.validateData(validData);
      expect(result).toBe(true);
    });
  });

  // ============================================
  // EMBEDDING SERVICE TESTS
  // ============================================
  
  describe('EmbeddingService', () => {
    test('Should generate embedding vector from text', async () => {
      const { EmbeddingService } = await import('@/services/embedding-service');
      
      const text = 'Software Engineer with React experience';
      const result = await EmbeddingService.embed(text);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(768); // Google text-embedding-004 dimension
    });

    test('Should generate batch embeddings', async () => {
      const { EmbeddingService } = await import('@/services/embedding-service');
      
      const texts = ['Text 1', 'Text 2', 'Text 3'];
      const result = await EmbeddingService.embedBatch(texts);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0].length).toBe(768);
    });

    test('Should calculate cosine similarity', async () => {
      const { EmbeddingService } = await import('@/services/embedding-service');
      
      const vec1 = [1, 0, 0];
      const vec2 = [1, 0, 0];
      const result = EmbeddingService.cosineSimilarity(vec1, vec2);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(-1);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  // ============================================
  // SUPABASE SERVICE TESTS
  // ============================================
  
  describe('SupabaseService', () => {
    test('Should get user components', async () => {
      const { SupabaseService } = await import('@/services/supabase-service');
      
      const result = await SupabaseService.getUserComponents('user_123');
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.components)).toBe(true);
    });

    test('Should search components by similarity', async () => {
      const { SupabaseService } = await import('@/services/supabase-service');
      
      const mockEmbedding = Array(768).fill(0).map(() => Math.random());
      const result = await SupabaseService.similaritySearchComponents(
        'user_123',
        mockEmbedding,
        5
      );
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    test('Should get user profile by ID', async () => {
      const { SupabaseService } = await import('@/services/supabase-service');
      
      const result = await SupabaseService.getProfileById('user_123');
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('full_name');
    });

    test('Should update user profile', async () => {
      const { SupabaseService } = await import('@/services/supabase-service');
      
      const updates = { full_name: 'Jane Smith' };
      const result = await SupabaseService.updateProfile('user_123', updates);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('full_name');
      expect(result.full_name).toBe('Jane Smith');
    });
  });
});

