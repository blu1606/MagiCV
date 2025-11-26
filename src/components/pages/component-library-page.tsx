'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Calendar,
  MapPin,
  ExternalLink,
  Github,
  Linkedin,
} from 'lucide-react'

interface Component {
  id: string
  type: 'experience' | 'education' | 'skill' | 'project'
  title: string
  organization?: string
  start_date?: string
  end_date?: string
  description?: string
  highlights: string[]
  src?: string
  created_at: string
  updated_at: string
}

const COMPONENT_TYPES = {
  experience: { icon: Briefcase, label: 'Experience', color: '#0ea5e9' },
  education: { icon: GraduationCap, label: 'Education', color: '#8b5cf6' },
  skill: { icon: Code, label: 'Skill', color: '#10b981' },
  project: { icon: FolderGit2, label: 'Project', color: '#f97316' },
}

export function ComponentLibraryPage() {
  const [components, setComponents] = useState<Component[]>([])
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<Partial<Component>>({
    type: 'experience',
    title: '',
    organization: '',
    description: '',
    highlights: [],
  })

  useEffect(() => {
    loadComponents()
  }, [])

  useEffect(() => {
    filterComponents()
  }, [components, searchQuery, filterType])

  const loadComponents = async () => {
    try {
      const response = await fetch('/api/components')
      if (response.ok) {
        const data = await response.json()
        setComponents(data.components || [])
      }
    } catch (error) {
      console.error('Error loading components:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterComponents = () => {
    let filtered = components

    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.organization?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      )
    }

    setFilteredComponents(filtered)
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingComponent(null)
    setFormData({
      type: 'experience',
      title: '',
      organization: '',
      description: '',
      highlights: [],
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (component: Component) => {
    setIsCreating(false)
    setEditingComponent(component)
    setFormData(component)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this component?')) return

    try {
      const response = await fetch(`/api/components/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadComponents()
      }
    } catch (error) {
      console.error('Error deleting component:', error)
    }
  }

  const handleSave = async () => {
    try {
      const url = isCreating ? '/api/components' : `/api/components/${editingComponent?.id}`
      const method = isCreating ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        await loadComponents()
      }
    } catch (error) {
      console.error('Error saving component:', error)
    }
  }

  const groupedComponents = filteredComponents.reduce((acc, component) => {
    if (!acc[component.type]) acc[component.type] = []
    acc[component.type].push(component)
    return acc
  }, {} as Record<string, Component[]>)

  const getSourceIcon = (src?: string) => {
    if (!src) return null
    if (src.includes('github')) return <Github className="w-4 h-4" />
    if (src.includes('linkedin')) return <Linkedin className="w-4 h-4" />
    return <ExternalLink className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Component Library
            </h1>
            <p className="text-slate-400">
              Manage your CV components - experiences, skills, projects, and education
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Component
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f172a]/80 backdrop-blur-sm border-white/10 text-white placeholder:text-slate-500 h-12"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 text-white h-12">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="skill">Skills</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(COMPONENT_TYPES).map(([type, config]) => {
            const Icon = config.icon
            const count = components.filter(c => c.type === type).length
            return (
              <Card key={type} className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg border"
                    style={{
                      backgroundColor: `${config.color}15`,
                      borderColor: `${config.color}30`
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{count}</p>
                    <p className="text-xs text-slate-400">{config.label}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Components List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading components...</div>
        ) : filteredComponents.length === 0 ? (
          <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-12 text-center">
            <p className="text-slate-400 mb-4">No components found</p>
            <Button onClick={handleCreate} className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Component
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedComponents).map(([type, items]) => {
              const config = COMPONENT_TYPES[type as keyof typeof COMPONENT_TYPES]
              const Icon = config.icon
              return (
                <div key={type}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="p-2 rounded-lg border"
                      style={{
                        backgroundColor: `${config.color}15`,
                        borderColor: `${config.color}30`
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      {config.label} ({items.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((component) => (
                      <Card key={component.id} className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 hover:border-[#0ea5e9]/30 transition-all p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {component.title}
                            </h3>
                            {component.organization && (
                              <p className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                                <Briefcase className="w-4 h-4" />
                                {component.organization}
                              </p>
                            )}
                            {(component.start_date || component.end_date) && (
                              <p className="text-xs text-slate-500 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {component.start_date} - {component.end_date || 'Present'}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(component)}
                              className="text-slate-400 hover:text-white hover:bg-white/10 p-2 h-auto"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(component.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {component.description && (
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {component.description}
                          </p>
                        )}
                        {component.highlights && component.highlights.length > 0 && (
                          <div className="space-y-1 mb-3">
                            {component.highlights.slice(0, 2).map((highlight, idx) => (
                              <p key={idx} className="text-xs text-slate-500 line-clamp-1">
                                • {highlight}
                              </p>
                            ))}
                            {component.highlights.length > 2 && (
                              <p className="text-xs text-slate-600">
                                +{component.highlights.length - 2} more
                              </p>
                            )}
                          </div>
                        )}
                        {component.src && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {getSourceIcon(component.src)}
                            <span>Imported from {component.src}</span>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isCreating ? 'Add New Component' : 'Edit Component'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {isCreating ? 'Create a new CV component' : 'Update component details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger className="bg-[#0f172a]/80 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COMPONENT_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                className="bg-[#0f172a]/80 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Organization</label>
              <Input
                value={formData.organization || ''}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g., Google"
                className="bg-[#0f172a]/80 border-white/10 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-[#0f172a]/80 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-[#0f172a]/80 border-white/10 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this component"
                rows={4}
                className="bg-[#0f172a]/80 border-white/10 text-white resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-white/20 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
            >
              {isCreating ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
