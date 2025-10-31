'use client'

import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { MatchResult } from '@/lib/types/jd-matching'
import { getMatchBadgeVariant } from '@/lib/types/jd-matching'

interface MatchRatingProps {
  score: number
  matchQuality: MatchResult['matchQuality']
  showStars?: boolean
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function MatchRating({
  score,
  matchQuality,
  showStars = true,
  showProgress = true,
  size = 'md',
}: MatchRatingProps) {
  // Convert score to 5-star rating
  const starRating = (score / 100) * 5
  const fullStars = Math.floor(starRating)
  const hasHalfStar = starRating % 1 >= 0.5

  // Get badge label
  const getBadgeLabel = () => {
    switch (matchQuality) {
      case 'excellent': return 'Excellent Match'
      case 'good': return 'Good Match'
      case 'fair': return 'Fair Match'
      case 'weak': return 'Weak Match'
      case 'none': return 'No Match'
    }
  }

  // Size classes
  const sizeClasses = {
    sm: {
      text: 'text-2xl',
      star: 'w-3 h-3',
      badge: 'text-xs',
    },
    md: {
      text: 'text-4xl',
      star: 'w-4 h-4',
      badge: 'text-sm',
    },
    lg: {
      text: 'text-6xl',
      star: 'w-5 h-5',
      badge: 'text-base',
    },
  }

  return (
    <div className="space-y-3">
      {/* Score */}
      <div className="flex items-center justify-center gap-2">
        <span className={`${sizeClasses[size].text} font-bold text-white`}>
          {score}%
        </span>
      </div>

      {/* Stars */}
      {showStars && (
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`${sizeClasses[size].star} ${
                i < fullStars
                  ? 'fill-yellow-400 text-yellow-400'
                  : i === fullStars && hasHalfStar
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'text-gray-600'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-400">
            {starRating.toFixed(1)}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-1">
          <Progress value={score} className="h-2" />
        </div>
      )}

      {/* Badge */}
      <div className="flex justify-center">
        <Badge
          className={`${getMatchBadgeVariant(matchQuality)} ${sizeClasses[size].badge} border`}
        >
          {getBadgeLabel()}
        </Badge>
      </div>
    </div>
  )
}

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  // Color based on value
  const getColor = () => {
    if (value >= 80) return '#22d3ee' // cyan
    if (value >= 60) return '#0ea5e9' // blue
    if (value >= 40) return '#eab308' // yellow
    return '#f97316' // orange
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{value}%</span>
        <span className="text-xs text-gray-400">Match</span>
      </div>
    </div>
  )
}
