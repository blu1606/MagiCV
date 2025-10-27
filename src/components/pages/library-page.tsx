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
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "education":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "skill":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "project":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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
          <h1 className="text-lg font-semibold text-white">Component Library</h1>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 glitch-button text-black font-bold">
                  <Plus className="w-4 h-4" />
                  Add Component
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Component</DialogTitle>
                  <DialogDescription>Create a reusable component for your CVs</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Component Title</label>
                    <Input
                      value={newComponent.title}
                      onChange={(e) => setNewComponent({ ...newComponent, title: e.target.value })}
                      placeholder="e.g., Senior Engineer at TechCorp"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Type</label>
                    <select
                      value={newComponent.type}
                      onChange={(e) => setNewComponent({ ...newComponent, type: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="experience">Experience</option>
                      <option value="education">Education</option>
                      <option value="skill">Skill</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Description</label>
                    <Textarea
                      value={newComponent.description}
                      onChange={(e) => setNewComponent({ ...newComponent, description: e.target.value })}
                      placeholder="Describe this component..."
                      className="min-h-24 resize-none"
                    />
                  </div>
                  <Button onClick={handleAddComponent} className="w-full">
                    Add Component
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["all", "experience", "education", "skill", "project"] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Components Grid */}
        {componentsLoading ? (
          <Card className="p-12 text-center bg-black/60 backdrop-blur-sm border-white/20">
            <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading components...</p>
          </Card>
        ) : componentsError ? (
          <Card className="p-12 text-center bg-black/60 backdrop-blur-sm border-white/20">
            <p className="text-red-400 mb-4">Error loading components: {componentsError}</p>
          </Card>
        ) : filteredComponents.length === 0 ? (
          <Card className="p-12 text-center bg-black/60 backdrop-blur-sm border-white/20">
            <p className="text-gray-300 mb-4">
              {components.length === 0
                ? "No components yet. Create one to get started!"
                : "No components match your search."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredComponents.map((component) => (
              <Card key={component.id} className="p-4 hover:border-pink-500 transition-colors bg-black/60 backdrop-blur-sm border-white/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getTypeColor(component.type)} text-xs capitalize`}>{component.type}</Badge>
                    </div>
                    <h3 className="font-semibold truncate text-white">{component.title}</h3>
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
            <Card className="p-6 text-center bg-black/60 backdrop-blur-sm border-white/20">
              <div className="text-3xl font-bold text-pink-400">{components.length}</div>
              <p className="text-sm text-gray-300 mt-2">Total Components</p>
            </Card>
            <Card className="p-6 text-center bg-black/60 backdrop-blur-sm border-white/20">
              <div className="text-3xl font-bold text-pink-400">
                {components.filter(c => c.type === 'experience').length}
              </div>
              <p className="text-sm text-gray-300 mt-2">Experience</p>
            </Card>
            <Card className="p-6 text-center bg-black/60 backdrop-blur-sm border-white/20">
              <div className="text-3xl font-bold text-pink-400">
                {components.filter(c => c.type === 'skill').length}
              </div>
              <p className="text-sm text-gray-300 mt-2">Skills</p>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
