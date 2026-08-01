'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles,
  School,
  FileCheck,
  AlertTriangle,
  Activity,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  ArrowUpRight,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminView } from './admin-sidebar'

interface DashboardHomeProps {
  onViewChange: (view: AdminView) => void
  onOpenWizard: () => void
  roleName?: string
}

export function DashboardHome({ onViewChange, onOpenWizard, roleName = 'viewer' }: DashboardHomeProps) {
  const isViewer = roleName === 'viewer'
  const supabase = createClient()
  const [stats, setStats] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [closingSoon, setClosingSoon] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        // 1. Fetch counts
        const { count: openCount } = await supabase
          .from('opportunities')
          .select('*', { count: 'exact', head: true })
          .eq('workflow_status', 'published')

        const { count: draftCount } = await supabase
          .from('opportunities')
          .select('*', { count: 'exact', head: true })
          .eq('workflow_status', 'draft')

        const { count: pendingCount } = await supabase
          .from('sources')
          .select('*', { count: 'exact', head: true })
          .eq('source_type', 'manual')
          .eq('verification_status', 'pending')

        const { count: univCount } = await supabase
          .from('universities')
          .select('*', { count: 'exact', head: true })

        // 2. Fetch recent activity from audit logs
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(4)

        // 3. Fetch events closing soon
        const { data: closeEvents } = await supabase
          .from('events')
          .select(`
            id,
            event_date,
            session:sessions(
              academic_year,
              opportunity:opportunities(
                title_fr,
                university:universities(name_fr)
              )
            )
          `)
          .eq('event_type', 'app_closes')
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(3)

        // 4. Fetch latest suggestions from sources
        const { data: suggestionsData } = await supabase
          .from('sources')
          .select(`
            id,
            created_at,
            url,
            message,
            opportunity:opportunities(title_fr)
          `)
          .eq('source_type', 'manual')
          .eq('verification_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(3)

        // Set state
        setStats([
          { title: 'Open Opportunities', value: String(openCount || 0), change: 'Published to public portal', icon: Sparkles, color: 'text-emerald-500 bg-emerald-500/10' },
          { title: 'Draft Opportunities', value: String(draftCount || 0), change: 'In review or preparation', icon: Layers, color: 'text-amber-500 bg-amber-500/10' },
          { title: 'Pending Reviews', value: String(pendingCount || 0), change: 'Community corrections in queue', icon: FileCheck, color: 'text-blue-500 bg-blue-500/10' },
          { title: 'Total Institutions', value: String(univCount || 0), change: 'Registered universities', icon: School, color: 'text-indigo-500 bg-indigo-500/10' }
        ])

        setActivities((logs || []).map(log => {
          return {
            user: log.user_id ? `User ${log.user_id.slice(0, 8)}` : 'System Agent',
            action: `${log.action}d record in`,
            target: `${log.table_name}`,
            time: new Date(log.timestamp).toLocaleTimeString()
          }
        }))

        setClosingSoon((closeEvents || []).map((ev: any) => {
          const opp = ev.session?.opportunity || {}
          const univ = opp.university || {}
          const diffMs = new Date(ev.event_date).getTime() - Date.now()
          const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
          return {
            title: opp.title_fr || 'Master Program',
            university: univ.name_fr || 'Unknown University',
            daysLeft: days,
            date: new Date(ev.event_date).toLocaleDateString()
          }
        }))

        setSuggestions((suggestionsData || []).map((s: any) => {
          return {
            field: s.opportunity?.title_fr || 'Correction Suggestion',
            newVal: s.message || 'Suggested changes details.',
            author: s.url || 'Guest Contributor',
            time: new Date(s.created_at).toLocaleTimeString()
          }
        }))
      } catch (e) {
        console.error('Error fetching dashboard data:', e)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading dashboard overview...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-none animate-in fade-in duration-200">
      {/* Page Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Overview Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Here is a quick look at your academic network operations status today.</p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="border border-border bg-card shadow-xs hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="font-medium">{stat.change}</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Middle Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col (Admissions deadlines and quick actions) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-bold text-foreground mb-4">Power Workflows</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {!isViewer && (
                <button
                  onClick={onOpenWizard}
                  className="flex flex-col items-center justify-center p-4 bg-muted hover:bg-primary/5 border border-border hover:border-primary/30 rounded-lg text-center gap-2 cursor-pointer transition-all group"
                >
                  <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                    <Plus className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">New Opportunity</span>
                </button>
              )}

              <button
                onClick={() => onViewChange('media-library')}
                className="flex flex-col items-center justify-center p-4 bg-muted hover:bg-primary/5 border border-border hover:border-primary/30 rounded-lg text-center gap-2 cursor-pointer transition-all group"
              >
                <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-500 group-hover:scale-105 transition-transform">
                  <ArrowUpRight className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-semibold text-foreground">Upload Media</span>
              </button>

              <button
                onClick={() => onViewChange('suggested-updates')}
                className="flex flex-col items-center justify-center p-4 bg-muted hover:bg-primary/5 border border-border hover:border-primary/30 rounded-lg text-center gap-2 cursor-pointer transition-all group"
              >
                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
                  <FileCheck className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-semibold text-foreground">Review Suggestions</span>
              </button>

              <button
                onClick={() => onViewChange('settings')}
                className="flex flex-col items-center justify-center p-4 bg-muted hover:bg-primary/5 border border-border hover:border-primary/30 rounded-lg text-center gap-2 cursor-pointer transition-all group"
              >
                <div className="p-2 rounded-full bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-semibold text-foreground">System Health</span>
              </button>
            </div>
          </div>

          {/* Opportunities Closing Soon */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Opportunities Closing Soon</h3>
              <button
                onClick={() => onViewChange('universities')}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="divide-y divide-border">
              {closingSoon.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No upcoming deadlines registered.</p>
              ) : (
                closingSoon.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.university} • Closes {item.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.daysLeft <= 3
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {item.daysLeft} days left
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Col (Activity Logs & suggestions list) */}
        <div className="space-y-6">
          
          {/* Recent Activity timeline */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-bold text-foreground mb-4">Recent activity</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No activity records logged.</p>
            ) : (
              <div className="relative border-l border-border pl-4 space-y-5 py-2">
                {activities.map((item, idx) => (
                  <div key={idx} className="relative">
                    {/* Point icon */}
                    <div className="absolute -left-[20.5px] top-1 w-3.5 h-3.5 rounded-full border border-border bg-card flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-normal">
                        {item.user} <span className="text-muted-foreground font-normal">{item.action}</span> <span className="text-primary font-medium">{item.target}</span>
                      </p>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Suggestions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Latest Suggestions</h3>
              <button
                onClick={() => onViewChange('suggested-updates')}
                className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                Moderate
              </button>
            </div>
            
            <div className="space-y-3">
              {suggestions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No suggestions in queue.</p>
              ) : (
                suggestions.map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/40 border border-border rounded-lg text-xs leading-normal">
                    <div className="flex items-center justify-between text-muted-foreground mb-1.5 font-mono text-[10px]">
                      <span>{item.author}</span>
                      <span>{item.time}</span>
                    </div>
                    <p className="font-semibold text-foreground">{item.field}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{item.newVal}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
