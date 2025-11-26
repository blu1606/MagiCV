"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Download, ChevronLeft, Plus, Trash2, Sparkles, FileJson, Wand2, Save, Check } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDebouncedCallback } from 'use-debounce'
import { useToast } from "@/components/ui/use-toast"
import { GridPattern } from "@/components/ui/grid-pattern"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { NumberTicker } from "@/components/ui/number-ticker"
import type { JDMatchingResults } from "@/lib/types/jd-matching"
import { AIRephrase } from "@/components/ai-rephrase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CVData {
  name: string
  email: string
  phone: string
  summary: string
  experience: Array<{
    id: string
    title: string
    company: string
    description: string
    startDate: string
    endDate: string
  }>
  skills: string[]
  education: Array<{
    id: string
    school: string
    degree: string
    field: string
  }>
  projects: Array<{
    id: string
    title: string
    description: string
    technologies: string
  }>
}

export function CVEditorPage({
  cvId,
  matchingResults
}: {
  cvId: string
  matchingResults?: JDMatchingResults | null
}) {
  const { toast } = useToast()

  // MagicCV integration states
  const [jobDescription, setJobDescription] = useState("")
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [matchDetails, setMatchDetails] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Existing states
  const [isExporting, setIsExporting] = useState(false)
  const [skillInput, setSkillInput] = useState("")

  // Save draft states
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')

  // Rephrase dialog states
  const [rephraseDialog, setRephraseDialog] = useState<{
    open: boolean
    text: string
    field: string
    id?: string
  }>({
    open: false,
    text: '',
    field: '',
  })

  const [cvData, setCvData] = useState<CVData>({
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    summary: "Senior Software Engineer with 8+ years of experience building scalable systems.",
    experience: [
      {
        id: "1",
        title: "Senior Engineer",
        company: "TechCorp",
        description: "Led team of 5 engineers, improved system performance by 40%",
        startDate: "2020",
        endDate: "Present",
      },
    ],
    skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
    education: [
      {
        id: "1",
        school: "University of Technology",
        degree: "Bachelor of Science",
        field: "Computer Science",
      },
    ],
    projects: [],
  })

  // Handle cvId "new" - reset to empty CV
  useEffect(() => {
    if (cvId === "new") {
      setCvData({
        name: "",
        email: "",
        phone: "",
        summary: "",
        experience: [],
        skills: [],
        education: [],
        projects: [],
      })
      setJobDescription("")
      setMatchScore(null)
      setMatchDetails(null)
    }
  }, [cvId])

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data.profile)
          console.log('👤 User Profile:', data.profile)

          // If creating new CV, pre-fill with user profile
          if (cvId === "new" && data.profile) {
            setCvData(prev => ({
              ...prev,
              name: data.profile.full_name || "",
              email: data.profile.email || "",
              phone: data.profile.phone || "",
            }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }
    fetchProfile()
  }, [cvId])

  const handleExport = async (format: "pdf" | "json") => {
    setIsExporting(true)

    try {
      if (format === "json") {
        // Export as JSON
        const dataStr = JSON.stringify(cvData, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${cvData.name.replace(/\s+/g, "_")}_CV.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Exported!",
          description: "CV data exported as JSON",
        })
      } else if (format === "pdf") {
        // Export as PDF by printing the preview panel
        window.print()

        toast({
          title: "Print Dialog Opened",
          description: "Use your browser's print dialog to save as PDF",
        })
      }
    } catch (error: any) {
      console.error('Export error:', error)
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export CV",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      title: "",
      company: "",
      description: "",
      startDate: "",
      endDate: "",
    }
    setCvData({
      ...cvData,
      experience: [...cvData.experience, newExp],
    })
  }

  const removeExperience = (id: string) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.filter((exp) => exp.id !== id),
    })
  }

  const updateExperience = (id: string, field: string, value: string) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  const addSkill = () => {
    if (skillInput.trim() && !cvData.skills.includes(skillInput.trim())) {
      setCvData({
        ...cvData,
        skills: [...cvData.skills, skillInput.trim()],
      })
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setCvData({
      ...cvData,
      skills: cvData.skills.filter((s) => s !== skill),
    })
  }

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      field: "",
    }
    setCvData({
      ...cvData,
      education: [...cvData.education, newEdu],
    })
  }

  const removeEducation = (id: string) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter((edu) => edu.id !== id),
    })
  }

  const updateEducation = (id: string, field: string, value: string) => {
    setCvData({
      ...cvData,
      education: cvData.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    })
  }

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      title: "",
      description: "",
      technologies: "",
    }
    setCvData({
      ...cvData,
      projects: [...cvData.projects, newProject],
    })
  }

  const removeProject = (id: string) => {
    setCvData({
      ...cvData,
      projects: cvData.projects.filter((proj) => proj.id !== id),
    })
  }

  const updateProject = (id: string, field: string, value: string) => {
    setCvData({
      ...cvData,
      projects: cvData.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    })
  }

  // Rephrase helpers
  const openRephraseDialog = (text: string, field: string, id?: string) => {
    setRephraseDialog({
      open: true,
      text,
      field,
      id,
    })
  }

  const applyRephrasedText = (rephrasedText: string) => {
    const { field, id } = rephraseDialog

    if (field === 'summary') {
      setCvData({ ...cvData, summary: rephrasedText })
    } else if (field === 'experience' && id) {
      updateExperience(id, 'description', rephrasedText)
    } else if (field === 'project' && id) {
      updateProject(id, 'description', rephrasedText)
    }

    setRephraseDialog({ open: false, text: '', field: '' })
    toast({
      title: "Applied!",
      description: "AI-rephrased text has been applied",
    })
  }

  // Save draft functionality
  const saveDraft = useCallback(async (showToast = true) => {
    setIsSaving(true)
    setSaveStatus('saving')

    try {
      const response = await fetch('/api/cv/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvId: cvId,
          title: `CV for ${cvData.name}`,
          jobDescription: jobDescription,
          cvData: cvData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      const data = await response.json()
      setLastSaved(new Date())
      setSaveStatus('saved')

      if (showToast) {
        toast({
          title: "Draft Saved",
          description: "Your changes have been saved",
        })
      }

      return data
    } catch (error: any) {
      console.error('Save draft error:', error)
      setSaveStatus('unsaved')

      if (showToast) {
        toast({
          title: "Save Failed",
          description: error.message || "Failed to save draft",
          variant: "destructive"
        })
      }
    } finally {
      setIsSaving(false)
    }
  }, [cvId, cvData, jobDescription, toast])

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (saveStatus === 'unsaved') {
        saveDraft(false) // Silent autosave
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [saveStatus, saveDraft])

  // Mark as unsaved when data changes
  useEffect(() => {
    if (lastSaved !== null) {
      setSaveStatus('unsaved')
    }
  }, [cvData, jobDescription])

  // AI Fill-in: Transform matching results to CVData
  useEffect(() => {
    if (matchingResults) {
      console.log('🎯 AI Fill-in: Transforming matching results to CV data...')

      const filledData = transformMatchingResultsToCVData(matchingResults)
      setCvData(filledData)

      // Set job description and match score
      setJobDescription(matchingResults.jdMetadata.description)
      setMatchScore(matchingResults.overallScore)

      toast({
        title: "AI Pre-filled Successfully!",
        description: `Loaded ${matchingResults.matches.filter(m => m.score >= 40).length} matched components`,
      })
    }
  }, [matchingResults])

  // MagicCV Integration: Real-time match calculation with debounce
  const debouncedCalculateMatch = useDebouncedCallback(async (jd: string) => {
    if (!jd.trim() || jd.length < 50) {
      setMatchScore(null)
      setMatchDetails(null)
      return
    }

    setIsCalculating(true)

    try {
      const response = await fetch('/api/magiccv/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, detailed: true })
      })

      if (!response.ok) throw new Error('Failed to calculate match')

      const data = await response.json()
      setMatchScore(data.score)
      setMatchDetails(data)

      toast({
        title: "Match Score Updated",
        description: `Your profile matches ${data.score}% with this job`,
      })
    } catch (error) {
      console.error('Match calculation error:', error)
      toast({
        title: "Error",
        description: "Failed to calculate match score",
        variant: "destructive"
      })
    } finally {
      setIsCalculating(false)
    }
  }, 1500)

  // MagicCV Integration: Generate PDF
  const handleGeneratePDF = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description: "Please enter a job description first",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      // Check if we have matching results context
      const stored = localStorage.getItem('jd-matching-editor-data')

      if (stored && matchingResults) {
        // We're in the context of JD matching - use the optimized flow
        console.log('🎯 Generating CV from matched components with customizations...')

        const response = await fetch('/api/cv/generate-from-matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matches: matchingResults.matches,
            jdMetadata: matchingResults.jdMetadata,
            customizedData: cvData, // Send user customizations
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Generation failed')
        }

        // Download PDF
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `CV_${matchingResults.jdMetadata.company}_${matchingResults.jdMetadata.title}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Success!",
          description: "Your customized CV has been generated and downloaded",
        })
      } else {
        // Fallback to regular generation
        console.log('📝 Generating CV from job description...')

        const response = await fetch('/api/cv/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobDescription,
            includeProjects: true
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Generation failed')
        }

        // Get match score from header
        const finalMatchScore = response.headers.get('X-Match-Score')
        if (finalMatchScore) setMatchScore(Number(finalMatchScore))

        // Download PDF
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `CV_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Success!",
          description: "Your CV has been generated and downloaded",
        })
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate CV",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper function to transform matching results to CV data
  function transformMatchingResultsToCVData(results: JDMatchingResults): CVData {
    // Filter good matches (score >= 40)
    const goodMatches = results.matches.filter(m => m.score >= 40 && m.cvComponent)

    console.log('📊 Transform Debug:', {
      totalMatches: results.matches.length,
      goodMatches: goodMatches.length,
      matchTypes: goodMatches.map(m => m.cvComponent?.type),
    })

    // Group by type
    const experiences = goodMatches
      .filter(m => m.cvComponent?.type === 'experience')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Top 5 experiences
      .map(m => ({
        id: m.cvComponent!.id,
        title: m.cvComponent!.title || '',
        company: m.cvComponent!.organization || '',
        description: m.cvComponent!.description || m.cvComponent!.highlights.join('. '),
        startDate: m.cvComponent!.start_date || '',
        endDate: m.cvComponent!.end_date || '',
      }))

    const education = goodMatches
      .filter(m => m.cvComponent?.type === 'education')
      .sort((a, b) => b.score - a.score)
      .map(m => ({
        id: m.cvComponent!.id,
        school: m.cvComponent!.organization || m.cvComponent!.title || '',
        degree: m.cvComponent!.title || '',
        field: m.cvComponent!.description || '',
      }))

    const skills = goodMatches
      .filter(m => m.cvComponent?.type === 'skill')
      .sort((a, b) => b.score - a.score)
      .slice(0, 12) // Top 12 skills
      .map(m => m.cvComponent!.title)

    const projects = goodMatches
      .filter(m => m.cvComponent?.type === 'project')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Top 5 projects
      .map(m => ({
        id: m.cvComponent!.id,
        title: m.cvComponent!.title || '',
        description: m.cvComponent!.description || m.cvComponent!.highlights.join('. '),
        technologies: m.cvComponent!.highlights.filter(h => h.toLowerCase().includes('tech') || h.toLowerCase().includes('stack')).join(', ') || 'Various technologies',
      }))

    console.log('✅ Transformed Data:', {
      experiencesCount: experiences.length,
      educationCount: education.length,
      skillsCount: skills.length,
      projectsCount: projects.length,
      experiences: experiences,
      education: education,
      skills: skills,
      projects: projects,
    })

    return {
      name: userProfile?.full_name || "Your Name",
      email: userProfile?.email || "your@email.com",
      phone: userProfile?.phone || "+1 (555) 000-0000",
      summary: `Experienced professional with proven expertise matching the requirements for ${results.jdMetadata.title} at ${results.jdMetadata.company}. Ready to contribute with relevant skills and experience.`,
      experience: experiences.length > 0 ? experiences : [{
        id: Date.now().toString(),
        title: "",
        company: "",
        description: "",
        startDate: "",
        endDate: "",
      }],
      skills: skills.length > 0 ? skills : [],
      education: education.length > 0 ? education : [{
        id: Date.now().toString(),
        school: "",
        degree: "",
        field: "",
      }],
      projects: projects.length > 0 ? projects : [],
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-preview, .print-preview * {
            visibility: visible;
          }
          .print-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Grid Pattern Background */}
      <GridPattern
        className="absolute inset-0 opacity-10 no-print"
        width={40}
        height={40}
        x={0}
        y={0}
        strokeDasharray="0"
      />

      {/* Background Effect during AI generation */}
      {isGenerating && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9]/10 to-[#22d3ee]/10 animate-pulse no-print" />
      )}
      {/* Header */}
      <div className="border-b border-white/20 backdrop-blur-sm sticky top-0 z-50 bg-[#0f172a]/80 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={matchingResults ? "/jd/match" : "/dashboard"}>
              <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10 border-white/20">
                <ChevronLeft className="w-4 h-4" />
                {matchingResults ? "Back to Match Results" : "Back to Dashboard"}
              </Button>
            </Link>
            {matchingResults && (
              <div className="text-xs text-gray-400 hidden sm:block">
                From JD Matching
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-2">
              {saveStatus === 'saved' && lastSaved && (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check className="w-4 h-4" />
                  <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                </div>
              )}
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-sm text-[#0ea5e9]">
                  <div className="w-4 h-4 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              {saveStatus === 'unsaved' && (
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>

            {/* Save Draft Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveDraft(true)}
              disabled={isSaving || saveStatus === 'saved'}
              className="gap-2 border-white/20 text-white hover:bg-white/10"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Draft
                </>
              )}
            </Button>

            {matchScore !== null && (
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-700 flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full border-4 border-transparent"
                      style={{
                        borderTopColor: matchScore > 75 ? "#22d3ee" : matchScore > 50 ? "#f97316" : "#ef4444",
                        transform: `rotate(${(matchScore / 100) * 360 - 90}deg)`,
                        transition: 'transform 0.5s ease-in-out'
                      }}
                    />
                    <span className="text-xs font-bold text-white">
                      <NumberTicker value={matchScore} />
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-300">Match Score</p>
                </div>
              </div>
            )}
            {isCalculating && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                <div className="text-xs text-gray-400">Calculating...</div>
              </div>
            )}

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-white/20 text-white hover:bg-white/10" disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0f172a]/95 backdrop-blur-sm border-white/20">
                <DropdownMenuItem
                  onClick={() => handleExport("pdf")}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("json")}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ShimmerButton
              onClick={handleGeneratePDF}
              disabled={isGenerating || !jobDescription.trim()}
              className="bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate CV
                </>
              )}
            </ShimmerButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* AI Pre-filled Banner */}
        {matchingResults && (
          <div className="mb-6 bg-gradient-to-r from-[#22d3ee]/20 to-[#0ea5e9]/20 border border-[#22d3ee]/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#22d3ee]" />
              <div className="flex-1">
                <h3 className="text-white font-semibold">AI Pre-filled from JD Match</h3>
                <p className="text-sm text-gray-300">
                  Loaded {matchingResults.matches.filter(m => m.score >= 40).length} matched components for{' '}
                  <span className="font-semibold text-[#22d3ee]">{matchingResults.jdMetadata.title}</span> at{' '}
                  <span className="font-semibold text-[#22d3ee]">{matchingResults.jdMetadata.company}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#22d3ee]">{matchingResults.overallScore}%</div>
                <div className="text-xs text-gray-300">Match Score</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] bg-[#0f172a]/80 backdrop-blur-sm p-8 rounded-lg border border-white/20 no-print">
            {/* Job Description Section */}
            <div className="space-y-4 border-b border-white/20 pb-6 relative">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 pt-2">
                <span>Job Description</span>
                {isCalculating && (
                  <div className="w-4 h-4 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                )}
              </h3>
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-300">
                  Paste the job description to get AI-optimized CV match
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => {
                    const value = e.target.value;
                    setJobDescription(value);
                    debouncedCalculateMatch(value);
                  }}
                  placeholder="Paste job description here... AI will automatically calculate match score and optimize your CV for this position."
                  className="w-full min-h-[120px] p-3 border border-white/20 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent text-white bg-[#0f172a]/60 placeholder:text-gray-400"
                />
              </div>

              {matchScore !== null && matchDetails && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-300">Match Score</span>
                    <span className={`text-lg font-bold ${matchScore > 75 ? 'text-[#22d3ee]' :
                        matchScore > 50 ? 'text-[#f97316]' :
                          'text-red-400'
                      }`}>
                      <NumberTicker value={matchScore} />%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${matchScore > 75 ? 'bg-[#22d3ee]' :
                          matchScore > 50 ? 'bg-[#f97316]' :
                            'bg-red-500'
                        }`}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                  {matchDetails.summary && (
                    <p className="text-sm text-gray-300 mt-2">{matchDetails.summary}</p>
                  )}
                </div>
              )}
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white pt-2">Personal Information</h3>
              <div>
                <label className="text-sm font-semibold mb-2 block text-white">Full Name</label>
                <Input
                  value={cvData.name}
                  onChange={(e) => setCvData({ ...cvData, name: e.target.value })}
                  placeholder="Your full name"
                  className="bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block text-white">Email</label>
                  <Input
                    type="email"
                    value={cvData.email}
                    onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block text-white">Phone</label>
                  <Input
                    type="tel"
                    value={cvData.phone}
                    onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-white">Professional Summary</label>
                  {cvData.summary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRephraseDialog(cvData.summary, 'summary')}
                      className="gap-1 text-[#22d3ee] hover:text-[#0ea5e9] hover:bg-[#22d3ee]/10"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span className="text-xs">Rephrase with AI</span>
                    </Button>
                  )}
                </div>
                <Textarea
                  value={cvData.summary}
                  onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                  placeholder="Brief overview of your professional background..."
                  className="min-h-24 resize-none bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Experience Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white pt-2">Experience</h3>
                <ShimmerButton onClick={addExperience} className="gap-1 bg-[#0f172a]/60 border-white/20 text-white hover:bg-white/10 px-3 py-1 text-sm">
                  <Plus className="w-4 h-4" />
                  Add
                </ShimmerButton>
              </div>
              <div className="space-y-4">
                {cvData.experience.map((exp) => (
                  <Card key={exp.id} className="p-6 space-y-3 bg-[#0f172a]/60 border-white/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                          placeholder="Job Title"
                          className="text-sm font-semibold bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                        />
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                          placeholder="Company Name"
                          className="text-sm bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                            placeholder="Start Date"
                            className="text-xs bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                          />
                          <Input
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                            placeholder="End Date"
                            className="text-xs bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-300">Description</label>
                            {exp.description && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRephraseDialog(exp.description, 'experience', exp.id)}
                                className="gap-1 text-[#22d3ee] hover:text-[#0ea5e9] hover:bg-[#22d3ee]/10 h-6 px-2"
                              >
                                <Wand2 className="w-3 h-3" />
                                <span className="text-xs">AI</span>
                              </Button>
                            )}
                          </div>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                            placeholder="Job description and achievements..."
                            className="min-h-16 resize-none text-sm bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(exp.id)}
                        className="text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white pt-2">Education</h3>
                <ShimmerButton onClick={addEducation} className="gap-1 bg-[#0f172a]/60 border-white/20 text-white hover:bg-white/10 px-3 py-1 text-sm">
                  <Plus className="w-4 h-4" />
                  Add
                </ShimmerButton>
              </div>
              <div className="space-y-4">
                {cvData.education.map((edu) => (
                  <Card key={edu.id} className="p-6 space-y-3 bg-[#0f172a]/60 border-white/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                          placeholder="School/University"
                          className="text-sm font-semibold bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                        />
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                          placeholder="Degree"
                          className="text-sm bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                        />
                        <Input
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                          placeholder="Field of Study"
                          className="text-sm bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                        className="text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Skills</h3>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addSkill()
                    }
                  }}
                  placeholder="Add a skill..."
                  className="text-sm bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                />
                <ShimmerButton onClick={addSkill} className="bg-[#0f172a]/60 border-white/20 text-white hover:bg-white/10 px-3 py-1">
                  <Plus className="w-4 h-4" />
                </ShimmerButton>
              </div>

              {/* Skills Grid Visualization */}
              {cvData.skills.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {cvData.skills.slice(0, 6).map((skill, index) => (
                    <div
                      key={skill}
                      className="h-18 px-3 bg-gradient-to-br from-[#0ea5e9]/20 to-[#22d3ee]/20 rounded-lg flex items-center justify-center text-xs font-medium text-[#0ea5e9] border border-[#0ea5e9]/30"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-red-400/20 bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20"
                    onClick={() => removeSkill(skill)}
                  >
                    {skill}
                    <span className="text-xs">×</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Projects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white pt-2">Projects</h3>
                <ShimmerButton onClick={addProject} className="gap-1 bg-[#0f172a]/60 border-white/20 text-white hover:bg-white/10 px-3 py-1 text-sm">
                  <Plus className="w-4 h-4" />
                  Add
                </ShimmerButton>
              </div>
              <div className="space-y-4">
                {cvData.projects.map((proj) => (
                  <Card key={proj.id} className="p-6 space-y-3 bg-[#0f172a]/60 border-white/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={proj.title}
                          onChange={(e) => updateProject(proj.id, "title", e.target.value)}
                          placeholder="Project Title"
                          className="text-sm font-semibold bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                        />
                        <Input
                          value={proj.technologies}
                          onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                          placeholder="Technologies Used (e.g., React, Node.js, MongoDB)"
                          className="text-sm bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-300">Description</label>
                            {proj.description && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRephraseDialog(proj.description, 'project', proj.id)}
                                className="gap-1 text-[#22d3ee] hover:text-[#0ea5e9] hover:bg-[#22d3ee]/10 h-6 px-2"
                              >
                                <Wand2 className="w-3 h-3" />
                                <span className="text-xs">AI</span>
                              </Button>
                            )}
                          </div>
                          <Textarea
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                            placeholder="Project description and key achievements..."
                            className="min-h-16 resize-none text-sm bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(proj.id)}
                        className="text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-20 lg:h-fit lg:max-h-[calc(100vh-120px)] overflow-y-auto print-preview">
            <Card className="p-6 md:p-8 lg:p-10 bg-[#0f172a]/80 backdrop-blur-sm border-white/20 print:bg-white print:border-none print:shadow-none">
              <div className="space-y-4 md:space-y-6 text-sm max-w-full break-words">
                {/* Header */}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white break-words">{cvData.name || "Your Name"}</h1>
                  <p className="text-xs text-gray-300 mt-1 break-all">
                    {cvData.email} • {cvData.phone}
                  </p>
                </div>

                {/* Summary */}
                {cvData.summary && (
                  <div>
                    <h2 className="text-xs font-semibold text-pink-400 mb-2 uppercase tracking-wide">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-gray-300 leading-relaxed break-words">{cvData.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {cvData.experience.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-pink-400 mb-3 uppercase tracking-wide">Experience</h2>
                    <div className="space-y-3">
                      {cvData.experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white break-words">{exp.title || "Job Title"}</p>
                              <p className="text-xs text-gray-300 break-words">{exp.company || "Company"}</p>
                            </div>
                            {(exp.startDate || exp.endDate) && (
                              <p className="text-xs text-gray-300 whitespace-nowrap">
                                {exp.startDate} {exp.startDate && exp.endDate ? "–" : ""} {exp.endDate}
                              </p>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-xs text-gray-300 mt-1 leading-relaxed break-words">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {cvData.education.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-pink-400 mb-3 uppercase tracking-wide">Education</h2>
                    <div className="space-y-2">
                      {cvData.education.map((edu) => (
                        <div key={edu.id}>
                          <p className="text-xs font-semibold text-white break-words">{edu.school || "School"}</p>
                          <p className="text-xs text-gray-300 break-words">
                            {edu.degree || "Degree"} {edu.field && `in ${edu.field}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {cvData.skills.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-[#0ea5e9] mb-2 uppercase tracking-wide">Skills</h2>
                    <div className="flex flex-wrap gap-1">
                      {cvData.skills.map((skill) => (
                        <span key={skill} className="text-xs px-2 py-1 rounded-full bg-[#0ea5e9]/20 text-[#0ea5e9] break-all">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {cvData.projects.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-pink-400 mb-3 uppercase tracking-wide">Projects</h2>
                    <div className="space-y-3">
                      {cvData.projects.map((proj) => (
                        <div key={proj.id}>
                          <p className="text-xs font-semibold text-white break-words">{proj.title || "Project Title"}</p>
                          {proj.technologies && (
                            <p className="text-xs text-[#0ea5e9] break-words">{proj.technologies}</p>
                          )}
                          {proj.description && (
                            <p className="text-xs text-gray-300 mt-1 leading-relaxed break-words">{proj.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* AI Rephrase Dialog */}
      <Dialog open={rephraseDialog.open} onOpenChange={(open) => setRephraseDialog({ ...rephraseDialog, open })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f172a]/95 backdrop-blur-sm border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-[#22d3ee]" />
              AI Rephrase
            </DialogTitle>
          </DialogHeader>
          <AIRephrase
            initialText={rephraseDialog.text}
            onApply={applyRephrasedText}
            showComparison={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
