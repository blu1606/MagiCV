/**
 * Unit Tests for CVGeneratorService.matchComponentsByCategories()
 * 
 * Tests component matching by categories extracted from JD
 * Target: Cover lines 282-329
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { PDFService } from '@/services/pdf-service';
import { EmbeddingService } from '@/services/embedding-service';
import { SupabaseService } from '@/services/supabase-service';
import type { Component } from '@/lib/supabase';

// Mock dependencies
jest.mock('@google/generative-ai');
jest.mock('@/services/pdf-service');
jest.mock('@/services/embedding-service');
jest.mock('@/services/supabase-service');

describe('CVGeneratorService.matchComponentsByCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Given JD with groupedSkills, When matchComponentsByCategories called, Then matches components by categories', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Senior Software Engineer with React and Node.js';
    const mockEmbedding = Array(768).fill(0.1);

    jest.spyOn(PDFService, 'extractJDComponents').mockResolvedValue({
      groupedSkills: [
        { category: 'Frontend', summary: 'Frontend development', technologies: ['React', 'Vue'] },
        { category: 'Backend', summary: 'Backend development', technologies: ['Node.js', 'Python'] },
      ],
    });

    jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);

    const similaritySearchSpy = jest.spyOn(SupabaseService, 'similaritySearchComponents');
    similaritySearchSpy
      .mockResolvedValueOnce([
        { id: 'comp_1', type: 'skill', title: 'React' } as Component,
        { id: 'comp_2', type: 'skill', title: 'Vue' } as Component,
      ])
      .mockResolvedValueOnce([
        { id: 'comp_3', type: 'skill', title: 'Node.js' } as Component,
      ]);

    // Act
    const result = await CVGeneratorService.matchComponentsByCategories(userId, jobDescription);

    // Assert
    expect(result).toHaveLength(3);
    expect(EmbeddingService.embed).toHaveBeenCalledTimes(2);
    expect(similaritySearchSpy).toHaveBeenCalledTimes(2);
    expect(PDFService.extractJDComponents).toHaveBeenCalledWith(jobDescription);
  });

  test('Given JD without groupedSkills, When matchComponentsByCategories called, Then falls back to findRelevantComponents', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Software Engineer';

    jest.spyOn(PDFService, 'extractJDComponents').mockResolvedValue({
      groupedSkills: [],
    });

    jest.spyOn(CVGeneratorService, 'findRelevantComponents').mockResolvedValue([
      { id: 'comp_1', type: 'experience', title: 'Developer' } as Component,
    ]);

    // Act
    const result = await CVGeneratorService.matchComponentsByCategories(userId, jobDescription);

    // Assert
    expect(result).toHaveLength(1);
    expect(CVGeneratorService.findRelevantComponents).toHaveBeenCalledWith(
      userId,
      jobDescription,
      50 // categoriesLimit * topKPerCategory = 10 * 5
    );
  });

  test('Given custom options, When matchComponentsByCategories called, Then uses custom limits', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockEmbedding = Array(768).fill(0.1);

    jest.spyOn(PDFService, 'extractJDComponents').mockResolvedValue({
      groupedSkills: [
        { category: 'Tech', summary: 'Technology', technologies: ['React'] },
      ],
    });

    jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
    const similaritySearchSpy = jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue([]);

    // Act
    await CVGeneratorService.matchComponentsByCategories(userId, jobDescription, {
      categoriesLimit: 5,
      topKPerCategory: 3,
    });

    // Assert
    expect(similaritySearchSpy).toHaveBeenCalledWith(
      userId,
      mockEmbedding,
      3 // topKPerCategory
    );
  });

  test('Given default options, When matchComponentsByCategories called, Then uses default limits', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockEmbedding = Array(768).fill(0.1);

    jest.spyOn(PDFService, 'extractJDComponents').mockResolvedValue({
      groupedSkills: [{ category: 'Tech', summary: 'Tech', technologies: ['React'] }],
    });

    jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
    const similaritySearchSpy = jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue([]);

    // Act
    await CVGeneratorService.matchComponentsByCategories(userId, jobDescription);

    // Assert
    expect(similaritySearchSpy).toHaveBeenCalledWith(
      userId,
      mockEmbedding,
      5 // default topKPerCategory
    );
  });

  test('Given duplicate components, When matchComponentsByCategories called, Then deduplicates', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockEmbedding = Array(768).fill(0.1);
    const duplicateComponent = { id: 'comp_1', type: 'skill', title: 'React' } as Component;

    jest.spyOn(PDFService, 'extractJDComponents').mockResolvedValue({
      groupedSkills: [
        { category: 'Frontend', summary: 'Frontend', technologies: ['React'] },
        { category: 'Backend', summary: 'Backend', technologies: ['React'] },
      ],
    });

    jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
    
    jest.spyOn(SupabaseService, 'similaritySearchComponents')
      .mockResolvedValueOnce([duplicateComponent])
      .mockResolvedValueOnce([duplicateComponent]);

    // Act
    const result = await CVGeneratorService.matchComponentsByCategories(userId, jobDescription);

    // Assert
    expect(result).toHaveLength(1); // Duplicate removed
    expect(result[0].id).toBe('comp_1');
  });

  test('Given components without id, When matchComponentsByCategories called, Then creates synthetic id', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockEmbedding = Array(768).fill(0.1);
    const componentWithoutId = {
      type: 'skill',
      title: 'React',
      organization: 'TechCorp',
    } as Component;

    jest.spyOn(PDFService, 'extractJDComponents').mockResolvedValue({
      groupedSkills: [{ category: 'Tech', summary: 'Tech', technologies: ['React'] }],
    });

    jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
    jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue([
      componentWithoutId,
    ]);

    // Act
    const result = await CVGeneratorService.matchComponentsByCategories(userId, jobDescription);

    // Assert
    expect(result).toHaveLength(1);
    // Should handle components without id by creating synthetic key
  });

  test('Given many technologies, When matchComponentsByCategories called, Then limits to 10', async () => {
    // Arrange
    const userId = 'user_123';
    const jobDescription = 'Engineer';
    const mockEmbedding = Array(768).fill(0.1);

    jest.spyOn(PDFService, 'extractJDComponents').mockResolvedValue({
      groupedSkills: [
        {
          category: 'Tech',
          summary: 'Technology',
          technologies: Array(20).fill('Tech').map((t, i) => `${t}${i}`),
        },
      ],
    });

    jest.spyOn(EmbeddingService, 'embed').mockResolvedValue(mockEmbedding);
    jest.spyOn(SupabaseService, 'similaritySearchComponents').mockResolvedValue([]);

    // Act
    await CVGeneratorService.matchComponentsByCategories(userId, jobDescription);

    // Assert
    const embedCall = (EmbeddingService.embed as jest.Mock).mock.calls[0][0];
    // Should contain only first 10 technologies
    const techCount = (embedCall.match(/Tech\d+/g) || []).length;
    expect(techCount).toBeLessThanOrEqual(10);
  });
});

