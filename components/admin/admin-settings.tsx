'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/language-context'
import { useTheme } from '@/components/theme-context'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FilterTooltip } from '@/components/ui/filter-tooltip'
import { cn } from '@/lib/utils'

import {
  Sun,
  Moon,
  Laptop,
  Globe,
  KeyRound,
  ShieldCheck,
  GraduationCap,
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  User as UserIcon,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Tag,
  Filter,
  Eye,
  EyeOff,
  Settings2
} from 'lucide-react'

export interface DomainItem {
  id: string
  name_fr: string
  name_ar?: string | null
  slug: string
  workflow_status: 'draft' | 'review' | 'published' | 'archived'
  created_at?: string
}

export interface CustomFilterItem {
  id: string
  name_fr: string
  name_ar?: string | null
  category: 'level' | 'unit_type' | 'status' | 'domain_tag' | 'custom'
  value: string
  is_active: boolean
  display_order: number
  created_at?: string
}

export function AdminSettingsTab({ user, roleName }: { user: User; roleName?: string }) {
  const supabase = createClient()
  const { language, setLanguage, t } = useLanguage()
  const { theme: themeMode, setTheme: handleThemeChange } = useTheme()

  // Active Tab inside Settings ('general' | 'domains' | 'filters')
  const [activeTab, setActiveTab] = useState<'general' | 'domains' | 'filters'>('general')

  // Reset Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile Settings State
  const [name, setName] = useState('')
  const [initialName, setInitialName] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Domains State
  const [domains, setDomains] = useState<DomainItem[]>([])
  const [domainsLoading, setDomainsLoading] = useState(true)
  const [domainSearch, setDomainSearch] = useState('')
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<DomainItem | null>(null)
  const [domainForm, setDomainForm] = useState({
    name_fr: '',
    name_ar: '',
    slug: '',
    workflow_status: 'published' as 'draft' | 'review' | 'published' | 'archived'
  })
  const [domainSubmitting, setDomainSubmitting] = useState(false)
  const [domainAlert, setDomainAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Custom Filters State
  const [filters, setFilters] = useState<CustomFilterItem[]>([])
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [filterSearch, setFilterSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [editingFilter, setEditingFilter] = useState<CustomFilterItem | null>(null)
  const [filterForm, setFilterForm] = useState({
    name_fr: '',
    name_ar: '',
    category: 'custom' as 'level' | 'unit_type' | 'status' | 'domain_tag' | 'custom',
    value: '',
    is_active: true,
    display_order: 1
  })
  const [filterSubmitting, setFilterSubmitting] = useState(false)
  const [filterAlert, setFilterAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 2. Fetch Domains
  const fetchDomains = async () => {
    setDomainsLoading(true)
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching domains:', error)
    } else {
      setDomains(data || [])
    }
    setDomainsLoading(false)
  }

  // 3. Fetch Custom Filters
  const fetchFilters = async () => {
    setFiltersLoading(true)
    const { data, error } = await supabase
      .from('custom_filters')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching filters:', error)
    } else {
      setFilters(data || [])
    }
    setFiltersLoading(false)
  }

  const fetchUserProfile = async () => {
    if (!user?.id) return
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('name')
        .eq('user_id', user.id)
        .single()
      if (!error && data) {
        setName(data.name || '')
        setInitialName(data.name || '')
      }
    } catch (err) {
      console.error('Error fetching user profile name:', err)
    }
  }

  useEffect(() => {
    fetchDomains()
    fetchFilters()
    fetchUserProfile()
  }, [user])

  // 4. Reset Password Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (!currentPassword) {
      setPasswordMsg({
        type: 'error',
        text: language === 'ar' ? 'يرجى إدخال كلمة المرور الحالية.' : 'Please enter your current password.'
      })
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({
        type: 'error',
        text: language === 'ar' ? 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.' : 'New password must be at least 6 characters long.'
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        type: 'error',
        text: language === 'ar' ? 'كلمات المرور الجديدة غير متطابقة. أعد المحاولة.' : 'Passwords do not match. Please re-type.'
      })
      return
    }

    setPasswordLoading(true)
    try {
      // 1. Verify current password
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        })
        if (signInError) {
          setPasswordMsg({
            type: 'error',
            text: language === 'ar' ? 'كلمة المرور الحالية غير صحيحة.' : 'Current password is incorrect.'
          })
          setPasswordLoading(false)
          return
        }
      }

      // 2. Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setPasswordMsg({ type: 'error', text: error.message })
      } else {
        setPasswordMsg({
          type: 'success',
          text: language === 'ar' ? 'تم تحديث كلمة المرور بنجاح!' : 'Your password has been updated successfully!'
        })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      setPasswordMsg({
        type: 'error',
        text: err.message || (language === 'ar' ? 'حدث خطأ أثناء التحديث.' : 'An error occurred.')
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameMsg(null)
    if (!user?.id) return
    if (name.trim() === initialName) {
      setNameMsg({
        type: 'success',
        text: language === 'ar' ? 'تم حفظ التغييرات!' : 'No changes to save.'
      })
      return
    }

    setNameLoading(true)
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ name: name.trim() })
        .eq('user_id', user.id)

      if (error) throw error

      setInitialName(name.trim())
      setNameMsg({
        type: 'success',
        text: language === 'ar' ? 'تم تحديث الاسم بنجاح!' : 'Profile name updated successfully!'
      })
    } catch (err: any) {
      setNameMsg({
        type: 'error',
        text: err.message || (language === 'ar' ? 'فشل تحديث الاسم.' : 'Failed to update name.')
      })
    } finally {
      setNameLoading(false)
    }
  }

  // 5. Domain CRUD Handlers
  const handleOpenDomainModal = (domain?: DomainItem) => {
    if (domain) {
      setEditingDomain(domain)
      setDomainForm({
        name_fr: domain.name_fr,
        name_ar: domain.name_ar || '',
        slug: domain.slug || '',
        workflow_status: domain.workflow_status
      })
    } else {
      setEditingDomain(null)
      setDomainForm({
        name_fr: '',
        name_ar: '',
        slug: '',
        workflow_status: 'published'
      })
    }
    setIsDomainModalOpen(true)
  }

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    setDomainSubmitting(true)
    setDomainAlert(null)

    const generatedSlug = domainForm.slug.trim()
      ? domainForm.slug.trim().toLowerCase().replace(/\s+/g, '-')
      : domainForm.name_fr.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    try {
      if (editingDomain) {
        // Update existing domain
        const { error } = await supabase
          .from('domains')
          .update({
            name_fr: domainForm.name_fr.trim(),
            name_ar: domainForm.name_ar.trim() || null,
            slug: generatedSlug,
            workflow_status: domainForm.workflow_status,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDomain.id)

        if (error) throw error
        setDomainAlert({ type: 'success', text: 'Domain updated successfully!' })
      } else {
        // Create new domain
        const { error } = await supabase
          .from('domains')
          .insert({
            name_fr: domainForm.name_fr.trim(),
            name_ar: domainForm.name_ar.trim() || null,
            slug: generatedSlug,
            workflow_status: domainForm.workflow_status
          })

        if (error) throw error
        setDomainAlert({ type: 'success', text: 'Domain created successfully!' })
      }

      setIsDomainModalOpen(false)
      fetchDomains()
    } catch (err: any) {
      setDomainAlert({ type: 'error', text: err.message || 'Failed to save domain.' })
    } finally {
      setDomainSubmitting(false)
    }
  }

  const handleDeleteDomain = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete domain "${name}"?`)) return

    try {
      const { error } = await supabase.from('domains').delete().eq('id', id)
      if (error) throw error
      setDomainAlert({ type: 'success', text: `Domain "${name}" deleted.` })
      fetchDomains()
    } catch (err: any) {
      setDomainAlert({ type: 'error', text: err.message || 'Failed to delete domain.' })
    }
  }

  // 6. Custom Filter CRUD Handlers
  const handleOpenFilterModal = (filterItem?: CustomFilterItem) => {
    if (filterItem) {
      setEditingFilter(filterItem)
      setFilterForm({
        name_fr: filterItem.name_fr,
        name_ar: filterItem.name_ar || '',
        category: filterItem.category,
        value: filterItem.value,
        is_active: filterItem.is_active,
        display_order: filterItem.display_order || 1
      })
    } else {
      setEditingFilter(null)
      setFilterForm({
        name_fr: '',
        name_ar: '',
        category: (selectedCategory !== 'all' ? selectedCategory : 'custom') as any,
        value: '',
        is_active: true,
        display_order: filters.length + 1
      })
    }
    setIsFilterModalOpen(true)
  }

  const handleSaveFilter = async (e: React.FormEvent) => {
    e.preventDefault()
    setFilterSubmitting(true)
    setFilterAlert(null)

    const filterVal = filterForm.value.trim()
      ? filterForm.value.trim()
      : filterForm.name_fr.trim().toLowerCase().replace(/\s+/g, '_')

    try {
      if (editingFilter) {
        const { error } = await supabase
          .from('custom_filters')
          .update({
            name_fr: filterForm.name_fr.trim(),
            name_ar: filterForm.name_ar.trim() || null,
            category: filterForm.category,
            value: filterVal,
            is_active: filterForm.is_active,
            display_order: Number(filterForm.display_order),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingFilter.id)

        if (error) throw error
        setFilterAlert({ type: 'success', text: 'Filter updated successfully!' })
      } else {
        const { error } = await supabase
          .from('custom_filters')
          .insert({
            name_fr: filterForm.name_fr.trim(),
            name_ar: filterForm.name_ar.trim() || null,
            category: filterForm.category,
            value: filterVal,
            is_active: filterForm.is_active,
            display_order: Number(filterForm.display_order)
          })

        if (error) throw error
        setFilterAlert({ type: 'success', text: 'Filter created successfully!' })
      }

      setIsFilterModalOpen(false)
      fetchFilters()
    } catch (err: any) {
      setFilterAlert({ type: 'error', text: err.message || 'Failed to save filter.' })
    } finally {
      setFilterSubmitting(false)
    }
  }

  const handleToggleFilterActive = async (filterItem: CustomFilterItem) => {
    try {
      const { error } = await supabase
        .from('custom_filters')
        .update({ is_active: !filterItem.is_active })
        .eq('id', filterItem.id)

      if (error) throw error
      fetchFilters()
    } catch (err: any) {
      setFilterAlert({ type: 'error', text: err.message || 'Failed to update filter status.' })
    }
  }

  const handleDeleteFilter = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete filter "${name}"?`)) return

    try {
      const { error } = await supabase.from('custom_filters').delete().eq('id', id)
      if (error) throw error
      setFilterAlert({ type: 'success', text: `Filter "${name}" deleted.` })
      fetchFilters()
    } catch (err: any) {
      setFilterAlert({ type: 'error', text: err.message || 'Failed to delete filter.' })
    }
  }

  // Filtered domains list
  const filteredDomains = domains.filter(d =>
    d.name_fr.toLowerCase().includes(domainSearch.toLowerCase()) ||
    (d.name_ar && d.name_ar.toLowerCase().includes(domainSearch.toLowerCase())) ||
    d.slug.toLowerCase().includes(domainSearch.toLowerCase())
  )

  // Filtered custom filters list
  const filteredCustomFilters = filters.filter(f => {
    const matchesSearch =
      f.name_fr.toLowerCase().includes(filterSearch.toLowerCase()) ||
      (f.name_ar && f.name_ar.toLowerCase().includes(filterSearch.toLowerCase())) ||
      f.value.toLowerCase().includes(filterSearch.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Settings2 className="h-6 w-6 text-primary" />
            {t('settings.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Global tab navigation */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border shrink-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'general'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            {t('settings.tab_general')}
          </button>
          <button
            onClick={() => setActiveTab('domains')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'domains'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            {t('settings.tab_domains')} ({domains.length})
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'filters'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t('settings.tab_filters')} ({filters.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GENERAL & SECURITY (Theme, Language, Reset Password)               */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Account Profile Settings */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserIcon className="h-4.5 w-4.5 text-primary" />
                {language === 'ar' ? 'الملف الشخصي' : 'Account Profile'}
              </CardTitle>
              <CardDescription className="text-xs">
                {language === 'ar' ? 'إدارة الاسم الشخصي المعروض وحسابك البريدي.' : 'Manage your public display name and contact details.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {nameMsg && (
                  <div className={cn(
                    "p-3 rounded-lg text-xs flex items-center gap-2 border",
                    nameMsg.type === 'success' 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  )}>
                    {nameMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    <span>{nameMsg.text}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="profile-email">{language === 'ar' ? 'البريد الإلكتروني (حسابك)' : 'Email Address'}</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted text-muted-foreground border-border text-xs cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-name">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</Label>
                  <Input
                    id="profile-name"
                    type="text"
                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-card border-border text-xs"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={nameLoading}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 cursor-pointer text-xs"
                >
                  {nameLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      {language === 'ar' ? 'جاري الحفظ...' : 'Saving Changes...'}
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Card 1: Appearance & Theme */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sun className="h-4.5 w-4.5 text-amber-500" />
                {language === 'ar' ? 'المظهر والمظهر البصري' : t('settings.theme_title')}
              </CardTitle>
              <CardDescription className="text-xs">
                {language === 'ar' ? 'اختر مظهر الوضع الداكن أو الفاتح حسب تفضيلك.' : t('settings.theme_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {/* Light Mode */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    themeMode === 'light'
                      ? 'border-primary bg-primary/5 text-primary font-semibold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <Sun className="h-6 w-6 mb-2 text-amber-500" />
                  <span className="text-xs">{language === 'ar' ? 'الوضع الفاتح' : 'Light Mode'}</span>
                  {themeMode === 'light' && <Badge variant="secondary" className="mt-2 text-[10px] px-1.5 py-0 bg-primary/10 text-primary">{language === 'ar' ? 'مفعّل' : 'Active'}</Badge>}
                </button>

                {/* Dark Mode */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'border-primary bg-primary/5 text-primary font-semibold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <Moon className="h-6 w-6 mb-2 text-indigo-400" />
                  <span className="text-xs">{language === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}</span>
                  {themeMode === 'dark' && <Badge variant="secondary" className="mt-2 text-[10px] px-1.5 py-0 bg-primary/10 text-primary">{language === 'ar' ? 'مفعّل' : 'Active'}</Badge>}
                </button>

                {/* System Default */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    themeMode === 'system'
                      ? 'border-primary bg-primary/5 text-primary font-semibold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <Laptop className="h-6 w-6 mb-2 text-emerald-500" />
                  <span className="text-xs">{language === 'ar' ? 'تلقائي (النظام)' : 'System'}</span>
                  {themeMode === 'system' && <Badge variant="secondary" className="mt-2 text-[10px] px-1.5 py-0 bg-primary/10 text-primary">{language === 'ar' ? 'مفعّل' : 'Active'}</Badge>}
                </button>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'يتم حفظ تفضيلات المظهر محلياً ومزامنتها تلقائياً عبر جميع الجلسات.'
                    : 'Theme preference is saved locally and synced automatically across sessions.'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Platform Language */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-blue-500" />
                {language === 'ar' ? 'إعدادات اللغة' : 'Language Settings'}
              </CardTitle>
              <CardDescription className="text-xs">
                {language === 'ar' ? 'اختر لغة العرض المفضلة للمنصة وللوحة التحكم.' : 'Select your preferred portal and admin display language.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* English */}
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    language === 'en'
                      ? 'border-primary bg-primary/5 text-primary font-semibold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🇬🇧</span>
                    <div className="text-left rtl:text-right">
                      <p className="text-sm font-semibold">English</p>
                      <p className="text-[11px] text-muted-foreground">English (LTR)</p>
                    </div>
                  </div>
                  {language === 'en' && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                </button>

                {/* Arabic */}
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    language === 'ar'
                      ? 'border-primary bg-primary/5 text-primary font-semibold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🇩🇿</span>
                    <div className="text-left rtl:text-right">
                      <p className="text-sm font-semibold font-sans">العربية</p>
                      <p className="text-[11px] text-muted-foreground">
                        {language === 'ar' ? 'العربية (من اليمين لليسار)' : 'Arabic (RTL)'}
                      </p>
                    </div>
                  </div>
                  {language === 'ar' && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                </button>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                {language === 'ar' ? 'اللغة النشطة حالياً:' : 'Current active language:'}{' '}
                <span className="font-semibold text-foreground uppercase">{language}</span> ({language === 'ar' ? 'من اليمين لليسار RTL' : 'Right-to-Left RTL'}).
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Security & Reset Password */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <KeyRound className="h-4.5 w-4.5 text-emerald-500" />
                {language === 'ar' ? 'الأمان وإعادة تعيين كلمة المرور' : 'Security & Password Reset'}
              </CardTitle>
              <CardDescription className="text-xs">
                {language === 'ar' ? 'تحديث بيانات الاعتماد لحسابك الحالي.' : 'Update your admin account credentials.'}{' '}
                {language === 'ar' ? 'تم تسجيل الدخول بـ:' : 'Logged in as:'} <span className="font-medium text-foreground">{user.email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4 max-w-xl">
                {passwordMsg && (
                  <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    passwordMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}>
                    {passwordMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                {/* 1. Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="current-password">{language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder={language === 'ar' ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pr-10 rtl:pl-10 rtl:pr-3"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. New Password */}
                <div className="space-y-2">
                  <Label htmlFor="new-password">{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder={language === 'ar' ? '6 أحرف على الأقل' : 'Minimum 6 characters'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10 rtl:pl-10 rtl:pr-3"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. Confirm New Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={language === 'ar' ? 'أعد كتابة كلمة المرور الجديدة' : 'Re-enter new password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10 rtl:pl-10 rtl:pr-3"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 cursor-pointer"
                  >
                    {passwordLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                        {language === 'ar' ? 'جاري التحديث...' : 'Updating Password...'}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DOMAINES D'ETUDES CONFIGURATION                                    */}
      {/* ========================================================================= */}
      {activeTab === 'domains' && (
        <div className="space-y-5">
          {domainAlert && (
            <div className={`p-3 rounded-lg text-xs flex items-center justify-between gap-2 ${
              domainAlert.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}>
              <div className="flex items-center gap-2">
                {domainAlert.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{domainAlert.text}</span>
              </div>
              <button onClick={() => setDomainAlert(null)} className="p-1 hover:opacity-75 cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Action bar: Search + Add Domain Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search domains by name or slug..."
                value={domainSearch}
                onChange={(e) => setDomainSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDomains}
                disabled={domainsLoading}
                className="cursor-pointer text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${domainsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => handleOpenDomainModal()}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold cursor-pointer text-xs"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Study Domain
              </Button>
            </div>
          </div>

          {/* Domains Grid / Table */}
          {domainsLoading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-medium">Loading study domains...</span>
            </div>
          ) : filteredDomains.length === 0 ? (
            <Card className="border border-border p-8 text-center">
              <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
              <h3 className="text-sm font-semibold text-foreground">No Study Domains Found</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                {domainSearch ? 'No domains match your search query.' : 'Create your first study domain (Domaine d\'études) to categorize master programs.'}
              </p>
              <Button size="sm" onClick={() => handleOpenDomainModal()} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-1.5" /> Add Domain
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDomains.map((dom) => (
                <Card key={dom.id} className="border border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <FilterTooltip content={dom.name_fr} subContent={dom.name_ar} category="Domaine d'études" value={dom.slug}>
                          <CardTitle className="text-base font-bold text-foreground truncate cursor-help" title={dom.name_fr}>
                            {dom.name_fr}
                          </CardTitle>
                        </FilterTooltip>
                        {dom.name_ar && (
                          <p className="text-xs text-muted-foreground font-sans font-medium truncate" dir="rtl">
                            {dom.name_ar}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={dom.workflow_status === 'published' ? 'default' : 'secondary'}
                        className={`text-[10px] capitalize shrink-0 ${
                          dom.workflow_status === 'published' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : ''
                        }`}
                      >
                        {dom.workflow_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="text-[11px] text-muted-foreground font-mono bg-muted/50 p-2 rounded-md truncate">
                      Slug: <span className="text-foreground">{dom.slug}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDomainModal(dom)}
                        className="h-8 text-xs cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDomain(dom.id, dom.name_fr)}
                        className="h-8 text-xs cursor-pointer hover:bg-destructive/10 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CUSTOM FILTERS MANAGEMENT SYSTEM                                   */}
      {/* ========================================================================= */}
      {activeTab === 'filters' && (
        <div className="space-y-5">
          {filterAlert && (
            <div className={`p-3 rounded-lg text-xs flex items-center justify-between gap-2 ${
              filterAlert.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}>
              <div className="flex items-center gap-2">
                {filterAlert.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{filterAlert.text}</span>
              </div>
              <button onClick={() => setFilterAlert(null)} className="p-1 hover:opacity-75 cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Filters category selector + Search bar */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'level', label: 'Master Level' },
                { id: 'unit_type', label: 'Unit Type' },
                { id: 'status', label: 'Status' },
                { id: 'domain_tag', label: 'Domain Tags' },
                { id: 'custom', label: 'Custom' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <div className="relative w-full lg:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter name or value..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFilters}
                disabled={filtersLoading}
                className="cursor-pointer text-xs h-8"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${filtersLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                onClick={() => handleOpenFilterModal()}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold cursor-pointer text-xs h-8 shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Filter
              </Button>
            </div>
          </div>

          {/* Filters List */}
          {filtersLoading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-medium">Loading filters configuration...</span>
            </div>
          ) : filteredCustomFilters.length === 0 ? (
            <Card className="border border-border p-8 text-center">
              <Filter className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
              <h3 className="text-sm font-semibold text-foreground">No Filters Found</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                {filterSearch || selectedCategory !== 'all' ? 'No custom filters match your active query/category.' : 'Configure custom filters to refine listings across the platform.'}
              </p>
              <Button size="sm" onClick={() => handleOpenFilterModal()} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-1.5" /> Add Filter
              </Button>
            </Card>
          ) : (
            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Filter Name (FR / AR)</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Value / Code</th>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCustomFilters.map((flt) => (
                      <tr key={flt.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">
                          <FilterTooltip content={flt.name_fr} subContent={flt.name_ar} category={flt.category} value={flt.value}>
                            <div className="flex flex-col cursor-help">
                              <span className="hover:text-primary transition-colors">{flt.name_fr}</span>
                              {flt.name_ar && <span className="text-[11px] text-muted-foreground font-sans font-normal" dir="rtl">{flt.name_ar}</span>}
                            </div>
                          </FilterTooltip>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize text-[10px] font-mono">
                            {flt.category.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {flt.value}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {flt.display_order}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleFilterActive(flt)}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                              flt.is_active
                                ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${flt.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                            {flt.is_active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenFilterModal(flt)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Edit Filter"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFilter(flt.id, flt.name_fr)}
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Delete Filter"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DOMAIN                                                  */}
      {/* ========================================================================= */}
      {isDomainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {editingDomain ? 'Edit Study Domain' : 'Create New Study Domain'}
              </h2>
              <button onClick={() => setIsDomainModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDomain} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="domain-name-fr">French Name (name_fr)</Label>
                <Input
                  id="domain-name-fr"
                  placeholder="e.g. Sciences et Technologies"
                  value={domainForm.name_fr}
                  onChange={(e) => setDomainForm({ ...domainForm, name_fr: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="domain-name-ar">Arabic Name (name_ar)</Label>
                <Input
                  id="domain-name-ar"
                  placeholder="e.g. علوم وتكنولوجيا"
                  value={domainForm.name_ar}
                  onChange={(e) => setDomainForm({ ...domainForm, name_ar: e.target.value })}
                  dir="rtl"
                  className="font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="domain-slug">Slug Identifier</Label>
                <Input
                  id="domain-slug"
                  placeholder="e.g. sciences-technologies (auto-generated if left empty)"
                  value={domainForm.slug}
                  onChange={(e) => setDomainForm({ ...domainForm, slug: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="domain-status">Workflow Status</Label>
                <select
                  id="domain-status"
                  value={domainForm.workflow_status}
                  onChange={(e) => setDomainForm({ ...domainForm, workflow_status: e.target.value as any })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDomainModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={domainSubmitting} className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold cursor-pointer">
                  {domainSubmitting ? 'Saving...' : editingDomain ? 'Save Changes' : 'Create Domain'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT FILTER                                                  */}
      {/* ========================================================================= */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {editingFilter ? 'Edit Filter' : 'Create New Filter'}
              </h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFilter} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="filter-name-fr">Filter Name (FR)</Label>
                  <Input
                    id="filter-name-fr"
                    placeholder="e.g. Master 1 (M1)"
                    value={filterForm.name_fr}
                    onChange={(e) => setFilterForm({ ...filterForm, name_fr: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="filter-name-ar">Filter Name (AR)</Label>
                  <Input
                    id="filter-name-ar"
                    placeholder="e.g. ماستر 1"
                    value={filterForm.name_ar}
                    onChange={(e) => setFilterForm({ ...filterForm, name_ar: e.target.value })}
                    dir="rtl"
                    className="font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="filter-category">Category</Label>
                  <select
                    id="filter-category"
                    value={filterForm.category}
                    onChange={(e) => setFilterForm({ ...filterForm, category: e.target.value as any })}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="level">Master Level</option>
                    <option value="unit_type">Unit Type</option>
                    <option value="status">Status</option>
                    <option value="domain_tag">Domain Tag</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="filter-value">Filter Value / Code</Label>
                  <Input
                    id="filter-value"
                    placeholder="e.g. M1 or faculty"
                    value={filterForm.value}
                    onChange={(e) => setFilterForm({ ...filterForm, value: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1.5">
                  <Label htmlFor="filter-order">Display Order</Label>
                  <Input
                    id="filter-order"
                    type="number"
                    min="1"
                    value={filterForm.display_order}
                    onChange={(e) => setFilterForm({ ...filterForm, display_order: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="filter-active"
                    type="checkbox"
                    checked={filterForm.is_active}
                    onChange={(e) => setFilterForm({ ...filterForm, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="filter-active" className="cursor-pointer text-xs font-semibold">
                    Filter Active
                  </Label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsFilterModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={filterSubmitting} className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold cursor-pointer">
                  {filterSubmitting ? 'Saving...' : editingFilter ? 'Save Filter' : 'Create Filter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
