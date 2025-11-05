'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  Code,
  Palette,
  BarChart,
  Users,
  Megaphone,
  Camera,
  PenTool,
  Cpu,
  Search
} from 'lucide-react'

const PROFESSION_CATEGORIES = [
  {
    category: 'Engineering',
    icon: Code,
    professions: [
      'Software Engineer',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'DevOps Engineer',
      'Data Engineer',
      'Mobile Developer',
      'Machine Learning Engineer',
    ]
  },
  {
    category: 'Design',
    icon: Palette,
    professions: [
      'UI/UX Designer',
      'Product Designer',
      'Graphic Designer',
      'Visual Designer',
      'Motion Designer',
      'Brand Designer',
    ]
  },
  {
    category: 'Product',
    icon: Briefcase,
    professions: [
      'Product Manager',
      'Product Owner',
      'Project Manager',
      'Scrum Master',
      'Business Analyst',
    ]
  },
  {
    category: 'Data',
    icon: BarChart,
    professions: [
      'Data Scientist',
      'Data Analyst',
      'Business Intelligence Analyst',
      'Analytics Engineer',
    ]
  },
  {
    category: 'Marketing',
    icon: Megaphone,
    professions: [
      'Digital Marketing Manager',
      'Content Strategist',
      'SEO Specialist',
      'Growth Hacker',
      'Social Media Manager',
    ]
  },
  {
    category: 'Creative',
    icon: Camera,
    professions: [
      'Content Creator',
      'Video Editor',
      'Photographer',
      'Copywriter',
      'Illustrator',
    ]
  },
]

export function ProfessionSelectPage() {
  const router = useRouter()
  const [selectedProfession, setSelectedProfession] = useState<string>('')
  const [customProfession, setCustomProfession] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const profession = selectedProfession || customProfession
    if (!profession) return

    setIsSubmitting(true)
    try {
      // Update user profile with profession
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profession }),
      })

      if (response.ok) {
        router.push('/onboarding?step=2') // Next onboarding step
      }
    } catch (error) {
      console.error('Error updating profession:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCategories = PROFESSION_CATEGORIES.map(category => ({
    ...category,
    professions: category.professions.filter(p =>
      p.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.professions.length > 0)

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What's your profession?
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Select your profession to help us tailor CV recommendations and match you with relevant opportunities.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search professions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-[#0f172a]/80 backdrop-blur-sm border-white/10 text-white placeholder:text-slate-500 focus:border-[#0ea5e9] transition-all"
            />
          </div>
        </div>

        {/* Profession Categories */}
        <div className="space-y-8 mb-8">
          {filteredCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.category} className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20">
                    <Icon className="w-5 h-5 text-[#0ea5e9]" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{category.category}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.professions.map((profession) => (
                    <Badge
                      key={profession}
                      onClick={() => {
                        setSelectedProfession(profession)
                        setCustomProfession('')
                      }}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                        selectedProfession === profession
                          ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90'
                          : 'bg-[#0f172a] border-white/20 text-slate-300 hover:bg-white/5 hover:border-[#0ea5e9]/30'
                      }`}
                    >
                      {profession}
                    </Badge>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Custom Profession */}
        <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20">
              <PenTool className="w-5 h-5 text-[#f97316]" />
            </div>
            <h2 className="text-xl font-semibold text-white">Custom Profession</h2>
          </div>
          <Input
            type="text"
            placeholder="Enter your profession (e.g., AI Research Scientist)"
            value={customProfession}
            onChange={(e) => {
              setCustomProfession(e.target.value)
              setSelectedProfession('')
            }}
            className="h-12 bg-[#0f172a]/80 backdrop-blur-sm border-white/10 text-white placeholder:text-slate-500 focus:border-[#f97316] transition-all"
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="px-8 py-6 text-base border-white/20 text-white hover:bg-white/5"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedProfession && !customProfession || isSubmitting}
            className="px-8 py-6 text-base bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-12">
          <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  )
}
