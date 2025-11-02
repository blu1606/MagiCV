import type { Component } from '@/lib/supabase';
import type { SeniorityLevel } from '@/services/seniority-analysis-service';

/**
 * JD Component types
 */
export type JDComponentType = 'requirement' | 'skill' | 'responsibility' | 'qualification';

/**
 * Extracted component from Job Description
 */
export interface JDComponent {
  id: string;
  type: JDComponentType;
  title: string;
  description: string;
  required: boolean;
  level?: string;
  category?: string;
  embedding?: number[];
}

/**
 * Match result between JD component and CV component
 */
export interface MatchResult {
  jdComponent: JDComponent;
  cvComponent: Component | null;
  score: number; // 0-100
  reasoning: string;
  matchQuality: 'excellent' | 'good' | 'fair' | 'weak' | 'none';
}

/**
 * Overall matching results
 */
export interface JDMatchingResults {
  jdMetadata: {
    title: string;
    company: string;
    location?: string;
    description: string;
    seniorityLevel?: SeniorityLevel;
  };
  jdComponents: JDComponent[];
  matches: MatchResult[];
  overallScore: number;
  categoryScores: {
    experience: number;
    education: number;
    skills: number;
    projects: number;
  };
  suggestions: string[];
  missingComponents: JDComponent[];
  seniorityAnalysis?: {
    userLevel: SeniorityLevel;
    jdLevel: SeniorityLevel;
    isMatch: boolean;
    gap: number;
    advice: string;
    confidence: number;
  };
}

/**
 * Match quality thresholds
 */
export const MATCH_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  weak: 20,
} as const;

/**
 * Get match quality based on score
 */
export function getMatchQuality(score: number): MatchResult['matchQuality'] {
  if (score >= MATCH_THRESHOLDS.excellent) return 'excellent';
  if (score >= MATCH_THRESHOLDS.good) return 'good';
  if (score >= MATCH_THRESHOLDS.fair) return 'fair';
  if (score >= MATCH_THRESHOLDS.weak) return 'weak';
  return 'none';
}

/**
 * Get color for match quality
 */
export function getMatchColor(quality: MatchResult['matchQuality']): string {
  switch (quality) {
    case 'excellent': return 'text-green-500';
    case 'good': return 'text-blue-500';
    case 'fair': return 'text-yellow-500';
    case 'weak': return 'text-orange-500';
    case 'none': return 'text-red-500';
  }
}

/**
 * Get badge variant for match quality
 */
export function getMatchBadgeVariant(quality: MatchResult['matchQuality']): string {
  switch (quality) {
    case 'excellent': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'good': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'fair': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'weak': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'none': return 'bg-red-500/10 text-red-500 border-red-500/20';
  }
}
