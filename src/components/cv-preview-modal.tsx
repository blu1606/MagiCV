'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Eye, Loader2, X } from 'lucide-react'
import type { MatchResult, JDMatchingResults } from '@/lib/types/jd-matching'

interface CVPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  matches: MatchResult[]
  jdMetadata: JDMatchingResults['jdMetadata']
}

export function CVPreviewModal({
  open,
  onOpenChange,
  matches,
  jdMetadata,
}: CVPreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate preview when modal opens
  const handleGeneratePreview = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cv/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matches,
          jdMetadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate preview')
      }

      // Create blob URL for PDF preview
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (err: any) {
      console.error('Preview generation error:', err)
      setError(err.message || 'Failed to generate preview')
    } finally {
      setIsLoading(false)
    }
  }

  // Download CV (call full generation API)
  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cv/generate-from-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matches,
          jdMetadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate CV')
      }

      // Download PDF
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CV_${jdMetadata.company}_${jdMetadata.title}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Download error:', err)
      setError(err.message || 'Failed to download CV')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-generate preview when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !previewUrl && !isLoading) {
      handleGeneratePreview()
    }

    if (!newOpen && previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col bg-[#0f172a] border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-white text-2xl">
                CV Preview
              </DialogTitle>
              <DialogDescription className="text-[#94a3b8] mt-1">
                {jdMetadata.title} at {jdMetadata.company}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownload}
                disabled={isLoading}
                className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download CV
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 rounded-lg border border-white/10 bg-white/5 overflow-hidden">
          {isLoading && !previewUrl && (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin mb-4" />
              <p className="text-white text-lg">Generating preview...</p>
              <p className="text-[#94a3b8] text-sm mt-2">
                This may take 10-30 seconds
              </p>
            </div>
          )}

          {error && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-red-400 text-center max-w-md">
                <X className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Failed to generate preview</p>
                <p className="text-sm text-red-300">{error}</p>
                <Button
                  onClick={handleGeneratePreview}
                  variant="outline"
                  className="mt-4 border-white/20 hover:bg-white/10 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title="CV Preview"
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-sm text-[#94a3b8]">
            <Eye className="w-4 h-4 inline mr-1" />
            Preview generated from {matches.filter(m => m.score >= 40).length} matched components
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
