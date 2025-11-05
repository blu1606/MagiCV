'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, GraduationCap, Code, FolderGit2, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { NumberTicker } from '@/components/ui/number-ticker'

interface ComponentStats {
  experience: number
  education: number
  skill: number
  project: number
  total: number
}

export function ComponentLibraryStats() {
  const [stats, setStats] = useState<ComponentStats>({
    experience: 0,
    education: 0,
    skill: 0,
    project: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/components/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch component stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-[#22d3ee]/10 to-[#0ea5e9]/10 border-[#22d3ee]/20 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    )
  }

  if (stats.total === 0) {
    return (
      <Card className="bg-gradient-to-br from-[#22d3ee]/10 to-[#0ea5e9]/10 border-[#22d3ee]/20 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/20">
            <Sparkles className="w-6 h-6 text-[#22d3ee]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Build Your Component Library
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Connect your GitHub, LinkedIn, or YouTube to import your professional components automatically
            </p>
            <Link href="/data-sources">
              <Button className="gap-2 bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] hover:from-[#22d3ee]/90 hover:to-[#0ea5e9]/90 text-white">
                <Sparkles className="w-4 h-4" />
                Connect Data Sources
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  const componentTypes = [
    {
      type: 'experience',
      label: 'Experiences',
      count: stats.experience,
      icon: Briefcase,
      color: '#0ea5e9',
      bgColor: 'from-[#0ea5e9]/20 to-[#0ea5e9]/10',
    },
    {
      type: 'skill',
      label: 'Skills',
      count: stats.skill,
      icon: Code,
      color: '#10b981',
      bgColor: 'from-[#10b981]/20 to-[#10b981]/10',
    },
    {
      type: 'project',
      label: 'Projects',
      count: stats.project,
      icon: FolderGit2,
      color: '#f97316',
      bgColor: 'from-[#f97316]/20 to-[#f97316]/10',
    },
    {
      type: 'education',
      label: 'Education',
      count: stats.education,
      icon: GraduationCap,
      color: '#8b5cf6',
      bgColor: 'from-[#8b5cf6]/20 to-[#8b5cf6]/10',
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-[#22d3ee]/10 to-[#0ea5e9]/10 border-[#22d3ee]/20 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Your Component Library
          </h3>
          <p className="text-sm text-slate-400">
            Reusable CV components ready for any job application
          </p>
        </div>
        <Link href="/components/library">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-[#22d3ee] hover:text-[#0ea5e9] hover:bg-[#22d3ee]/10"
          >
            <span className="text-xs">View All</span>
            <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Total Count */}
      <div className="mb-6 p-4 rounded-lg bg-[#0f172a]/60 border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Total Components</span>
          <div className="text-3xl font-bold text-[#22d3ee]">
            <NumberTicker value={stats.total} />
          </div>
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {componentTypes.map((type) => (
          <div
            key={type.type}
            className={`p-4 rounded-lg bg-gradient-to-br ${type.bgColor} border border-white/10`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${type.color}20` }}
              >
                <type.icon className="w-4 h-4" style={{ color: type.color }} />
              </div>
              <span className="text-xs font-medium text-slate-300">
                {type.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              <NumberTicker value={type.count} />
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Add more from your profiles
          </span>
          <Link href="/data-sources">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-[#22d3ee] hover:text-[#0ea5e9] hover:bg-[#22d3ee]/10 h-8 px-2"
            >
              <span className="text-xs">Sync</span>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
