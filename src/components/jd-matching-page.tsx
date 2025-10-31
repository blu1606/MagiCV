'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Download,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { GridPattern } from '@/components/ui/grid-pattern'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { JDMatchingVisualization } from '@/components/jd-matching-visualization'
import type { JDMatchingResults } from '@/lib/types/jd-matching'

type ProcessingStage = 'parsing' | 'extracting' | 'embedding' | 'matching' | 'complete'

export function JDMatchingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('parsing')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<JDMatchingResults | null>(null)
  const [isGeneratingCV, setIsGeneratingCV] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && droppedFile.type === 'application/pdf') {
        if (droppedFile.size > 10 * 1024 * 1024) {
          toast({
            variant: 'destructive',
            title: 'File too large',
            description: 'Please upload a PDF file smaller than 10MB',
          })
          return
        }
        setFile(droppedFile)
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid file',
          description: 'Please upload a PDF file',
        })
      }
    },
    [toast]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        if (selectedFile.type === 'application/pdf') {
          if (selectedFile.size > 10 * 1024 * 1024) {
            toast({
              variant: 'destructive',
              title: 'File too large',
              description: 'Please upload a PDF file smaller than 10MB',
            })
            return
          }
          setFile(selectedFile)
        } else {
          toast({
            variant: 'destructive',
            title: 'Invalid file',
            description: 'Please upload a PDF file',
          })
        }
      }
    },
    [toast]
  )

  const simulateProgress = (stage: ProcessingStage) => {
    const stages: ProcessingStage[] = ['parsing', 'extracting', 'embedding', 'matching', 'complete']
    const stageIndex = stages.indexOf(stage)
    const baseProgress = (stageIndex / stages.length) * 100

    setProcessingStage(stage)
    setProgress(baseProgress)

    // Animate progress within stage
    const interval = setInterval(() => {
      setProgress(prev => {
        const nextStageProgress = ((stageIndex + 1) / stages.length) * 100
        if (prev >= nextStageProgress - 5) {
          clearInterval(interval)
          return nextStageProgress - 5
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }

  const handleProcess = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Stage 1: Parsing
      const clearParsing = simulateProgress('parsing')

      // Stage 2: Extracting
      setTimeout(() => {
        clearParsing()
        simulateProgress('extracting')
      }, 500)

      // Stage 3: Embedding
      setTimeout(() => {
        simulateProgress('embedding')
      }, 1500)

      // Stage 4: Matching
      setTimeout(() => {
        simulateProgress('matching')
      }, 3000)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/jd/match', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Processing failed')
      }

      const data = await response.json()

      // Complete
      setProcessingStage('complete')
      setProgress(100)
      setResults(data.results)

      toast({
        title: 'Success!',
        description: `Matched ${data.results.jdComponents.length} components with your CV`,
      })
    } catch (error: any) {
      console.error('Processing error:', error)
      toast({
        variant: 'destructive',
        title: 'Processing failed',
        description: error.message,
      })
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateCV = async () => {
    if (!results) return

    setIsGeneratingCV(true)

    try {
      // Create CV from matched components
      const response = await fetch('/api/cv/generate-from-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matches: results.matches,
          jdMetadata: results.jdMetadata,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'CV generation failed')
      }

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CV_${results.jdMetadata.company}_${results.jdMetadata.title}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'CV Generated!',
        description: 'Your tailored CV has been downloaded',
      })
    } catch (error: any) {
      console.error('CV generation error:', error)
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description: error.message,
      })
    } finally {
      setIsGeneratingCV(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResults(null)
    setProgress(0)
    setProcessingStage('parsing')
  }

  const getStageLabel = () => {
    switch (processingStage) {
      case 'parsing':
        return 'Parsing PDF...'
      case 'extracting':
        return 'Extracting components with AI...'
      case 'embedding':
        return 'Generating embeddings...'
      case 'matching':
        return 'Matching with your CV...'
      case 'complete':
        return 'Complete!'
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      <GridPattern className="absolute inset-0 opacity-10" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto mb-6">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-white hover:bg-white/10 border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[#0ea5e9] mr-2" />
            <h1 className="text-4xl font-bold text-white">AI-Powered JD Matching</h1>
          </div>
          <p className="text-[#94a3b8] text-lg">
            Upload a job description and see how well your CV matches each requirement
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {!results ? (
            <>
              {/* Upload Card */}
              <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 hover:border-[#0ea5e9]/30 transition-all">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-[#0ea5e9]" />
                    Upload Job Description
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
                      ${
                        isDragging
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

                  {/* Processing Progress */}
                  {isProcessing && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#94a3b8]">{getStageLabel()}</span>
                        <span className="text-[#0ea5e9] font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center justify-center text-sm text-[#94a3b8]">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing with AI...
                      </div>
                    </div>
                  )}

                  {/* Process Button */}
                  {file && !isProcessing && (
                    <div className="mt-6 flex justify-center">
                      <ShimmerButton
                        onClick={handleProcess}
                        className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Match with My CV
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
                      <p className="text-sm text-[#94a3b8]">Component Extraction</p>
                      <p className="text-xs text-[#94a3b8]/60">AI-powered analysis</p>
                    </div>
                    <div>
                      <Sparkles className="w-8 h-8 text-[#f97316] mx-auto mb-2" />
                      <p className="text-sm text-[#94a3b8]">Smart Matching</p>
                      <p className="text-xs text-[#94a3b8]/60">Vector embeddings</p>
                    </div>
                    <div>
                      <CheckCircle2 className="w-8 h-8 text-[#22d3ee] mx-auto mb-2" />
                      <p className="text-sm text-[#94a3b8]">Instant Results</p>
                      <p className="text-xs text-[#94a3b8]/60">Real-time visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Results */}
              <JDMatchingVisualization results={results} />

              {/* Action Buttons */}
              <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 sticky bottom-6">
                <CardContent className="py-4">
                  <div className="flex gap-3 justify-center">
                    <ShimmerButton
                      onClick={handleGenerateCV}
                      disabled={isGeneratingCV}
                      className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                    >
                      {isGeneratingCV ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating CV...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Generate & Download CV
                        </>
                      )}
                    </ShimmerButton>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="border-white/20 hover:bg-white/10 text-white"
                    >
                      Match Another JD
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
