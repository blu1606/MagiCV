'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { ShimmerButton } from '@/components/ui/shimmer-button'

interface EmbeddingStats {
  total: number
  withEmbedding: number
  withoutEmbedding: number
  percentage: number
}

export function GenerateEmbeddingsButton() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<EmbeddingStats | null>(null)
  const [result, setResult] = useState<{
    total: number
    successful: number
    failed: number
  } | null>(null)

  // Fetch stats when dialog opens
  useEffect(() => {
    if (isOpen && !isLoading && !result) {
      fetchStats()
    }
  }, [isOpen])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/components/generate-embeddings')
      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      setStats(data.stats)
    } catch (error: any) {
      console.error('Error fetching stats:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load embedding statistics',
      })
    }
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/components/generate-embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 100,
          batchSize: 5,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate embeddings')
      }

      const data = await response.json()
      setResult(data.results)

      // Show success toast
      toast({
        title: 'Success!',
        description: `Generated embeddings for ${data.results.successful} components`,
      })

      // Refresh stats
      await fetchStats()

      // Reload page after short delay to show updated components
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      console.error('Error generating embeddings:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false)
      setResult(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/20 text-white hover:bg-white/10"
        >
          <Sparkles className="w-4 h-4" />
          Generate Embeddings
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg md:max-w-xl bg-[#0f172a]/95 backdrop-blur-sm border-white/20 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 break-words pr-8">
            <Sparkles className="w-5 h-5 text-[#0ea5e9] shrink-0" />
            <span className="break-words">Generate Embeddings</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300 break-words">
            Generate AI embeddings for components that don't have them yet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          {stats && !result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="p-2 sm:p-3 bg-[#0ea5e9]/10 rounded-lg border border-[#0ea5e9]/20">
                  <div className="text-xl sm:text-2xl font-bold text-[#0ea5e9] break-words">{stats.total}</div>
                  <div className="text-xs text-gray-400 mt-1 break-words">Total</div>
                </div>
                <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-green-500 break-words">{stats.withEmbedding}</div>
                  <div className="text-xs text-gray-400 mt-1 break-words">With Embedding</div>
                </div>
                <div className="p-2 sm:p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-500 break-words">{stats.withoutEmbedding}</div>
                  <div className="text-xs text-gray-400 mt-1 break-words">Missing</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Coverage</span>
                  <span className="text-white font-medium">{stats.percentage}%</span>
                </div>
                <Progress value={stats.percentage} className="h-2" />
              </div>

              {stats.withoutEmbedding === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <p className="text-sm text-green-500 break-words">
                    All components already have embeddings!
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                  <p className="text-sm text-yellow-500 break-words">
                    {stats.withoutEmbedding} components need embeddings
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4 py-6">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin" />
                <div className="text-center">
                  <p className="text-white font-medium">Generating embeddings...</p>
                  <p className="text-sm text-gray-400 mt-1">
                    This may take a few minutes
                  </p>
                </div>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          {/* Result */}
          {result && !isLoading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-500 font-medium">
                  Embeddings generated successfully!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#0ea5e9]/10 rounded-lg border border-[#0ea5e9]/20">
                  <div className="text-2xl font-bold text-[#0ea5e9]">{result.total}</div>
                  <div className="text-xs text-gray-400 mt-1">Processed</div>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-500">{result.successful}</div>
                  <div className="text-xs text-gray-400 mt-1">Success</div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="text-2xl font-bold text-red-500">{result.failed}</div>
                  <div className="text-xs text-gray-400 mt-1">Failed</div>
                </div>
              </div>

              <p className="text-sm text-gray-400 text-center">
                Page will refresh automatically...
              </p>
            </div>
          )}

          {/* Actions */}
          {!isLoading && !result && stats && stats.withoutEmbedding > 0 && (
            <div className="flex gap-2">
              <ShimmerButton
                onClick={handleGenerate}
                className="flex-1 bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate for {stats.withoutEmbedding} Components
              </ShimmerButton>
            </div>
          )}

          {!isLoading && !result && (
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
