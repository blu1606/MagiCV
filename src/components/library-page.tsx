"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Plus, Edit2, Trash2, Search, Copy } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useComponents } from "@/hooks/use-data"
import { SignOutButton } from "@/components/signout-button"
import { GridPattern } from "@/components/ui/grid-pattern"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"

interface Component {
  id: string
  type: "experience" | "education" | "skill" | "project"
  title: string
  organization: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  highlights: string[]
  created_at?: string
}

export function LibraryPage() {
  const { components, loading: componentsLoading, error: componentsError } = useComponents()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "experience" | "education" | "skill" | "project">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newComponent, setNewComponent] = useState({ title: "", type: "experience" as const, description: "" })

  const filteredComponents = components.filter((comp) => {
    const matchesSearch = comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.organization && comp.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (comp.description && comp.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === "all" || comp.type === filterType
    return matchesSearch && matchesType
  })

  const handleAddComponent = async () => {
    if (newComponent.title.trim() && newComponent.description.trim()) {
      try {
        const response = await fetch('/api/components', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: newComponent.type,
            title: newComponent.title,
            organization: null,
            start_date: null,
            end_date: null,
            description: newComponent.description,
            highlights: [],
          }),
        })
        
        if (response.ok) {
          setNewComponent({ title: "", type: "experience", description: "" })
          setIsDialogOpen(false)
          // Refresh components
          window.location.reload()
        }
      } catch (error) {
        console.error('Error adding component:', error)
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/components/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Refresh components
        window.location.reload()
      }
    } catch (error) {
      console.error('Error deleting component:', error)
    }
  }

  const handleDuplicate = async (component: Component) => {
    try {
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: component.type,
          title: `${component.title} (Copy)`,
          organization: component.organization,
          start_date: component.start_date,
          end_date: component.end_date,
          description: component.description,
          highlights: component.highlights,
        }),
      })
      
      if (response.ok) {
        // Refresh components
        window.location.reload()
      }
    } catch (error) {
      console.error('Error duplicating component:', error)
    }
  }

  const getTypeColor = (type: Component["type"]) => {
    switch (type) {
      case "experience":
        return "bg-[#0ea5e9]/10 border-[#0ea5e9]/20 text-[#0ea5e9]"
      case "education":
        return "bg-[#22d3ee]/10 border-[#22d3ee]/20 text-[#22d3ee]"
      case "skill":
        return "bg-[#f97316]/10 border-[#f97316]/20 text-[#f97316]"
      case "project":
        return "bg-[#8b5cf6]/10 border-[#8b5cf6]/20 text-[#8b5cf6]"
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-500"
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
      {/* Header */}
      <div className="border-b border-white/20 backdrop-blur-sm sticky top-0 z-50 bg-[#0f172a]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10 border-white/20">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white">Component Library</h1>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <ShimmerButton className="bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white px-10 py-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Component
                </ShimmerButton>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md bg-[#0f172a]/95 backdrop-blur-sm border-white/20 text-white p-8">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Component</DialogTitle>
                  <DialogDescription className="text-gray-300">Create a reusable component for your CVs</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-white">Component Title</label>
                    <Input
                      value={newComponent.title}
                      onChange={(e) => setNewComponent({ ...newComponent, title: e.target.value })}
                      placeholder="e.g., Senior Engineer at TechCorp"
                      className="bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-white">Type</label>
                    <select
                      value={newComponent.type}
                      onChange={(e) => setNewComponent({ ...newComponent, type: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-white/20 bg-[#0f172a]/60 text-white focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/50"
                    >
                      <option value="experience">Experience</option>
                      <option value="education">Education</option>
                      <option value="skill">Skill</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-white">Description</label>
                    <Textarea
                      value={newComponent.description}
                      onChange={(e) => setNewComponent({ ...newComponent, description: e.target.value })}
                      placeholder="Describe this component..."
                      className="min-h-24 resize-none bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <ShimmerButton
                    onClick={handleAddComponent}
                    disabled={!newComponent.title.trim() || !newComponent.description.trim()}
                    className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Component
                  </ShimmerButton>
                </div>
              </DialogContent>
            </Dialog>

            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Search and Filter */}
        <div className="mb-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f172a]/80 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["all", "experience", "education", "skill", "project"] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                className={`capitalize ${
                  filterType === type 
                    ? "bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white" 
                    : "bg-[#0f172a]/60 border-white/20 text-white hover:bg-white/10"
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Components Grid */}
        {componentsLoading ? (
          <Card className="p-12 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
            <div className="w-12 h-12 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading components...</p>
          </Card>
        ) : componentsError ? (
          <Card className="p-12 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
            <p className="text-red-400 mb-4">Error loading components: {componentsError}</p>
          </Card>
        ) : filteredComponents.length === 0 ? (
          <Card className="p-12 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
            <p className="text-gray-300 mb-4">
              {components.length === 0
                ? "No components yet. Create one to get started!"
                : "No components match your search."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredComponents.map((component) => (
              <Card key={component.id} className="p-8 hover:border-[#0ea5e9]/50 hover:bg-[#0f172a]/90 transition-all bg-[#0f172a]/80 backdrop-blur-sm border-white/20 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getTypeColor(component.type)} text-xs capitalize`}>
                        <AnimatedGradientText className="text-xs">
                          {component.type}
                        </AnimatedGradientText>
                      </Badge>
                    </div>
                    <h3 className="font-semibold truncate text-white group-hover:text-[#0ea5e9] transition-colors">{component.title}</h3>
                    {component.organization && (
                      <p className="text-sm text-gray-400 mt-1">{component.organization}</p>
                    )}
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">{component.description || 'No description'}</p>
                    {component.highlights && component.highlights.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400">Highlights:</p>
                        <ul className="text-xs text-gray-300 mt-1">
                          {component.highlights.slice(0, 2).map((highlight, index) => (
                            <li key={index} className="truncate">• {highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {component.created_at ? new Date(component.created_at).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(component)} title="Duplicate" className="text-white hover:bg-white/10">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit" className="text-white hover:bg-white/10">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(component.id)} title="Delete" className="text-red-400 hover:bg-red-400/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {!componentsLoading && components.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-8 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <div className="text-3xl font-bold text-[#0ea5e9]">{components.length}</div>
              <AnimatedGradientText className="text-sm mt-2">Total Components</AnimatedGradientText>
            </Card>
            <Card className="p-8 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <div className="text-3xl font-bold text-[#f97316]">
                {components.filter(c => c.type === 'experience').length}
              </div>
              <AnimatedGradientText className="text-sm mt-2">Experience</AnimatedGradientText>
            </Card>
            <Card className="p-8 text-center bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <div className="text-3xl font-bold text-[#22d3ee]">
                {components.filter(c => c.type === 'skill').length}
              </div>
              <AnimatedGradientText className="text-sm mt-2">Skills</AnimatedGradientText>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
