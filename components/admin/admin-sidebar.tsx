'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  School,
  GitPullRequest,
  Users,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'

export type AdminView =
  | 'dashboard'
  | 'opportunities'
  | 'universities'
  | 'suggested-updates'
  | 'team'

interface SidebarItem {
  id: AdminView
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

interface AdminSidebarProps {
  currentView: AdminView
  onViewChange: (view: AdminView) => void
  roleName?: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function AdminSidebar({
  currentView,
  onViewChange,
  roleName = 'viewer',
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const sections: SidebarSection[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: '20% Master Units',
      items: [
        { id: 'universities', label: 'Universities & Colleges', icon: School }
      ]
    },
    {
      title: 'Community',
      items: [
        { id: 'suggested-updates', label: 'Suggested Updates', icon: GitPullRequest }
      ]
    }
  ]

  const canAccessTeam = roleName === 'super_admin' || roleName === 'owner'
  if (canAccessTeam) {
    sections.push({
      title: 'Administration',
      items: [
        { id: 'team', label: 'Team & Access', icon: Users }
      ]
    })
  }

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className={cn(
        'h-16 flex items-center border-b border-border transition-all duration-300',
        isCollapsed ? 'px-3 justify-center' : 'px-5 justify-between'
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-extrabold text-lg shrink-0 shadow-xs">
            20
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-semibold text-foreground leading-tight truncate">20% CMS</span>
              <span className="text-[10px] text-muted-foreground font-mono leading-none truncate">20% Master Portal</span>
            </div>
          )}
        </div>

        {/* Mobile close button inside header on small screens */}
        <button
          onClick={onCloseMobile}
          className="p-1 text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
          title="Close drawer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 py-4 px-2.5 space-y-6 overflow-y-auto overflow-x-hidden">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && !isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase select-none truncate">
                {section.title}
              </h3>
            )}
            {section.title && isCollapsed && (
              <div className="my-2 border-t border-border/40" title={section.title} />
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onViewChange(item.id)
                        onCloseMobile()
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'w-full flex items-center text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer text-left',
                        isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
                        isActive
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Minimize / Expand Toggle Button (Desktop only) */}
      <div className="p-3 border-t border-border hidden md:flex items-center justify-between">
        <button
          onClick={onToggleCollapse}
          className={cn(
            'w-full flex items-center gap-2 p-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all cursor-pointer',
            isCollapsed ? 'justify-center' : 'justify-start'
          )}
          title={isCollapsed ? 'Expand Sidebar' : 'Minimize Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0 text-primary" />
              <span>Minimize Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* 1. Mobile Drawer Overlay (Small screens < md) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* 2. Desktop Collapsible Sidebar (Medium+ screens >= md) */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen border-r border-border bg-card transition-all duration-300 shrink-0 select-none',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
