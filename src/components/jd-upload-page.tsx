'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, FileText, Sparkles, CheckCircle2, AlertCircle, Loader2, Briefcase, Building2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { GridPattern } from '@/components/ui/grid-pattern'
import { ShimmerButton } from '@/components/ui/shimmer-button'

export function JDUploadPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<{
    cvId: string
    title: string
    company: string
    componentsCreated: number
  } | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile)
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid file',
        description: 'Please upload a PDF file',
      })
    }
  }, [toast])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid file',
          description: 'Please upload a PDF file',
        })
      }
    }
  }, [toast])

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/jd/extract', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()

      setResult({
        cvId: data.cvId,
        title: data.title,
        company: data.company,
        componentsCreated: data.componentsCreated,
      })

      toast({
        title: 'Success!',
        description: `Extracted ${data.componentsCreated} components from the job description`,
      })

    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message,
      })
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerateCV = () => {
    if (result) {
      router.push(`/editor/${result.cvId}`)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setUploadProgress(0)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      <GridPattern className="absolute inset-0 opacity-10" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="max-w-3xl mx-auto mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10 border-white/20">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[#0ea5e9] mr-2" />
            <h1 className="text-4xl font-bold text-white">Upload Job Description</h1>
          </div>
          <p className="text-[#94a3b8] text-lg">
            Upload a job description PDF and let AI extract requirements and generate your perfect CV
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {!result ? (
            <>
              {/* Upload Card */}
              <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 hover:border-[#0ea5e9]/30 transition-all">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-[#0ea5e9]" />
                    Select Job Description
                  </CardTitle>
                  <CardDescription className="text-[#94a3b8]">
                    PDF files only (Max 10MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-lg p-12 text-center transition-all
                      ${isDragging
                        ? 'border-[#0ea5e9] bg-[#0ea5e9]/10'
                        : 'border-white/20 hover:border-[#0ea5e9]/50'
                      }
                      ${file ? 'bg-[#22d3ee]/5' : ''}
                    `}
                  >
                    {file ? (
                      <div className="space-y-4">
                        <CheckCircle2 className="w-12 h-12 text-[#22d3ee] mx-auto" />
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-[#94a3b8] text-sm">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => setFile(null)}
                          className="text-[#94a3b8] hover:text-white"
                        >
                          Remove file
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FileText className="w-12 h-12 text-[#94a3b8] mx-auto" />
                        <div>
                          <p className="text-white font-medium mb-2">
                            Drag & drop your PDF here
                          </p>
                          <p className="text-[#94a3b8] text-sm mb-4">or</p>
                          <label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              className="border-white/20 hover:bg-white/10 text-white cursor-pointer"
                              asChild
                            >
                              <span>Browse files</span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#94a3b8]">Processing with AI...</span>
                        <span className="text-[#0ea5e9] font-medium">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <div className="flex items-center text-sm text-[#94a3b8] mt-2">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {uploadProgress < 30 && 'Parsing PDF...'}
                        {uploadProgress >= 30 && uploadProgress < 60 && 'Extracting with LLM...'}
                        {uploadProgress >= 60 && uploadProgress < 90 && 'Generating embeddings...'}
                        {uploadProgress >= 90 && 'Saving to database...'}
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  {file && !isUploading && (
                    <div className="mt-6 flex justify-center">
                      <ShimmerButton
                        onClick={handleUpload}
                        className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Extract with AI
                      </ShimmerButton>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-[#0f172a]/60 backdrop-blur-sm border-white/10">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <FileText className="w-8 h-8 text-[#0ea5e9] mx-auto mb-2" />
                      <p className="text-sm text-[#94a3b8]">PDF Parsing</p>
                      <p className="text-xs text-[#94a3b8]/60">Powered by pdf-parse</p>
                    </div>
                    <div>
                      <Sparkles className="w-8 h-8 text-[#f97316] mx-auto mb-2" />
                      <p className="text-sm text-[#94a3b8]">AI Extraction</p>
                      <p className="text-xs text-[#94a3b8]/60">Gemini 2.0 Flash</p>
                    </div>
                    <div>
                      <CheckCircle2 className="w-8 h-8 text-[#22d3ee] mx-auto mb-2" />
                      <p className="text-sm text-[#94a3b8]">Smart Matching</p>
                      <p className="text-xs text-[#94a3b8]/60">768-dim embeddings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Success Card */}
              <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-[#22d3ee]/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle2 className="w-6 h-6 mr-2 text-[#22d3ee]" />
                    Job Description Processed!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Job Info */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Briefcase className="w-5 h-5 text-[#0ea5e9] mt-1" />
                      <div>
                        <p className="text-xs text-[#94a3b8] mb-1">Position</p>
                        <p className="text-white font-medium">{result.title}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Building2 className="w-5 h-5 text-[#f97316] mt-1" />
                      <div>
                        <p className="text-xs text-[#94a3b8] mb-1">Company</p>
                        <p className="text-white font-medium">{result.company}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-[#22d3ee]/5 rounded-lg border border-[#22d3ee]/20">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[#22d3ee]">{result.componentsCreated}</p>
                      <p className="text-sm text-[#94a3b8] mt-1">Components Extracted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[#0ea5e9]">Ready</p>
                      <p className="text-sm text-[#94a3b8] mt-1">Status</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <ShimmerButton
                      onClick={handleGenerateCV}
                      className="flex-1 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate CV Now
                    </ShimmerButton>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="border-white/20 hover:bg-white/10 text-white"
                    >
                      Upload Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
