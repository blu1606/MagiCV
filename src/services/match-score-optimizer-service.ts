/**
 * Match Score Optimizer Service
 * Real-time optimization of CV-to-job match scores with caching and incremental updates
 */

import { EmbeddingService } from './embedding-service'
import { SupabaseService } from './supabase-service'
import type { Component } from '@/lib/supabase'

interface MatchScoreResult {
  score: number
  breakdown: {
    experienceMatch: number
    educationMatch: number
    skillsMatch: number
    projectsMatch: number
  }
  suggestions: string[]
  missingSkills: string[]
  topMatchedComponents: Component[]
}

interface CachedMatch {
  jobDescriptionHash: string
  result: MatchScoreResult
  timestamp: number
  expiresAt: number
}

export class MatchScoreOptimizerService {
  private static cache = new Map<string, CachedMatch>()
  private static CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Calculate optimized match score with caching
   */
  static async calculateOptimizedMatchScore(
    userId: string,
    jobDescription: string,
    options?: {
      useCache?: boolean
      topK?: number
    }
  ): Promise<MatchScoreResult> {
    const useCache = options?.useCache !== false
    const topK = options?.topK || 50

    // Check cache
    if (useCache) {
      const cached = this.getFromCache(userId, jobDescription)
      if (cached) {
        console.log('✅ Using cached match score')
        return cached
      }
    }

    console.log('🔍 Calculating fresh match score...')

    // Get job description embedding
    const jdEmbedding = await EmbeddingService.embed(jobDescription)

    // Find relevant components using vector search
    const components = await SupabaseService.similaritySearchComponents(
      userId,
      jdEmbedding,
      topK
    )

    if (components.length === 0) {
      const emptyResult: MatchScoreResult = {
        score: 0,
        breakdown: {
          experienceMatch: 0,
          educationMatch: 0,
          skillsMatch: 0,
          projectsMatch: 0,
        },
        suggestions: ['Add your experiences, skills, and education to get started'],
        missingSkills: [],
        topMatchedComponents: [],
      }
      return emptyResult
    }

    // Group components by type
    const byType = {
      experience: components.filter(c => c.type === 'experience'),
      education: components.filter(c => c.type === 'education'),
      skill: components.filter(c => c.type === 'skill'),
      project: components.filter(c => c.type === 'project'),
    }

    // Calculate weighted scores using similarity
    const experienceScore = this.calculateCategoryScore(
      byType.experience,
      40 // 40% weight
    )
    const educationScore = this.calculateCategoryScore(
      byType.education,
      20 // 20% weight
    )
    const skillScore = this.calculateCategoryScore(
      byType.skill,
      30 // 30% weight
    )
    const projectScore = this.calculateCategoryScore(
      byType.project,
      10 // 10% weight
    )

    const totalScore = Math.min(
      experienceScore + educationScore + skillScore + projectScore,
      100
    )

    // Extract missing skills from job description
    const missingSkills = await this.extractMissingSkills(
      jobDescription,
      byType.skill
    )

    // Generate improvement suggestions
    const suggestions = this.generateSuggestions(
      byType,
      totalScore,
      missingSkills
    )

    // Get top matched components
    const topMatchedComponents = components
      .sort((a, b) => (b as any).similarity - (a as any).similarity)
      .slice(0, 10)

    const result: MatchScoreResult = {
      score: Math.round(totalScore * 10) / 10, // Round to 1 decimal
      breakdown: {
        experienceMatch: Math.round(experienceScore * 10) / 10,
        educationMatch: Math.round(educationScore * 10) / 10,
        skillsMatch: Math.round(skillScore * 10) / 10,
        projectsMatch: Math.round(projectScore * 10) / 10,
      },
      suggestions,
      missingSkills,
      topMatchedComponents,
    }

    // Cache the result
    if (useCache) {
      this.saveToCache(userId, jobDescription, result)
    }

    return result
  }

