"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Download, ChevronLeft, Plus, Trash2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDebouncedCallback } from 'use-debounce'
import { useToast } from "@/components/ui/use-toast"
import { GridPattern } from "@/components/ui/grid-pattern"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { NumberTicker } from "@/components/ui/number-ticker"

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
}

export function CVEditorPage({ cvId }: { cvId: string }) {
  const { toast } = useToast()
  
  // MagicCV integration states
  const [jobDescription, setJobDescription] = useState("")
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [matchDetails, setMatchDetails] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Existing states
  const [isExporting, setIsExporting] = useState(false)
  const [skillInput, setSkillInput] = useState("")
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
  })

  const handleExport = async (format: "pdf" | "docx" | "json") => {
    setIsExporting(true)
    // Simulate export generation
    setTimeout(() => {
      setIsExporting(false)
      const fileName = `${cvData.name.replace(/\s+/g, "_")}_CV.${format === "pdf" ? "pdf" : format === "docx" ? "docx" : "json"}`
      alert(`Exported as ${fileName}`)
    }, 1500)
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

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Grid Pattern Background */}
      <GridPattern 
        className="absolute inset-0 opacity-10" 
        width={40} 
        height={40} 
        x={0}
        y={0}
        strokeDasharray="0"
      />
      
      {/* Background Effect during AI generation */}
      {isGenerating && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9]/10 to-[#22d3ee]/10 animate-pulse" />
      )}
      {/* Header */}
      <div className="border-b border-white/20 backdrop-blur-sm sticky top-0 z-50 bg-[#0f172a]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10 border-white/20">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] bg-[#0f172a]/80 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            {/* Job Description Section */}
            <div className="space-y-4 border-b border-white/20 pb-6 relative">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
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
                    <span className={`text-lg font-bold ${
                      matchScore > 75 ? 'text-[#22d3ee]' : 
                      matchScore > 50 ? 'text-[#f97316]' : 
                      'text-red-400'
                    }`}>
                      <NumberTicker value={matchScore} />%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        matchScore > 75 ? 'bg-[#22d3ee]' : 
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
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
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
                <label className="text-sm font-semibold mb-2 block text-white">Professional Summary</label>
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
                <h3 className="text-lg font-semibold text-white">Experience</h3>
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
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                          placeholder="Job description and achievements..."
                          className="min-h-16 resize-none text-sm bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                        />
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
                <h3 className="text-lg font-semibold text-black">Education</h3>
                <Button variant="outline" size="sm" onClick={addEducation} className="gap-1 bg-white border-gray-300 text-black hover:bg-gray-50">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-4">
                {cvData.education.map((edu) => (
                  <Card key={edu.id} className="p-6 space-y-3 bg-white border-gray-300">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                          placeholder="School/University"
                          className="text-sm font-semibold bg-white border-gray-300 text-black"
                        />
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                          placeholder="Degree"
                          className="text-sm bg-white border-gray-300 text-black"
                        />
                        <Input
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                          placeholder="Field of Study"
                          className="text-sm bg-white border-gray-300 text-black"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                      className="aspect-square bg-gradient-to-br from-[#0ea5e9]/20 to-[#22d3ee]/20 rounded-lg flex items-center justify-center text-xs font-medium text-[#0ea5e9] border border-[#0ea5e9]/30"
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
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <Card className="p-8 bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <div className="space-y-6 text-sm">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-bold text-white">{cvData.name || "Your Name"}</h1>
                  <p className="text-xs text-gray-300 mt-1">
                    {cvData.email} • {cvData.phone}
                  </p>
                </div>

                {/* Summary */}
                {cvData.summary && (
                  <div>
                    <h2 className="text-xs font-semibold text-pink-400 mb-2 uppercase tracking-wide">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-gray-300 leading-relaxed">{cvData.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {cvData.experience.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-pink-400 mb-3 uppercase tracking-wide">Experience</h2>
                    <div className="space-y-3">
                      {cvData.experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-semibold text-white">{exp.title || "Job Title"}</p>
                              <p className="text-xs text-gray-300">{exp.company || "Company"}</p>
                            </div>
                            {(exp.startDate || exp.endDate) && (
                              <p className="text-xs text-gray-300">
                                {exp.startDate} {exp.startDate && exp.endDate ? "–" : ""} {exp.endDate}
                              </p>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{exp.description}</p>
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
                          <p className="text-xs font-semibold text-white">{edu.school || "School"}</p>
                          <p className="text-xs text-gray-300">
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
                        <span key={skill} className="text-xs px-2 py-1 rounded-full bg-[#0ea5e9]/20 text-[#0ea5e9]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
