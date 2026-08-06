'use client'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-context'
import {
  LayoutDashboard,
  School,
  GitPullRequest,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  History
} from 'lucide-react'

export type AdminView =
  | 'dashboard'
  | 'opportunities'
  | 'universities'
  | 'suggested-updates'
  | 'team'
  | 'settings'
  | 'audit-logs'
  | 'media-library'

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
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({
  currentView,
  onViewChange,
  roleName = 'viewer',
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose
}: AdminSidebarProps) {
  const { t, language } = useLanguage()

  const sections: SidebarSection[] = [
    {
      items: [
        { id: 'dashboard', label: t('admin.dashboard'), icon: LayoutDashboard }
      ]
    },
    {
      title: t('admin.master_units'),
      items: [
        { id: 'universities', label: t('admin.universities'), icon: School }
      ]
    },
    {
      title: t('admin.community'),
      items: [
        { id: 'suggested-updates', label: t('admin.suggested_updates'), icon: GitPullRequest }
      ]
    }
  ]

  const canAccessTeam = roleName === 'super_admin' || roleName === 'owner'
  const adminItems: SidebarItem[] = []
  if (canAccessTeam) {
    adminItems.push({ id: 'team', label: t('admin.team'), icon: Users })
    adminItems.push({ id: 'audit-logs', label: t('admin.audit_logs'), icon: History })
  }
  adminItems.push({ id: 'settings', label: t('admin.settings'), icon: Settings })

  sections.push({
    title: t('admin.administration'),
    items: adminItems
  })

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header with Top Minimize Toggle */}
      <div className={cn(
        'h-16 flex items-center border-b border-border transition-all duration-300',
        isCollapsed ? 'px-3 justify-between' : 'px-4 justify-between'
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-extrabold text-lg select-none shadow-xs shrink-0">
            20
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground leading-tight truncate">20% CMS</span>
              <span className="text-[10px] text-muted-foreground font-mono leading-none truncate">
                {language === 'ar' ? 'بوابة الماجستير 20٪' : '20% Master Portal'}
              </span>
            </div>
          )}
        </div>

        {/* Top Minimize Toggle Button for Desktop */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}

        {/* Mobile close button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg lg:hidden cursor-pointer shrink-0"
            title="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 py-4 px-2 space-y-6 overflow-y-auto overflow-x-hidden">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && !isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase select-none truncate">
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
                      onClick={() => {
                        onViewChange(item.id)
                        if (onMobileClose) onMobileClose()
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'w-full flex items-center rounded-md transition-all duration-150 cursor-pointer text-left',
                        isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-sm font-medium',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
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
    </div>
  )

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex border-r border-border bg-card flex-col h-screen select-none transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Responsive Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          {/* Slide-out Panel */}
          <aside className="relative w-72 max-w-[85vw] bg-card border-r border-border h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
