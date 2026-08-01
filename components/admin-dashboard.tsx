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
import { UniversitiesTab } from './admin-universities'
import { SuggestedUpdatesDiff } from './admin/suggested-updates-diff'
import { TeamTab } from './admin/admin-team'

export function AdminDashboard({ user, roleName = 'viewer' }: { user: User, roleName?: string }) {
  const router = useRouter()
  const supabase = createClient()

  // State Management
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  // Sidebar minimize (desktop) & mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  // Global keydown listeners for shortcuts (Ctrl+K, Esc, N)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Toggle Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
      
      // Escape: Close all modals & drawers
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
        setWizardOpen(false)
        setMobileOpen(false)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 1. Sidebar (Responsive Desktop Collapsible & Mobile Drawer) */}
      <AdminSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        roleName={roleName}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(prev => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
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
          onToggleMobile={() => setMobileOpen(prev => !prev)}
        />

        {/* 3. Main Workspace panel content (Responsive padding for phone screens) */}
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
          handleViewChange('universities')
        }}
      />
    </div>
  )
}
