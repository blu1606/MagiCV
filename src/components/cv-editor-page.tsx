"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Download, ChevronLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDebouncedCallback } from 'use-debounce'
import { useToast } from "@/components/ui/use-toast"

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
      const response = await fetch('/api/magiccv/generate', {
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/20 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            {matchScore !== null && (
              <div className="text-right">
                <div className={`text-sm font-semibold ${
                  matchScore > 75 ? 'text-green-400' : 
                  matchScore > 50 ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {matchScore}%
                </div>
                <p className="text-xs text-gray-300">Match Score</p>
              </div>
            )}
            {isCalculating && (
              <div className="text-xs text-gray-400 animate-pulse">
                Calculating...
              </div>
            )}
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGenerating || !jobDescription.trim()}
              size="sm" 
              className="gap-2 glitch-button text-black font-bold"
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate CV
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] bg-white p-6 rounded-lg">
            {/* Job Description Section */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <span>Job Description</span>
                {isCalculating && (
                  <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                )}
              </h3>
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">
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
                  className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black bg-white"
                />
              </div>
              
              {matchScore !== null && matchDetails && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Match Score</span>
                    <span className={`text-lg font-bold ${
                      matchScore > 75 ? 'text-green-600' : 
                      matchScore > 50 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {matchScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        matchScore > 75 ? 'bg-green-500' : 
                        matchScore > 50 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                  {matchDetails.summary && (
                    <p className="text-sm text-gray-600 mt-2">{matchDetails.summary}</p>
                  )}
                </div>
              )}
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Personal Information</h3>
              <div>
                <label className="text-sm font-semibold mb-2 block text-black">Full Name</label>
                <Input
                  value={cvData.name}
                  onChange={(e) => setCvData({ ...cvData, name: e.target.value })}
                  placeholder="Your full name"
                  className="bg-white border-gray-300 text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block text-black">Email</label>
                  <Input
                    type="email"
                    value={cvData.email}
                    onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="bg-white border-gray-300 text-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block text-black">Phone</label>
                  <Input
                    type="tel"
                    value={cvData.phone}
                    onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="bg-white border-gray-300 text-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-black">Professional Summary</label>
                <Textarea
                  value={cvData.summary}
                  onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                  placeholder="Brief overview of your professional background..."
                  className="min-h-24 resize-none bg-white border-gray-300 text-black"
                />
              </div>
            </div>

            {/* Experience Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black">Experience</h3>
                <Button variant="outline" size="sm" onClick={addExperience} className="gap-1 bg-white border-gray-300 text-black hover:bg-gray-50">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-4">
                {cvData.experience.map((exp) => (
                  <Card key={exp.id} className="p-4 space-y-3 bg-white border-gray-300">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                          placeholder="Job Title"
                          className="text-sm font-semibold bg-white border-gray-300 text-black"
                        />
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                          placeholder="Company Name"
                          className="text-sm bg-white border-gray-300 text-black"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                            placeholder="Start Date"
                            className="text-xs bg-white border-gray-300 text-black"
                          />
                          <Input
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                            placeholder="End Date"
                            className="text-xs bg-white border-gray-300 text-black"
                          />
                        </div>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                          placeholder="Job description and achievements..."
                          className="min-h-16 resize-none text-sm bg-white border-gray-300 text-black"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(exp.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                  <Card key={edu.id} className="p-4 space-y-3 bg-white border-gray-300">
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
              <h3 className="text-lg font-semibold text-black">Skills</h3>
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
                  className="text-sm bg-white border-gray-300 text-black"
                />
                <Button onClick={addSkill} variant="outline" size="sm" className="bg-white border-gray-300 text-black hover:bg-gray-50">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-red-100 bg-gray-100 text-black border-gray-300"
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
            <Card className="p-8 bg-black/60 backdrop-blur-sm border-white/20">
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
                    <h2 className="text-xs font-semibold text-pink-400 mb-2 uppercase tracking-wide">Skills</h2>
                    <div className="flex flex-wrap gap-1">
                      {cvData.skills.map((skill) => (
                        <span key={skill} className="text-xs px-2 py-1 rounded-full bg-pink-400/20 text-pink-400">
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
