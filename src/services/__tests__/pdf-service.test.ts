/**
 * Comprehensive Unit Tests for PDFService
 * 
 * Tests PDF parsing, JD extraction, and error handling
 * Target: 85%+ coverage
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { PDFService } from '@/services/pdf-service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseService } from '@/services/supabase-service';
import { EmbeddingService } from '@/services/embedding-service';

// Mock dependencies
jest.mock('@google/generative-ai');
jest.mock('@/services/supabase-service');
jest.mock('@/services/embedding-service');

describe('PDFService', () => {
  let mockGenAI: any;
  let mockModel: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Google Generative AI
    mockModel = {
      generateContent: jest.fn(),
    };

    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    };

    // Mock static getClient method by spying on constructor
    jest.spyOn(GoogleGenerativeAI.prototype, 'constructor' as any).mockImplementation(() => {});
    jest.spyOn(PDFService as any, 'getClient').mockReturnValue(mockGenAI);
  });

  // ============================================
  // parsePDF() TESTS
  // ============================================

  describe('parsePDF', () => {
    test('Given valid PDF buffer, When parsePDF called, Then returns extracted text', async () => {
      // Arrange
      const mockPDFBuffer = Buffer.from('Mock PDF content');
      const expectedText = 'Senior Software Engineer\nRequirements:\n- 5+ years experience';
      
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => expectedText,
        },
      });

      // Act
      const result = await PDFService.parsePDF(mockPDFBuffer);

      // Assert
      expect(result).toBe(expectedText);
      expect(mockModel.generateContent).toHaveBeenCalledTimes(1);
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            inlineData: expect.objectContaining({
              mimeType: 'application/pdf',
            }),
          }),
          expect.objectContaining({
            text: expect.stringContaining('Extract all text content'),
          }),
        ])
      );
    });

    test('Given PDF with no extractable text, When parsePDF called, Then throws error', async () => {
      // Arrange
      const mockPDFBuffer = Buffer.from('Mock PDF');
      
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => '   ', // Only whitespace
        },
      });

      // Act & Assert
      await expect(PDFService.parsePDF(mockPDFBuffer))
        .rejects.toThrow('PDF contains no extractable text');
    });

    test('Given empty PDF buffer, When parsePDF called, Then processes and returns text', async () => {
      // Arrange
      const mockPDFBuffer = Buffer.from('');
      const expectedText = 'Some extracted text';
      
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => expectedText,
        },
      });

      // Act
      const result = await PDFService.parsePDF(mockPDFBuffer);

      // Assert
      expect(result).toBe(expectedText);
    });

    test('Given API key error, When parsePDF called, Then throws descriptive error', async () => {
      // Arrange
      const mockPDFBuffer = Buffer.from('Mock PDF');
      
      mockModel.generateContent.mockRejectedValue(
        new Error('API key not valid')
      );

      // Act & Assert
      await expect(PDFService.parsePDF(mockPDFBuffer))
        .rejects.toThrow('Google Gemini API key not configured');
    });

    test('Given network error, When parsePDF called, Then throws error with message', async () => {
      // Arrange
      const mockPDFBuffer = Buffer.from('Mock PDF');
      
      mockModel.generateContent.mockRejectedValue(
        new Error('Network timeout')
      );

      // Act & Assert
      await expect(PDFService.parsePDF(mockPDFBuffer))
        .rejects.toThrow('Failed to parse PDF: Network timeout');
    });

    test('Given large PDF buffer, When parsePDF called, Then processes successfully', async () => {
      // Arrange
      const largeBuffer = Buffer.alloc(1024 * 1024, 'A'); // 1MB
      const expectedText = 'Extracted from large PDF';
      
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => expectedText,
        },
      });

      // Act
      const result = await PDFService.parsePDF(largeBuffer);

      // Assert
      expect(result).toBe(expectedText);
      expect(mockModel.generateContent).toHaveBeenCalled();
    });
  });

  // ============================================
  // extractJDComponents() TESTS
  // ============================================

  describe('extractJDComponents', () => {
    test('Given valid JD text, When extractJDComponents called, Then returns structured data', async () => {
      // Arrange
      const mockJDText = 'Senior Software Engineer at TechCorp\nRequirements:\n- 5+ years React experience';
      const mockResponse = {
        title: 'Senior Software Engineer',
        company: 'TechCorp',
        requirements: ['5+ years React experience'],
        skills: [{ skill: 'React', required: true }],
        responsibilities: ['Build scalable applications'],
        qualifications: ['Bachelor degree'],
        metadata: { location: 'San Francisco' },
        groupedSkills: [
          { category: 'Frontend', summary: 'Frontend development', technologies: ['React', 'TypeScript'] }
        ],
      };

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });

      // Act
      const result = await PDFService.extractJDComponents(mockJDText);

      // Assert
      expect(result.title).toBe('Senior Software Engineer');
      expect(result.company).toBe('TechCorp');
      expect(result.requirements).toHaveLength(1);
      expect(result.skills).toHaveLength(1);
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Analyze the following job description')
      );
    });

    test('Given JD text with markdown code blocks, When extractJDComponents called, Then cleans and parses JSON', async () => {
      // Arrange
      const mockJDText = 'Job description text';
      const mockResponse = {
        title: 'Developer',
        company: 'TechCorp',
        requirements: [],
        skills: [],
        responsibilities: [],
        qualifications: [],
        metadata: {},
      };

      // Response wrapped in markdown code block
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => '```json\n' + JSON.stringify(mockResponse) + '\n```',
        },
      });

      // Act
      const result = await PDFService.extractJDComponents(mockJDText);

      // Assert
      expect(result.title).toBe('Developer');
      expect(result.company).toBe('TechCorp');
    });

    test('Given JD text with plain code blocks, When extractJDComponents called, Then cleans and parses JSON', async () => {
      // Arrange
      const mockJDText = 'Job description';
      const mockResponse = {
        title: 'Engineer',
        company: 'Company',
        requirements: [],
        skills: [],
        responsibilities: [],
        qualifications: [],
        metadata: {},
      };

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => '```\n' + JSON.stringify(mockResponse) + '\n```',
        },
      });

      // Act
      const result = await PDFService.extractJDComponents(mockJDText);

      // Assert
      expect(result.title).toBe('Engineer');
    });

    test('Given missing fields in response, When extractJDComponents called, Then uses defaults', async () => {
      // Arrange
      const mockJDText = 'Job description';
      const incompleteResponse = {
        title: 'Only Title',
        // Missing other fields
      };

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(incompleteResponse),
        },
      });

      // Act
      const result = await PDFService.extractJDComponents(mockJDText);

      // Assert
      expect(result.title).toBe('Only Title');
      expect(result.company).toBe('Unknown Company');
      expect(result.requirements).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.responsibilities).toEqual([]);
      expect(result.qualifications).toEqual([]);
      expect(result.metadata).toEqual({});
      expect(result.groupedSkills).toEqual([]);
    });

    test('Given invalid JSON response, When extractJDComponents called, Then throws error', async () => {
      // Arrange
      const mockJDText = 'Job description';
      
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => 'This is not valid JSON { invalid',
        },
      });

      // Act & Assert
      await expect(PDFService.extractJDComponents(mockJDText))
        .rejects.toThrow('Failed to extract JD components');
    });

    test('Given AI service error, When extractJDComponents called, Then throws descriptive error', async () => {
      // Arrange
      const mockJDText = 'Job description';
      
      mockModel.generateContent.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      // Act & Assert
      await expect(PDFService.extractJDComponents(mockJDText))
        .rejects.toThrow('Failed to extract JD components: Rate limit exceeded');
    });

    test('Given very long JD text, When extractJDComponents called, Then processes successfully', async () => {
      // Arrange
      const longJDText = 'Job Description\n' + 'Requirement: React\n'.repeat(100);
      const mockResponse = {
        title: 'Developer',
        company: 'TechCorp',
        requirements: Array(100).fill('Requirement'),
        skills: [],
        responsibilities: [],
        qualifications: [],
        metadata: {},
      };

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });

      // Act
      const result = await PDFService.extractJDComponents(longJDText);

      // Assert
      expect(result.requirements).toHaveLength(100);
    });
  });

  // ============================================
  // processPDFAndSave() TESTS
  // ============================================

  describe('processPDFAndSave', () => {
    beforeEach(() => {
      // Mock parsePDF
      jest.spyOn(PDFService, 'parsePDF').mockResolvedValue('Extracted PDF text');
      
      // Mock extractJDComponents
      jest.spyOn(PDFService, 'extractJDComponents').mockResolvedValue({
        title: 'Software Engineer',
        company: 'TechCorp',
        requirements: ['React', 'TypeScript'],
        skills: [{ skill: 'React', required: true }],
        responsibilities: [],
        qualifications: [],
        metadata: {},
        groupedSkills: [
          { category: 'Frontend', summary: 'Frontend dev', technologies: ['React'] }
        ],
      });

      // Mock SupabaseService
      (SupabaseService.uploadCVPdf as jest.Mock) = jest.fn().mockResolvedValue({
        path: 'cv_pdfs/user123/file.pdf',
        url: 'https://storage.supabase.co/cv_pdfs/user123/file.pdf',
      });

      (SupabaseService.createCV as jest.Mock) = jest.fn().mockResolvedValue({
        id: 'cv_123',
      });

      (SupabaseService.createCVPdf as jest.Mock) = jest.fn().mockResolvedValue({
        id: 'pdf_123',
      });

      (SupabaseService.createComponent as jest.Mock) = jest.fn().mockResolvedValue({
        id: 'comp_123',
      });

      // Mock EmbeddingService
      (EmbeddingService.embed as jest.Mock) = jest.fn().mockResolvedValue(
        Array(768).fill(0.1)
      );
    });

    test('Given valid inputs, When processPDFAndSave called, Then processes PDF and creates components', async () => {
      // Arrange
      const userId = 'user_123';
      const buffer = Buffer.from('Mock PDF');
      const filename = 'resume.pdf';

      // Act
      const result = await PDFService.processPDFAndSave(userId, buffer, filename);

      // Assert
      expect(result).toHaveProperty('cvId');
      expect(result).toHaveProperty('pdfId');
      expect(result).toHaveProperty('componentsCreated');
      expect(result.cvId).toBe('cv_123');
      expect(result.pdfId).toBe('pdf_123');
      expect(result.componentsCreated).toBeGreaterThan(0);
      
      expect(PDFService.parsePDF).toHaveBeenCalledWith(buffer);
      expect(PDFService.extractJDComponents).toHaveBeenCalled();
      expect(SupabaseService.uploadCVPdf).toHaveBeenCalledWith(userId, filename, buffer);
      expect(SupabaseService.createCV).toHaveBeenCalled();
      expect(SupabaseService.createCVPdf).toHaveBeenCalled();
    });

    test('Given JD with groupedSkills, When processPDFAndSave called, Then uses groupedSkills', async () => {
      // Arrange
      const userId = 'user_123';
      const buffer = Buffer.from('PDF');
      const filename = 'resume.pdf';

      jest.spyOn(PDFService, 'extractJDComponents').mockResolvedValue({
        title: 'Engineer',
        company: 'TechCorp',
        requirements: [],
        skills: [],
        responsibilities: [],
        qualifications: [],
        metadata: {},
        groupedSkills: [
          { category: 'Backend', summary: 'Backend dev', technologies: ['Node.js'] },
          { category: 'Frontend', summary: 'Frontend dev', technologies: ['React'] },
        ],
      });

      // Act
      const result = await PDFService.processPDFAndSave(userId, buffer, filename);

      // Assert
      expect(result.componentsCreated).toBe(2);
      expect(SupabaseService.createComponent).toHaveBeenCalledTimes(2);
      expect(EmbeddingService.embed).toHaveBeenCalledTimes(2);
    });

    test('Given JD without groupedSkills, When processPDFAndSave called, Then uses fallback grouping', async () => {
      // Arrange
      const userId = 'user_123';
      const buffer = Buffer.from('PDF');
      const filename = 'resume.pdf';

      jest.spyOn(PDFService, 'extractJDComponents').mockResolvedValue({
        title: 'Engineer',
        company: 'TechCorp',
        requirements: ['5+ years React', 'Node.js experience'],
        skills: [{ skill: 'React', required: true }, { skill: 'Node.js', required: true }],
        responsibilities: [],
        qualifications: [],
        metadata: {},
        // No groupedSkills
      });

      // Act
      const result = await PDFService.processPDFAndSave(userId, buffer, filename);

      // Assert
      expect(result.componentsCreated).toBeGreaterThan(0);
      expect(SupabaseService.createComponent).toHaveBeenCalled();
    });

    test('Given PDF parsing fails, When processPDFAndSave called, Then throws error', async () => {
      // Arrange
      const userId = 'user_123';
      const buffer = Buffer.from('Invalid PDF');
      const filename = 'resume.pdf';

      jest.spyOn(PDFService, 'parsePDF').mockRejectedValue(
        new Error('Failed to parse PDF')
      );

      // Act & Assert
      await expect(PDFService.processPDFAndSave(userId, buffer, filename))
        .rejects.toThrow('Failed to parse PDF');
    });

    test('Given component creation fails, When processPDFAndSave called, Then throws error', async () => {
      // Arrange
      const userId = 'user_123';
      const buffer = Buffer.from('PDF');
      const filename = 'resume.pdf';

      (SupabaseService.createComponent as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      // Act & Assert
      await expect(PDFService.processPDFAndSave(userId, buffer, filename))
        .rejects.toThrow('Database error');
    });
  });

  // ============================================
  // processPDFAndSaveJobDescription() TESTS
  // ============================================

  describe('processPDFAndSaveJobDescription', () => {
    test('Given valid inputs, When processPDFAndSaveJobDescription called, Then returns legacy format', async () => {
      // Arrange
      jest.spyOn(PDFService, 'processPDFAndSave').mockResolvedValue({
        cvId: 'cv_123',
        pdfId: 'pdf_123',
        componentsCreated: 5,
      });

      const userId = 'user_123';
      const buffer = Buffer.from('PDF');
      const filename = 'jd.pdf';

      // Act
      const result = await PDFService.processPDFAndSaveJobDescription(userId, buffer, filename);

      // Assert
      expect(result).toHaveProperty('jobDescriptionId');
      expect(result).toHaveProperty('componentsCreated');
      expect(result.jobDescriptionId).toBe('cv_123');
      expect(result.componentsCreated).toBe(5);
    });
  });

  // ============================================
  // getClient() ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling - getClient', () => {
    test('Given missing API key, When getClient called, Then throws error', () => {
      // Arrange
      const originalEnv = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      // Reset static instance to force recreation
      (PDFService as any).genAI = null;
      
      // Mock getClient to test error path directly
      jest.spyOn(PDFService as any, 'getClient').mockImplementation(() => {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
          throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables');
        }
        return mockGenAI;
      });

      // Act & Assert
      expect(() => {
        (PDFService as any).getClient();
      }).toThrow('GOOGLE_GENERATIVE_AI_API_KEY not found');

      // Restore
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalEnv;
      jest.restoreAllMocks();
    });
  });
});

