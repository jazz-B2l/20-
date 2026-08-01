'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

// Import Sub-panels
import { AdminSidebar, AdminView } from './admin/admin-sidebar'
import { AdminTopbar } from './admin/admin-topbar'
import { CommandPalette } from './admin/command-palette'
import { OppCreateWizard } from './admin/opp-create-wizard'
import { DashboardHome } from './admin/dashboard-home'
import { ListingsTab } from './admin-listings'
import { UniversitiesTab } from './admin-universities'
import { AcademicUnitsTab } from './admin/admin-academic-units'
import { MediaLibraryTab } from './admin/admin-media-library'
import { SuggestedUpdatesDiff } from './admin/suggested-updates-diff'
import { TrashCenter } from './admin/trash-center'
import { TeamTab } from './admin/admin-team'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  CalendarDays,
  Calendar,
  FileText,
  Link2,
  Users,
  Shield,
  History,
  Settings,
  Plus,
  Trash2,
  Globe,
  Mail,
  ShieldAlert,
  Database
} from 'lucide-react'

export function AdminDashboard({ user, roleName = 'viewer' }: { user: User, roleName?: string }) {
  const router = useRouter()
  const supabase = createClient()

  // State Management
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Sync state from query parameters on load/reload
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const viewParam = params.get('view') as AdminView
      if (viewParam) {
        setCurrentView(viewParam)
      }
    }
  }, [])

  // Sync state to query parameters on route change
  const handleViewChange = (view: AdminView) => {
    setCurrentView(view)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('view', view)
      window.history.pushState({}, '', url.toString())
    }
  }

  // DB Shared lists states
  const [domains, setDomains] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [requiredDocs, setRequiredDocs] = useState<any[]>([])
  const [sources, setSources] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [userRoles, setUserRoles] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  // Global keydown listeners for shortcuts (Ctrl+K, Esc, N)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Toggle Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
      
      // Escape: Close all modals
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
        setWizardOpen(false)
      }

      // N: Open Create wizard (if not inside an input/textarea)
      if (
        e.key === 'n' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !wizardOpen &&
        !commandPaletteOpen
      ) {
        e.preventDefault()
        setWizardOpen(true)
      }
    }

    window.addEventListener('keydown', handleGlobalShortcuts)
    return () => window.removeEventListener('keydown', handleGlobalShortcuts)
  }, [wizardOpen, commandPaletteOpen])

  // Fetch lists based on selected view to avoid over-fetching
  useEffect(() => {
    const fetchViewData = async () => {
      if (currentView === 'domains') {
        const { data } = await supabase.from('domains').select('*').order('name_fr')
        setDomains(data || [])
      } else if (currentView === 'sessions') {
        const { data } = await supabase.from('sessions').select('*, opportunity:opportunities(title_fr)').order('academic_year')
        setSessions(data || [])
      } else if (currentView === 'events') {
        const { data } = await supabase.from('events').select('*, session:sessions(academic_year, opportunity:opportunities(title_fr))')
        setEvents(data || [])
      } else if (currentView === 'required-documents') {
        const { data } = await supabase.from('required_documents').select('*, session:sessions(academic_year, opportunity:opportunities(title_fr))')
        setRequiredDocs(data || [])
      } else if (currentView === 'sources') {
        const { data } = await supabase.from('sources').select('*')
        setSources(data || [])
      } else if (currentView === 'announcements') {
        const { data } = await supabase.from('announcements').select('*, university:universities(name_fr)').order('created_at', { ascending: false })
        setAnnouncements(data || [])
      } else if (currentView === 'users') {
        const { data } = await supabase.from('user_roles').select('*')
        setUserRoles(data || [])
      } else if (currentView === 'audit-logs') {
        const { data } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false })
        setAuditLogs(data || [])
      }
    }
    fetchViewData()
  }, [currentView])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 1. Sidebar (Supports Desktop Minimize Collapse + Mobile Responsive Drawer) */}
      <AdminSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        roleName={roleName}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main content container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header bar */}
        <AdminTopbar
          currentView={currentView}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
          userEmail={user.email || 'Admin'}
          roleName={roleName}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenWizard={() => setWizardOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(m => !m)}
        />

        {/* 3. Main Workspace panel content (Mobile Responsive Padding) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {currentView === 'dashboard' && (
            <DashboardHome onViewChange={handleViewChange} onOpenWizard={() => setWizardOpen(true)} roleName={roleName} />
          )}

          {currentView === 'universities' && (
            <UniversitiesTab roleName={roleName} />
          )}

          {currentView === 'suggested-updates' && (
            <SuggestedUpdatesDiff />
          )}

          {currentView === 'team' && (
            <TeamTab currentUserEmail={user.email || ''} />
          )}

        </main>
      </div>

      {/* 4. Overlay Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onViewChange={handleViewChange}
        onOpenWizard={() => setWizardOpen(true)}
      />

      {/* 5. Create Opportunity Form Wizard */}
      <OppCreateWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onPublishSuccess={() => {
          alert('Opportunity successfully created and published!')
          if (currentView === 'opportunities') {
            // Reload list directly by simulating click or state load
            window.location.reload()
          } else {
            handleViewChange('opportunities')
          }
        }}
      />
    </div>
  )
}
