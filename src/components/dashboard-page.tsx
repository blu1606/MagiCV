"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, Trash2, Download, Copy, Search, Filter, Upload } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { useCVs, useDashboardStats } from "@/hooks/use-data"
import { SignOutButton } from "@/components/signout-button"
import { GridPattern } from "@/components/ui/grid-pattern"
import { NumberTicker } from "@/components/ui/number-ticker"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { ShimmerButton } from "@/components/ui/shimmer-button"

interface CV {
  id: string
  title: string
  job_description: string | null
  match_score: number | null
  created_at: string
  content: any
}

export function DashboardPage() {
  const { cvs, loading: cvsLoading, error: cvsError, refetch: refetchCVs } = useCVs()
  const { stats, loading: statsLoading } = useDashboardStats()
  const { toast } = useToast()

  const [jobDescription, setJobDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "completed" | "archived">("all")
  const [sortBy, setSortBy] = useState<"recent" | "score">("recent")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cvToDelete, setCvToDelete] = useState<CV | null>(null)

  const filteredCVs = cvs
    .filter((cv) => {
      const matchesSearch =
        cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cv.job_description && cv.job_description.toLowerCase().includes(searchQuery.toLowerCase()))
      // For now, we'll show all CVs since we don't have status in the backend yet
      const matchesStatus = filterStatus === "all" || true
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        return (b.match_score || 0) - (a.match_score || 0)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const handleGenerateCV = async () => {
    if (!jobDescription.trim()) return

    setIsGenerating(true)
    try {
      // TODO: Implement CV generation API call
      console.log('Generating CV for:', jobDescription)
      // For now, just close the dialog
      setJobDescription("")
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error generating CV:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteCV = async (id: string) => {
    const cv = cvs.find(c => c.id === id)
    if (cv) {
      setCvToDelete(cv)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeleteCV = async () => {
    if (!cvToDelete) return

    try {
      const response = await fetch(`/api/cv/${cvToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete CV')
      }

      toast({
        title: 'CV deleted',
        description: `"${cvToDelete.title}" has been deleted successfully`,
      })

      // Refresh CV list
      refetchCVs()
    } catch (error: any) {
      console.error('Error deleting CV:', error)
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message,
      })
    } finally {
      setDeleteDialogOpen(false)
      setCvToDelete(null)
    }
  }

  const handleDuplicateCV = async (cv: CV) => {
    try {
      // TODO: Implement CV duplication API call
      console.log('Duplicating CV:', cv.id)
    } catch (error) {
      console.error('Error duplicating CV:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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

      {/* Navigation */}
      <nav className="border-b border-white/20 backdrop-blur-sm sticky top-0 z-50 bg-[#0f172a]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0ea5e9] to-[#22d3ee] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-white">MagicCV</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/library">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 border-white/20">
                Library
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 border-white/20">
                Profile
              </Button>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-white">Welcome back</h1>
            <div className="flex items-center gap-3">
              <Link href="/jd/upload">
                <ShimmerButton className="bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload JD
                </ShimmerButton>
              </Link>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <ShimmerButton className="bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate CV
                  </ShimmerButton>
                </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#0f172a]/95 backdrop-blur-sm border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Generate New CV</DialogTitle>
                  <DialogDescription className="text-gray-300">Paste a job description to generate an optimized CV</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-40 resize-none bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <ShimmerButton
                    onClick={handleGenerateCV}
                    disabled={!jobDescription.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Building your draft...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Generate CV
                      </>
                    )}
                  </ShimmerButton>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
          <p className="text-gray-300">Upload a job description PDF or create a new CV</p>
        </div>

        {/* Search and Filter Section */}
        {cvs.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search CVs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-full sm:w-40 bg-[#0f172a]/80 border-white/20 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">All CVs</SelectItem>
                  <SelectItem value="draft" className="text-white hover:bg-white/10">Draft</SelectItem>
                  <SelectItem value="completed" className="text-white hover:bg-white/10">Completed</SelectItem>
                  <SelectItem value="archived" className="text-white hover:bg-white/10">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-40 bg-[#0f172a]/80 border-white/20 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/20">
                  <SelectItem value="recent" className="text-white hover:bg-white/10">Most Recent</SelectItem>
                  <SelectItem value="score" className="text-white hover:bg-white/10">Highest Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* CVs List */}
        <div>
          {cvsLoading ? (
            <Card className="p-12 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <div className="w-12 h-12 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-300">Loading CVs...</p>
            </Card>
          ) : cvsError ? (
            <Card className="p-12 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <FileText className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-50" />
              <p className="text-red-400 mb-4">Error loading CVs: {cvsError}</p>
            </Card>
          ) : filteredCVs.length === 0 ? (
            <Card className="p-12 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <FileText className="w-12 h-12 text-white mx-auto mb-4 opacity-50" />
              <p className="text-gray-300 mb-4">
                {cvs.length === 0 ? "No CVs yet. Create one to get started!" : "No CVs match your search."}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCVs.map((cv) => (
                <Link key={cv.id} href={`/editor/${cv.id}`}>
                  <Card className="p-8 hover:border-[#0ea5e9]/50 hover:bg-[#0f172a]/90 transition-all cursor-pointer group bg-[#0f172a]/80 backdrop-blur-sm border-white/20 overflow-hidden">
                    <div className="flex items-start justify-between gap-4 min-w-0">
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 min-w-0">
                          <h3 className="font-bold group-hover:text-[#0ea5e9] transition-colors truncate text-white min-w-0">
                            {cv.title}
                          </h3>
                          <Badge className="bg-[#0ea5e9]/10 border-[#0ea5e9]/20 text-[#0ea5e9] text-xs shrink-0">draft</Badge>
                        </div>
                        <p className="text-sm text-gray-300 mt-1 truncate overflow-hidden">{cv.job_description || 'No description'}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
                          <span className="truncate">{new Date(cv.created_at).toLocaleDateString()}</span>
                          <span className="capitalize truncate">modern template</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#0ea5e9]">
                            <NumberTicker value={cv.match_score || 0} />%
                          </div>
                          <p className="text-xs text-gray-400">Match</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              handleDuplicateCV(cv)
                            }}
                            title="Duplicate CV"
                            className="text-white hover:bg-white/10"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                            }}
                            title="Download CV"
                            className="text-white hover:bg-white/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              handleDeleteCV(cv.id)
                            }}
                            title="Delete CV"
                            className="text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        {!statsLoading && stats.totalCVs > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-8 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <div className="text-3xl font-bold text-[#0ea5e9]">
                <NumberTicker value={stats.totalCVs} />
              </div>
              <AnimatedGradientText className="text-sm mt-2">
                Total CVs
              </AnimatedGradientText>
            </Card>
            <Card className="p-8 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <div className="text-3xl font-bold text-[#f97316]">
                <NumberTicker value={cvs.length > 0 ? Math.round(cvs.reduce((sum, cv) => sum + (cv.match_score || 0), 0) / cvs.length) : 0} />%
              </div>
              <AnimatedGradientText className="text-sm mt-2">
                Average Match Score
              </AnimatedGradientText>
            </Card>
            <Card className="p-8 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <div className="text-3xl font-bold text-[#22d3ee]">
                <NumberTicker value={stats.totalComponents} />
              </div>
              <AnimatedGradientText className="text-sm mt-2">
                Total Components
              </AnimatedGradientText>
            </Card>
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0f172a] border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete CV?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#94a3b8]">
              Are you sure you want to delete "<span className="font-medium text-white">{cvToDelete?.title}</span>"?
              This action cannot be undone and will permanently remove the CV and all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCV}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
