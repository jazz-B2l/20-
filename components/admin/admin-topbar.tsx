'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Bell,
  ChevronRight,
  User,
  LogOut,
  Menu,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminView } from './admin-sidebar'

interface AdminTopbarProps {
  currentView: AdminView
  onViewChange: (view: AdminView) => void
  onLogout: () => void
  userEmail: string
  roleName?: string
  onOpenCommandPalette: () => void
  onOpenWizard: () => void
  onToggleMobile?: () => void
}

export function AdminTopbar({
  currentView,
  onViewChange,
  onLogout,
  userEmail,
  roleName = 'viewer',
  onOpenCommandPalette,
  onOpenWizard,
  onToggleMobile
}: AdminTopbarProps) {
  const isViewer = roleName === 'viewer'
  const [profileOpen, setProfileOpen] = useState(false)
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false)

  const getBreadcrumbs = (view: AdminView): string[] => {
    switch (view) {
      case 'dashboard':
        return ['Dashboard']
      case 'opportunities':
        return ['Content', 'Opportunities']
      case 'announcements':
        return ['Content', 'Announcements']
      case 'universities':
        return ['Academic', 'Universities']
      case 'academic-units':
        return ['Academic', 'Academic Units']
      case 'domains':
        return ['Academic', 'Domains']
      case 'sessions':
        return ['Admissions', 'Sessions']
      case 'events':
        return ['Admissions', 'Events']
      case 'required-documents':
        return ['Admissions', 'Required Documents']
      case 'media-library':
        return ['Assets', 'Media Library']
      case 'sources':
        return ['Assets', 'Sources']
      case 'suggested-updates':
        return ['Moderation', 'Suggested Updates']
      case 'users':
        return ['Moderation', 'Users']
      case 'roles':
        return ['Moderation', 'Roles & Access']
      case 'audit-logs':
        return ['Moderation', 'Audit Logs']
      case 'settings':
        return ['System', 'Settings']
      case 'trash':
        return ['System', 'Trash Bin']
      default:
        return ['CMS']
    }
  }

  const breadcrumbs = getBreadcrumbs(currentView)

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 select-none">
      {/* Left section: Hamburger menu & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onToggleMobile}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer md:hidden shrink-0"
          title="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground font-medium truncate">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5 truncate">
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />}
              <span className={idx === breadcrumbs.length - 1 ? 'text-foreground font-semibold truncate' : 'truncate'}>
                {crumb}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile current title */}
        <span className="sm:hidden font-bold text-foreground text-sm truncate">
          {breadcrumbs[breadcrumbs.length - 1]}
        </span>
      </div>

      {/* Right section: Search bar, quick create, profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search button that triggers Command Palette */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-muted-foreground bg-muted hover:bg-muted/80 border border-border rounded-md transition-colors cursor-pointer w-28 sm:w-44 md:w-48 text-left truncate"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Search...</span>
          <kbd className="ml-auto pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-card px-1.5 font-mono text-[9px] font-medium opacity-100">
            <span className="text-[10px]">Ctrl</span>K
          </kbd>
        </button>

        {/* Quick create dropdown button (Hidden for viewer) */}
        {!isViewer && (
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
              className="flex items-center gap-1 cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-2.5 sm:px-3.5 py-1.5 text-xs"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>

            {createDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCreateDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-52 bg-popover text-popover-foreground border border-border rounded-md shadow-lg py-1 z-50 text-sm">
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false)
                      onOpenWizard()
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted font-medium flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    Opportunity
                  </button>
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false)
                      onViewChange('universities')
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted"
                  >
                    Institution / University
                  </button>
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false)
                      onViewChange('announcements')
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted"
                  >
                    Announcement
                  </button>
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false)
                      onViewChange('academic-units')
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted"
                  >
                    Academic Unit
                  </button>
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false)
                      onViewChange('media-library')
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted"
                  >
                    Upload Media
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Profile menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border border-border text-foreground hover:border-primary transition-all cursor-pointer overflow-hidden font-bold text-xs shrink-0"
          >
            {userEmail ? userEmail.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-popover text-popover-foreground border border-border rounded-md shadow-lg py-2.5 z-50 text-sm">
                <div className="px-4 py-1.5 border-b border-border mb-1.5">
                  <p className="font-semibold text-foreground truncate">{userEmail}</p>
                  <p className="text-xs text-muted-foreground capitalize">{roleName.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    onViewChange('settings')
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  My Settings
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    onLogout()
                  }}
                  className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/5 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
