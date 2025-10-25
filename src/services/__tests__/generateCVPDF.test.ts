/**
 * Unit Tests for CVGeneratorService.generateCVPDF()
 * 
 * Tests full CV PDF generation pipeline
 * 
 * Coverage:
 * - Happy Path: 2 tests (online compiler, local compiler)
 * - Edge Cases: 2 tests (with projects, without projects)
 * - Error Handling: 1 test (LaTeX compilation failure)
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock services
jest.mock('@/services/embedding-service');
jest.mock('@/services/supabase-service');
jest.mock('@/services/latex-service');
jest.mock('@google/generative-ai');

import { CVGeneratorService } from '@/services/cv-generator-service';
import { LaTeXService } from '@/services/latex-service';
import { SupabaseService } from '@/services/supabase-service';

const originalConsole = global.console;

describe('CVGeneratorService.generateCVPDF', () => {
  
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
     * Test: Generate PDF with online compiler
     */
    test('Given valid userId and JD with useOnlineCompiler=true, When generateCVPDF called, Then returns PDF buffer', async () => {
      // Arrange
      const userId = 'user_123';
      const jobDescription = 'Senior Software Engineer with React';

      // Mock profile
      const mockProfile = {
        id: userId,
        full_name: 'John Doe',
        profession: 'Software Engineer',
        bio: 'Experienced developer',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock components
      const mockComponents = [
        {
          id: 'exp_1',
          user_id: userId,
          type: 'experience',
          title: 'Senior Developer',
          organization: 'Tech Corp',
          description: 'Built features',
          highlights: ['Led team'],
          start_date: '2020-01',
          end_date: '2023-12',
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Mock selected components
      const mockSelected = {
        experiences: [{
          id: 'exp_1',
          title: 'Senior Developer',
          organization: 'Tech Corp',
          location: 'SF, CA',
          remote: false,
          start: 'Jan 2020',
          end: 'Dec 2023',
          bullets: ['Led team of 5 engineers'],
        }],
        education: [],
        skills: { technical: ['React', 'Node.js'], languages: [], interests: [] },
        projects: [],
      };

      // Mock services
      jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
      jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: mockComponents,
        total: 1,
      });

      // Mock LaTeX service
      const mockPDFBuffer = Buffer.from('Mock PDF Content');
      jest.spyOn(LaTeXService, 'renderTemplate').mockResolvedValue('\\documentclass{article}...');
      jest.spyOn(LaTeXService, 'generatePDFOnline').mockResolvedValue(mockPDFBuffer);
      jest.spyOn(LaTeXService, 'getDefaultMargins').mockReturnValue({
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
      });

      // Mock LLM
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockSelected),
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

      // Act
      const result = await CVGeneratorService.generateCVPDF(
        userId,
        jobDescription,
        { useOnlineCompiler: true }
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('pdfBuffer');
      expect(result).toHaveProperty('cvData');
      
      expect(Buffer.isBuffer(result.pdfBuffer)).toBe(true);
      expect(result.pdfBuffer.length).toBeGreaterThan(0);
      
      expect(result.cvData).toHaveProperty('profile');
      expect(result.cvData).toHaveProperty('experience');
      expect(result.cvData).toHaveProperty('education');

      // Verify online compiler was used
      expect(LaTeXService.generatePDFOnline).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Generate PDF with local compiler
     */
    test('Given valid userId and JD with useOnlineCompiler=false, When generateCVPDF called, Then uses local compiler', async () => {
      // Arrange
      const userId = 'user_456';
      const jobDescription = 'Backend Developer';

      const mockProfile = {
        id: userId,
        full_name: 'Jane Smith',
        profession: 'Backend Engineer',
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockComponents = [
        {
          id: 'skill_1',
          user_id: userId,
          type: 'skill',
          title: 'Node.js',
          organization: null,
          description: 'Expert',
          highlights: [],
          start_date: null,
          end_date: null,
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockSelected = {
        experiences: [],
        education: [],
        skills: { technical: ['Node.js', 'PostgreSQL'], languages: [], interests: [] },
        projects: [],
      };

      jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
      jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: mockComponents,
        total: 1,
      });

      const mockPDFBuffer = Buffer.from('Local PDF Content');
      jest.spyOn(LaTeXService, 'generatePDF').mockResolvedValue(mockPDFBuffer);
      jest.spyOn(LaTeXService, 'getDefaultMargins').mockReturnValue({
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockSelected),
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

      // Act
      const result = await CVGeneratorService.generateCVPDF(
        userId,
        jobDescription,
        { useOnlineCompiler: false }
      );

      // Assert
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result.pdfBuffer)).toBe(true);

      // Verify local compiler was used
      expect(LaTeXService.generatePDF).toHaveBeenCalledTimes(1);
      // Note: generatePDFOnline not mocked, so just verify generatePDF was called
    });
  });

  // ============================================
  // EDGE CASE TESTS
  // ============================================

  describe('Edge Cases', () => {
    /**
     * Test: Include projects in CV
     */
    test('Given includeProjects=true, When generateCVPDF called, Then projects are added to experience section', async () => {
      // Arrange
      const userId = 'user_789';
      const jobDescription = 'Full Stack Developer';

      const mockProfile = {
        id: userId,
        full_name: 'Alice Developer',
        profession: 'Full Stack Engineer',
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockComponents = [
        {
          id: 'proj_1',
          user_id: userId,
          type: 'project',
          title: 'E-commerce Platform',
          organization: 'Personal',
          description: 'Built online store',
          highlights: ['100k users'],
          start_date: '2022-01',
          end_date: '2023-06',
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockSelected = {
        experiences: [],
        education: [],
        skills: { technical: ['React', 'Express'], languages: [], interests: [] },
        projects: [{
          id: 'proj_1',
          title: 'E-commerce Platform',
          organization: 'Personal',
          location: 'Remote',
          start: 'Jan 2022',
          end: 'Jun 2023',
          bullets: ['Built platform serving 100k users'],
        }],
      };

      jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
      jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: mockComponents,
        total: 1,
      });

      const mockPDFBuffer = Buffer.from('PDF with Projects');
      jest.spyOn(LaTeXService, 'generatePDF').mockResolvedValue(mockPDFBuffer);
      jest.spyOn(LaTeXService, 'getDefaultMargins').mockReturnValue({
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockSelected),
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

      // Act
      const result = await CVGeneratorService.generateCVPDF(
        userId,
        jobDescription,
        { includeProjects: true, useOnlineCompiler: false }
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.cvData.experience.length).toBeGreaterThan(0);
      
      // Projects should be merged into experience
      const hasProjectInExperience = result.cvData.experience.some(
        (exp: any) => exp.id === 'proj_1'
      );
      expect(hasProjectInExperience).toBe(true);
    });

    /**
     * Test: Generate CV without projects
     */
    test('Given includeProjects=false, When generateCVPDF called, Then projects are excluded', async () => {
      // Arrange
      const userId = 'user_101';
      const jobDescription = 'Data Scientist';

      const mockProfile = {
        id: userId,
        full_name: 'Bob Analyst',
        profession: 'Data Scientist',
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockComponents = [
        {
          id: 'exp_1',
          user_id: userId,
          type: 'experience',
          title: 'Data Analyst',
          organization: 'Analytics Co',
          description: 'Analyzed data',
          highlights: ['Insights'],
          start_date: '2021-01',
          end_date: '2023-12',
          embedding: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockSelected = {
        experiences: [{
          id: 'exp_1',
          title: 'Data Analyst',
          organization: 'Analytics Co',
          location: 'NYC',
          remote: false,
          start: 'Jan 2021',
          end: 'Dec 2023',
          bullets: ['Generated business insights'],
        }],
        education: [],
        skills: { technical: ['Python', 'SQL'], languages: [], interests: [] },
        projects: [{
          id: 'proj_1',
          title: 'ML Model',
          organization: 'Personal',
          location: 'Remote',
          start: 'Jan 2023',
          end: 'Present',
          bullets: ['Built prediction model'],
        }],
      };

      jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
      jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: mockComponents,
        total: 1,
      });

      const mockPDFBuffer = Buffer.from('PDF without Projects');
      jest.spyOn(LaTeXService, 'generatePDF').mockResolvedValue(mockPDFBuffer);
      jest.spyOn(LaTeXService, 'getDefaultMargins').mockReturnValue({
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockSelected),
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

      // Act
      const result = await CVGeneratorService.generateCVPDF(
        userId,
        jobDescription,
        { includeProjects: false, useOnlineCompiler: false }
      );

      // Assert
      expect(result).toBeDefined();
      
      // Projects should NOT be in experience
      const hasProjectInExperience = result.cvData.experience.some(
        (exp: any) => exp.id === 'proj_1'
      );
      expect(hasProjectInExperience).toBe(false);
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling', () => {
    /**
     * Test: LaTeX compilation fails
     */
    test('Given LaTeX compilation failure, When generateCVPDF called, Then throws error', async () => {
      // Arrange
      const userId = 'user_error';
      const jobDescription = 'Software Engineer';

      const mockProfile = {
        id: userId,
        full_name: 'Error User',
        profession: 'Engineer',
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockComponents = [
        {
          id: 'exp_1',
          user_id: userId,
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

      const mockSelected = {
        experiences: [{
          id: 'exp_1',
          title: 'Engineer',
          organization: 'Company',
          location: 'City',
          remote: false,
          start: 'Jan 2020',
          end: 'Dec 2023',
          bullets: ['Work'],
        }],
        education: [],
        skills: { technical: [], languages: [], interests: [] },
        projects: [],
      };

      jest.spyOn(SupabaseService, 'getProfileById').mockResolvedValue(mockProfile);
      jest.spyOn(SupabaseService, 'getUserComponents').mockResolvedValue({
        components: mockComponents,
        total: 1,
      });

      // Mock LaTeX service to throw error
      jest.spyOn(LaTeXService, 'generatePDF').mockRejectedValue(
        new Error('pdflatex not found')
      );
      jest.spyOn(LaTeXService, 'getDefaultMargins').mockReturnValue({
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockSelected),
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      jest.spyOn(CVGeneratorService as any, 'getClient').mockReturnValue(mockGenAI);

      // Act & Assert
      await expect(
        CVGeneratorService.generateCVPDF(
          userId,
          jobDescription,
          { useOnlineCompiler: false }
        )
      ).rejects.toThrow('pdflatex not found');

      // Verify error was logged
      expect(global.console.error).toHaveBeenCalled();
    });
  });
});

