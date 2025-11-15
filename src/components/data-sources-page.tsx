'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Github,
  Linkedin,
  Youtube,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Star,
  TrendingUp,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react'
import Link from 'next/link'

interface DataSource {
  id: string
  provider: 'github' | 'linkedin' | 'youtube'
  connected: boolean
  lastSynced?: string
  status: 'synced' | 'syncing' | 'error' | 'never'
  stats?: {
    components: number
    experiences?: number
    projects?: number
    skills?: number
  }
}

const DATA_SOURCE_CONFIG = {
  github: {
    name: 'GitHub',
    icon: Github,
    color: '#0ea5e9',
    description: 'Import your repositories, contributions, and projects',
    features: ['Repositories', 'Contributions', 'Languages', 'Projects']
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0077b5',
    description: 'Sync your experiences, education, and skills',
    features: ['Experiences', 'Education', 'Skills', 'Certifications']
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: '#ff0000',
    description: 'Add your videos and content creation work',
    features: ['Videos', 'Descriptions', 'View Count', 'Engagement']
  }
}

export function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    loadDataSources()
  }, [])

  const loadDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources/status')
      if (response.ok) {
        const data = await response.json()
        setDataSources(data.sources || [])
      }
    } catch (error) {
      console.error('Error loading data sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (provider: string) => {
    setSyncing(provider)
    try {
      const response = await fetch('/api/data-sources/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      if (response.ok) {
        await loadDataSources()
      }
    } catch (error) {
      console.error('Error syncing:', error)
    } finally {
      setSyncing(null)
    }
  }

  const handleConnect = async (provider: string) => {
    try {
      const response = await fetch('/api/data-sources/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      if (response.ok) {
        const { authUrl } = await response.json()
        window.location.href = authUrl
      }
    } catch (error) {
      console.error('Error connecting:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-[#0ea5e9] animate-spin" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge className="bg-green-500/10 border-green-500/20 text-green-500">Synced</Badge>
      case 'syncing':
        return <Badge className="bg-[#0ea5e9]/10 border-[#0ea5e9]/20 text-[#0ea5e9]">Syncing...</Badge>
      case 'error':
        return <Badge className="bg-red-500/10 border-red-500/20 text-red-500">Error</Badge>
      default:
        return <Badge className="bg-slate-500/10 border-slate-500/20 text-slate-400">Never Synced</Badge>
    }
  }

  const totalComponents = dataSources.reduce((sum, source) => sum + (source.stats?.components || 0), 0)
  const connectedSources = dataSources.filter(s => s.connected).length

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Data Sources
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Connect and sync your professional profiles to auto-populate your CV components
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Connected Sources</p>
                <p className="text-3xl font-bold text-white">{connectedSources}/3</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20">
                <LinkIcon className="w-6 h-6 text-[#0ea5e9]" />
              </div>
            </div>
            <Progress value={(connectedSources / 3) * 100} className="mt-4 h-2" />
          </Card>

          <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Components</p>
                <p className="text-3xl font-bold text-white">{totalComponents}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <Database className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Last Updated</p>
                <p className="text-lg font-semibold text-white">
                  {dataSources.some(s => s.lastSynced)
                    ? new Date(Math.max(...dataSources.filter(s => s.lastSynced).map(s => new Date(s.lastSynced!).getTime()))).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20">
                <Calendar className="w-6 h-6 text-[#f97316]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Data Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(DATA_SOURCE_CONFIG).map(([key, config]) => {
            const source = dataSources.find(s => s.provider === key)
            const Icon = config.icon
            const isSyncing = syncing === key

            return (
              <Card key={key} className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 hover:border-[#0ea5e9]/30 transition-all">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-lg border"
                        style={{
                          backgroundColor: `${config.color}15`,
                          borderColor: `${config.color}30`
                        }}
                      >
                        <Icon className="w-6 h-6" style={{ color: config.color }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{config.name}</h3>
                        {source?.connected && getStatusBadge(source.status)}
                      </div>
                    </div>
                    {source?.status && getStatusIcon(source.status)}
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-sm mb-4">{config.description}</p>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">IMPORTS:</p>
                    <div className="flex flex-wrap gap-2">
                      {config.features.map((feature) => (
                        <Badge key={feature} className="bg-white/5 border-white/10 text-slate-300 text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  {source?.connected && source.stats && (
                    <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Components</span>
                        <span className="text-lg font-semibold text-white">{source.stats.components}</span>
                      </div>
                    </div>
                  )}

                  {/* Last Synced */}
                  {source?.lastSynced && (
                    <div className="text-xs text-slate-500 mb-4">
                      Last synced: {new Date(source.lastSynced).toLocaleString()}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    {source?.connected ? (
                      <>
                        <Button
                          onClick={() => handleSync(key)}
                          disabled={isSyncing}
                          className="w-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
                        >
                          {isSyncing ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Sync Now
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-white/20 text-white hover:bg-white/5"
                          asChild
                        >
                          <Link href={`/data-sources/${key}`}>
                            View Details
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleConnect(key)}
                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      >
                        Connect {config.name}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-[#0ea5e9]/5 border-[#0ea5e9]/20 p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#0ea5e9]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How Data Sources Work</h3>
              <p className="text-slate-400 text-sm mb-3">
                Connect your professional profiles to automatically import your work history, projects, skills, and achievements.
                Your data is securely stored and only used to help create better CVs.
              </p>
              <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                <li>Initial sync may take 1-2 minutes per source</li>
                <li>You can manually sync anytime to get the latest data</li>
                <li>All imported components can be edited in the Component Library</li>
                <li>Disconnect sources anytime from Settings</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
