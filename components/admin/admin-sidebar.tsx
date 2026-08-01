'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  School,
  GitPullRequest,
  GraduationCap,
  Users
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
}

export function AdminSidebar({ currentView, onViewChange, roleName = 'viewer' }: AdminSidebarProps) {
  const sections: SidebarSection[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: '20% Master Units',
      items: [
        { id: 'opportunities', label: 'Listings / Programs', icon: GraduationCap },
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

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen overflow-y-auto select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border gap-2.5">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-extrabold text-lg select-none shadow-xs">
          20
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground leading-tight">20% CMS</span>
          <span className="text-[10px] text-muted-foreground font-mono leading-none">20% Master Portal</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 py-4 px-3 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <h3 className="px-3 text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase select-none">
                {section.title}
              </h3>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onViewChange(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 cursor-pointer text-left',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