  /**
   * Calculate score for a category using similarity scores
   */
  private static calculateCategoryScore(
    components: Component[],
    maxWeight: number
  ): number {
    if (components.length === 0) return 0

    // Average the similarity scores and scale to max weight
    const avgSimilarity =
      components.reduce((sum, c) => sum + ((c as any).similarity || 0), 0) /
      components.length

    return avgSimilarity * maxWeight
  }

  /**
   * Extract missing skills from job description
   */
  private static async extractMissingSkills(
    jobDescription: string,
    userSkills: Component[]
  ): Promise<string[]> {
    // Simple keyword extraction (can be enhanced with NLP)
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
      'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'PostgreSQL', 'MongoDB', 'Redis',
      'Git', 'CI/CD', 'Agile', 'Scrum',
      'Machine Learning', 'AI', 'Data Science',
      'GraphQL', 'REST', 'Microservices',
    ]

    const jdLower = jobDescription.toLowerCase()
    const userSkillTitles = userSkills.map(s => s.title.toLowerCase())

    const missing = commonSkills.filter(skill => {
      const skillLower = skill.toLowerCase()
      return (
        jdLower.includes(skillLower) &&
        !userSkillTitles.some(us => us.includes(skillLower))
      )
    })

    return missing.slice(0, 10) // Return top 10 missing skills
  }

  /**
   * Generate improvement suggestions
   */
  private static generateSuggestions(
    byType: Record<string, Component[]>,
    score: number,
    missingSkills: string[]
  ): string[] {
    const suggestions: string[] = []

    if (score < 50) {
      suggestions.push('Your profile needs significant improvements to match this role')
    } else if (score < 70) {
      suggestions.push('Good match! Add more details to improve your score')
    } else if (score < 85) {
      suggestions.push('Great match! A few additions could make it perfect')
    } else {
      suggestions.push('Excellent match! Your profile aligns very well with this role')
    }

    if (byType.experience.length < 2) {
      suggestions.push('Add more work experiences to strengthen your profile')
    }

    if (byType.skill.length < 10) {
      suggestions.push('Add more technical skills that match the job requirements')
    }

    if (byType.project.length === 0) {
      suggestions.push('Add relevant projects to showcase your practical experience')
    }

    if (missingSkills.length > 0) {
      suggestions.push(
        `Consider adding these skills: ${missingSkills.slice(0, 5).join(', ')}`
      )
    }

    return suggestions.slice(0, 5) // Return top 5 suggestions
  }

  /**
   * Get cached result
   */
  private static getFromCache(
    userId: string,
    jobDescription: string
  ): MatchScoreResult | null {
    const key = this.getCacheKey(userId, jobDescription)
    const cached = this.cache.get(key)

    if (!cached) return null

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return cached.result
  }

  /**
   * Save to cache
   */
  private static saveToCache(
    userId: string,
    jobDescription: string,
    result: MatchScoreResult
  ): void {
    const key = this.getCacheKey(userId, jobDescription)
    this.cache.set(key, {
      jobDescriptionHash: this.hashJobDescription(jobDescription),
      result,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_TTL,
    })

    // Cleanup old cache entries
    this.cleanupCache()
  }

  /**
   * Generate cache key
   */
  private static getCacheKey(userId: string, jobDescription: string): string {
    return `${userId}:${this.hashJobDescription(jobDescription)}`
  }

  /**
   * Hash job description for caching
   */
  private static hashJobDescription(jobDescription: string): string {
    // Simple hash function (can use crypto.createHash in production)
    let hash = 0
    for (let i = 0; i < jobDescription.length; i++) {
      const char = jobDescription.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
  }

  /**
   * Cleanup expired cache entries
   */
  private static cleanupCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key)
      }
    }

    // Limit cache size
    if (this.cache.size > 100) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)

      // Remove oldest entries
      const toRemove = sortedEntries.slice(0, 20)
      toRemove.forEach(([key]) => this.cache.delete(key))
    }
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache stats
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, cached]) => ({
        key,
        expiresIn: cached.expiresAt - Date.now(),
        score: cached.result.score,
      })),
    }
  }
}
