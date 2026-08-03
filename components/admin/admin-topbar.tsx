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
import { useLanguage } from '@/components/language-context'

interface AdminTopbarProps {
  currentView: AdminView
  onViewChange: (view: AdminView) => void
  onLogout: () => void
  userEmail: string
  roleName?: string
  onOpenCommandPalette: () => void
  onOpenWizard: () => void
  onToggleMobileMenu?: () => void
}

export function AdminTopbar({
  currentView,
  onViewChange,
  onLogout,
  userEmail,
  roleName = 'viewer',
  onOpenCommandPalette,
  onOpenWizard,
  onToggleMobileMenu
}: AdminTopbarProps) {
  const { t, language } = useLanguage()
  const isViewer = roleName === 'viewer'
  const [profileOpen, setProfileOpen] = useState(false)
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false)

  const getBreadcrumbs = (view: AdminView): string[] => {
    if (language === 'ar') {
      switch (view) {
        case 'dashboard':
          return ['لوحة التحكم']
        case 'opportunities':
          return ['المحتوى', 'عروض الماجستير']
        case 'universities':
          return ['الشؤون الأكاديمية', 'الجامعات والكليات']
        case 'suggested-updates':
          return ['الإشراف', 'الاقتراحات والتصحيحات']
        case 'team':
          return ['الإدارة', 'الفريق والصلاحيات']
        case 'settings':
          return ['النظام', 'الإعدادات']
        default:
          return ['لوحة التحكم']
      }
    }

    switch (view) {
      case 'dashboard':
        return ['Dashboard']
      case 'opportunities':
        return ['Content', 'Opportunities']
      case 'universities':
        return ['Academic', 'Universities']
      case 'suggested-updates':
        return ['Moderation', 'Suggested Updates']
      case 'team':
        return ['Administration', 'Team & Access']
      case 'settings':
        return ['System', 'Settings']
      default:
        return ['CMS']
    }
  }

  const breadcrumbs = getBreadcrumbs(currentView)

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 select-none">
      {/* Left section: Breadcrumbs & Mobile Hamburger Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg lg:hidden cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5 shrink-0" />
        </button>
        
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground font-medium truncate">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 rtl:rotate-180" />}
              <span className={idx === breadcrumbs.length - 1 ? 'text-foreground font-semibold truncate' : 'truncate'}>
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right section: Search bar input, quick actions, profile dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Search button that triggers Command Palette */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted hover:bg-muted/80 border border-border rounded-md transition-colors cursor-pointer w-28 sm:w-44 text-left truncate"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{t('admin.search')}</span>
          <kbd className="ml-auto pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-card px-1.5 font-mono text-[9px] font-medium opacity-100">
            <span className="text-[10px]">Ctrl</span>K
          </kbd>
        </button>

        {/* Quick create dropdown button (Hidden for viewer) */}
        {!isViewer && (
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
              className="flex items-center gap-1.5 cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{t('admin.create')}</span>
            </Button>

            {createDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCreateDropdownOpen(false)}
                />
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-1.5 w-52 bg-popover text-popover-foreground border border-border rounded-md shadow-lg py-1 z-50 text-sm">
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false)
                      onOpenWizard()
                    }}
                    className="w-full text-left rtl:text-right px-4 py-2 hover:bg-muted font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span>{t('admin.create_opportunity')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false)
                      onViewChange('universities')
                    }}
                    className="w-full text-left rtl:text-right px-4 py-2 hover:bg-muted cursor-pointer"
                  >
                    <span>{t('admin.universities')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Notification Bell */}
        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all cursor-pointer relative">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

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
              <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-64 bg-popover text-popover-foreground border border-border rounded-md shadow-lg py-2.5 z-50 text-sm">
                <div className="px-4 py-1.5 border-b border-border mb-1.5 text-left rtl:text-right">
                  <p className="font-semibold text-foreground truncate">{userEmail}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {language === 'ar' ? (
                      roleName === 'owner' ? 'المالك الرئيسي' :
                      roleName === 'super_admin' ? 'مشرف عام' :
                      roleName === 'admin' ? 'مدير محتوى' :
                      roleName === 'viewer' ? 'زائر / مستعرض' : roleName
                    ) : (
                      roleName.replace('_', ' ')
                    )}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    onViewChange('settings')
                  }}
                  className="w-full text-left rtl:text-right px-4 py-2 hover:bg-muted flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span>{t('admin.my_settings')}</span>
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    onLogout()
                  }}
                  className="w-full text-left rtl:text-right px-4 py-2 text-destructive hover:bg-destructive/5 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>{t('admin.sign_out')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
