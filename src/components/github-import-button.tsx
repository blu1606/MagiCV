'use client'

import { useState } from 'react'
import { Github, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { ShimmerButton } from '@/components/ui/shimmer-button'

export function GitHubImportButton() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [githubUsername, setGithubUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [result, setResult] = useState<{
    componentsCreated: number
    profile?: any
    errors: Array<{ type: string; error: string }>
  } | null>(null)

  const handleImport = async () => {
    if (!githubUsername.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a GitHub username',
      })
      return
    }

    setIsLoading(true)
    setProgress(0)
    setProgressMessage('Starting import...')
    setResult(null)

    try {
      // Simulate progress updates (since we don't have real-time progress from API)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 5
        })
      }, 500)

      const response = await fetch('/api/github/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: githubUsername.trim(),
          includeReadme: true,
          maxRepos: 50,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to import from GitHub')
      }

      const data = await response.json()
      setResult(data.data)
      setProgressMessage('Import complete!')

      // Show success toast
      toast({
        title: 'Success!',
        description: `Created ${data.data.componentsCreated} components from GitHub`,
      })

      // Reload page after short delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      console.error('GitHub import error:', error)
      setProgressMessage('Import failed')
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: error.message,
      })
      setProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false)
      setResult(null)
      setProgress(0)
      setProgressMessage('')
      setGithubUsername('')
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
          <Github className="w-4 h-4" />
          Import from GitHub
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-[#0f172a]/95 backdrop-blur-sm border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Github className="w-5 h-5 text-[#0ea5e9]" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Import your GitHub repositories, skills, and projects as CV components
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isLoading && !result && (
            <>
              {/* Input */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  GitHub Username or Profile URL
                </label>
                <Input
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g., octocat or github.com/octocat"
                  className="bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && githubUsername.trim()) {
                      handleImport()
                    }
                  }}
                />
                <p className="text-xs text-gray-400">
                  We'll import your top repositories and create components automatically
                </p>
              </div>

              {/* Info */}
              <div className="p-3 bg-[#0ea5e9]/10 rounded-lg border border-[#0ea5e9]/20">
                <p className="text-sm text-[#0ea5e9]">
                  <strong>What will be imported:</strong>
                </p>
                <ul className="text-xs text-gray-300 mt-2 space-y-1 ml-4">
                  <li>• Profile information and bio</li>
                  <li>• Top 10 repositories as projects</li>
                  <li>• Programming languages as skills</li>
                  <li>• Repository descriptions and READMEs</li>
                </ul>
              </div>

              {/* Import Button */}
              <ShimmerButton
                onClick={handleImport}
                disabled={!githubUsername.trim()}
                className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white"
              >
                <Github className="w-4 h-4 mr-2" />
                Import Components
              </ShimmerButton>
            </>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin" />
                <div className="text-center">
                  <p className="text-white font-medium">Importing from GitHub...</p>
                  <p className="text-sm text-gray-400 mt-1">{progressMessage}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-[#0ea5e9] font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <p className="text-xs text-gray-400 text-center">
                This may take 30-60 seconds depending on the number of repositories
              </p>
            </div>
          )}

          {/* Result */}
          {result && !isLoading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-500 font-medium">
                  Import successful!
                </p>
              </div>

              {/* Profile Info */}
              {result.profile && (
                <div className="p-3 bg-[#0ea5e9]/10 rounded-lg border border-[#0ea5e9]/20">
                  <div className="flex items-center gap-3">
                    {result.profile.avatar_url && (
                      <img
                        src={result.profile.avatar_url}
                        alt={result.profile.login}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {result.profile.name || result.profile.login}
                      </p>
                      <p className="text-sm text-gray-400">
                        @{result.profile.login} • {result.profile.public_repos} repos
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-500">
                    {result.componentsCreated}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Components</div>
                </div>
                <div className="p-3 bg-[#0ea5e9]/10 rounded-lg border border-[#0ea5e9]/20">
                  <div className="text-2xl font-bold text-[#0ea5e9]">
                    {result.profile?.public_repos || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Repositories</div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="text-2xl font-bold text-red-500">
                    {result.errors.length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Errors</div>
                </div>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <p className="text-sm text-yellow-500 font-medium">
                      Some items had errors
                    </p>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1 ml-6">
                    {result.errors.slice(0, 3).map((error, i) => (
                      <li key={i}>
                        {error.type}: {error.error}
                      </li>
                    ))}
                    {result.errors.length > 3 && (
                      <li>... and {result.errors.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}

              <p className="text-sm text-gray-400 text-center">
                Page will refresh automatically...
              </p>
            </div>
          )}

          {!isLoading && !result && (
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
