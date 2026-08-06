'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/language-context'
import {
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Crown,
  Mail,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Check,
  Search,
  UserPlus,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface RoleDisplayConfig {
  labelKey: string
  labelAr: string
  labelEn: string
  descAr: string
  descEn: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  badgeClass: string
}

const ROLE_DISPLAY_CONFIG: Record<string, RoleDisplayConfig> = {
  owner: {
    labelKey: 'owner',
    labelAr: 'المالك الرئيسي',
    labelEn: 'Owner',
    descAr: 'صلاحية كاملة وإرغامية — الوصول التام للنظام والتنظيم وتعيين الأدوار ونقل الملكية.',
    descEn: 'Can do anything — full system & team access, role assignments, and ownership transfer.',
    icon: Crown,
    color: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400',
  },
  super_admin: {
    labelKey: 'super_admin',
    labelAr: 'مشرف عام',
    labelEn: 'Super Admin',
    descAr: 'إدارة كافة المحتويات وفريق العمل بالكامل باستثناء تعديل حساب المالك الرئيسي.',
    descEn: 'Can do anything — manage all content and team access, except touching ownership.',
    icon: ShieldCheck,
    color: 'text-violet-500',
    badgeClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-400',
  },
  admin: {
    labelKey: 'admin',
    labelAr: 'مدير محتوى',
    labelEn: 'Admin',
    descAr: 'إدارة كافة المحتويات (الجامعات، العروض، والنشر). لا يملك صلاحية للتحكم في الفريق.',
    descEn: 'Manages all content (universities, listings, publishing). Cannot access Team & Access.',
    icon: Shield,
    color: 'text-primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/30',
  },
  viewer: {
    labelKey: 'viewer',
    labelAr: 'زائر / مستعرض',
    labelEn: 'Viewer',
    descAr: 'صلاحية قراءة فقط لاستعراض المحتوى وتقديم الاقتراحات والملاحظات.',
    descEn: 'Read-only access to view work of admins and leave notes / suggested updates.',
    icon: Eye,
    color: 'text-muted-foreground',
    badgeClass: 'bg-secondary text-muted-foreground border-border',
  },
}

const ROLE_ORDER = ['owner', 'super_admin', 'admin', 'viewer']

function getRoleDetails(roleName: string, lang: string) {
  const cfg = ROLE_DISPLAY_CONFIG[roleName] || {
    labelKey: roleName,
    labelAr: roleName,
    labelEn: roleName,
    descAr: '',
    descEn: '',
    icon: Shield,
    color: 'text-muted-foreground',
    badgeClass: 'bg-secondary text-muted-foreground border-border',
  }

  return {
    ...cfg,
    label: lang === 'ar' ? cfg.labelAr : cfg.labelEn,
    description: lang === 'ar' ? cfg.descAr : cfg.descEn
  }
}

function RoleBadge({ roleName }: { roleName: string }) {
  const { language } = useLanguage()
  const cfg = getRoleDetails(roleName, language)
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border', cfg.badgeClass)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

function RoleSelector({
  value,
  allRoles,
  onChange,
  disabled = false,
}: {
  value: string
  allRoles: any[]
  onChange: (roleId: string, roleName: string) => void
  disabled?: boolean
}) {
  const { language } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useState<HTMLDivElement | null>(null)

  const activeCfg = getRoleDetails(value, language)
  const ActiveIcon = activeCfg.icon

  const assignableRoles = allRoles
    .filter(r => r.name !== 'owner')
    .sort((a, b) => {
      const ia = ROLE_ORDER.indexOf(a.name)
      const ib = ROLE_ORDER.indexOf(b.name)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })

  if (disabled) {
    return <RoleBadge roleName={value} />
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer bg-card hover:bg-muted/50 border-border',
          open && 'border-primary shadow-2xs'
        )}
      >
        <span className={cn('inline-flex items-center gap-1.5', activeCfg.badgeClass, 'px-2 py-0.5 rounded-full')}>
          <ActiveIcon className="h-3 w-3" />
          {activeCfg.label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 right-0 rtl:left-0 rtl:right-auto mt-1 w-64 bg-popover border border-border rounded-xl shadow-xl py-1 text-xs">
            {assignableRoles.map(role => {
              const cfg = getRoleDetails(role.name, language)
              const Icon = cfg.icon
              const isSelected = role.name === value
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    onChange(role.id, role.name)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full text-left rtl:text-right px-3 py-2.5 flex items-start justify-between gap-2 hover:bg-muted/60 transition-colors cursor-pointer',
                    isSelected && 'bg-primary/5'
                  )}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Icon className={cn('h-3.5 w-3.5 shrink-0', cfg.color)} />
                      <span>{cfg.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{cfg.description}</p>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export function TeamTab({ currentUserEmail }: { currentUserEmail: string }) {
  const { t, language } = useLanguage()
  const supabase = createClient()

  const [members, setMembers] = useState<any[]>([])
  const [allRoles, setAllRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // Create member modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [createRoleId, setCreateRoleId] = useState('')
  const [createRoleName, setCreateRoleName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Search
  const [search, setSearch] = useState('')

  // Delete confirm
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    const [membersRes, rolesRes] = await Promise.all([
      supabase
        .from('user_roles')
        .select('*, role:roles(id, name, description)')
        .order('created_at', { ascending: false }),
      supabase.from('roles').select('*').order('created_at'),
    ])

    if (membersRes.error) {
      setError(language === 'ar' ? 'فشل تحميل أعضاء الفريق: ' + membersRes.error.message : 'Failed to load team: ' + membersRes.error.message)
    } else {
      setMembers(membersRes.data || [])
    }

    if (!rolesRes.error) {
      setAllRoles(rolesRes.data || [])
      const defaultRole = rolesRes.data?.find((r: any) => r.name === 'admin') || rolesRes.data?.[0]
      if (defaultRole) { setCreateRoleId(defaultRole.id); setCreateRoleName(defaultRole.name) }
    }

    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const resetCreateForm = () => {
    setCreateEmail('')
    setCreatePassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setCreateError(null)
  }

  const handleRoleChange = async (userUid: string, newRoleId: string, newRoleName: string) => {
    setUpdating(userUid)
    const { error } = await supabase
      .from('user_roles')
      .update({ role_id: newRoleId })
      .eq('user_id', userUid)

    if (error) {
      alert(language === 'ar' ? 'فشل تحديث الدور: ' + error.message : 'Failed to update role: ' + error.message)
    } else {
      setMembers(prev => prev.map(m =>
        m.user_id === userUid
          ? { ...m, role_id: newRoleId, role: { ...m.role, id: newRoleId, name: newRoleName } }
          : m
      ))
    }
    setUpdating(null)
  }

  const handleDelete = async () => {
    if (!memberToDelete) return
    setDeleting(memberToDelete.user_id)
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', memberToDelete.user_id)

    if (error) {
      alert(language === 'ar' ? 'فشل إزالة العضو: ' + error.message : 'Failed to remove member: ' + error.message)
    } else {
      setMembers(prev => prev.filter(m => m.user_id !== memberToDelete.user_id))
    }
    setDeleting(null)
    setMemberToDelete(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (createPassword !== confirmPassword) {
      setCreateError(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      return
    }

    setCreateLoading(true)
    setCreateError(null)

    try {
      const res = await fetch('/api/admin/create-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          roleId: createRoleId
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCreateError(data.error || (language === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account'))
        setCreateLoading(false)
        return
      }

      setIsCreateOpen(false)
      resetCreateForm()
      loadData()
    } catch (err: any) {
      setCreateError(err.message || (language === 'ar' ? 'حدث خطأ غير متوقع' : 'Unexpected error'))
    }

    setCreateLoading(false)
  }

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase()
    const roleName = m.role?.name || ''
    return !q || (m.email && m.email.toLowerCase().includes(q)) || (m.user_id && m.user_id.toLowerCase().includes(q)) || roleName.toLowerCase().includes(q)
  })

  const sortedRoles = [...allRoles].sort((a, b) => {
    const ia = ROLE_ORDER.indexOf(a.name); const ib = ROLE_ORDER.indexOf(b.name)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {language === 'ar' ? 'إدارة الفريق وصلاحيات الوصول' : 'Team & Access Control'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' ? 'إدارة حسابات المسؤولين وتعيين الأدوار والتحكم في الصلاحيات.' : 'Manage admin accounts, assign roles and control permissions.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            title={language === 'ar' ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 cursor-pointer">
            <UserPlus className="h-4 w-4" />
            {language === 'ar' ? 'إضافة عضو جديد' : 'Add Member'}
          </Button>
        </div>
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {sortedRoles.map(role => {
          const cfg = getRoleDetails(role.name, language)
          const Icon = cfg.icon
          return (
            <div key={role.id} className="bg-card border border-border rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                <span className="text-xs font-bold text-foreground">{cfg.label}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{cfg.description}</p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={language === 'ar' ? 'ابحث بالبريد الإلكتروني، المعرف، أو الدور...' : 'Search by email, user ID, or role...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 rtl:pr-9 rtl:pl-3 bg-card border-border"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Members table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 bg-muted/30 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>{language === 'ar' ? 'العضو / البريد' : 'Member'}</span>
          <span>{language === 'ar' ? 'الدور والصلاحية' : 'Role'}</span>
          <span>{language === 'ar' ? 'الإجراء' : 'Remove'}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-semibold">
              {language === 'ar' ? 'جاري تحميل الفريق...' : 'Loading team...'}
            </span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <User className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-semibold text-muted-foreground">
              {search
                ? (language === 'ar' ? 'لا يوجد أعضاء يطابقون خيارات البحث.' : 'No members match your search.')
                : (language === 'ar' ? 'لا يوجد أعضاء فريق حالياً.' : 'No team members yet.')}
            </p>
            {!search && (
              <button onClick={() => setIsCreateOpen(true)} className="text-xs text-primary font-bold hover:underline cursor-pointer">
                {language === 'ar' ? 'إضافة أول عضو ←' : 'Add the first member →'}
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredMembers.map(member => {
              const roleName = member.role?.name || 'viewer'
              const isOwner = roleName === 'owner'
              const isSelf = member.email === currentUserEmail
              const isUpdating = updating === member.user_id
              const isDeleting = deleting === member.user_id

              return (
                <div
                  key={member.user_id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
                >
                  {/* Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground truncate">
                          {member.email || '—'}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-bold">
                            {language === 'ar' ? 'أنت' : 'You'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        {member.user_id}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2">
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <RoleSelector
                        value={roleName}
                        allRoles={allRoles}
                        onChange={(newRoleId, newRoleName) => handleRoleChange(member.user_id, newRoleId, newRoleName)}
                        disabled={isSelf || isOwner}
                      />
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => setMemberToDelete(member)}
                    disabled={isSelf || isOwner || !!deleting}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title={language === 'ar' ? 'سحب الصلاحية والإزالة' : 'Remove member'}
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Create Modal ──────────────────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        if (!open) resetCreateForm()
        setIsCreateOpen(open)
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              {language === 'ar' ? 'إضافة عضو فريق جديد' : 'Add Team Member'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar'
                ? 'إنشاء حساب جديد مباشرة وتعيين الدور له. يتجاوز هذا البريد خطوة التفعيل.'
                : 'Create a new account directly and assign a role. The email will bypass verification.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="c_email">{language === 'ar' ? 'عنوان البريد الإلكتروني' : 'Email Address'}</Label>
              <div className="relative">
                <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="c_email" type="email" required
                  placeholder="member@example.com"
                  value={createEmail}
                  onChange={e => setCreateEmail(e.target.value)}
                  className="pl-9 rtl:pr-9 rtl:pl-3 bg-card border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c_password">{language === 'ar' ? 'كلمة المرور المؤقتة' : 'Temporary Password'}</Label>
              <div className="relative">
                <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="c_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder={language === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters'}
                  value={createPassword}
                  onChange={e => setCreatePassword(e.target.value)}
                  className="pl-9 pr-10 rtl:pr-9 rtl:pl-10 bg-card border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                  title={showPassword ? (language === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (language === 'ar' ? 'إظهار كلمة المرور' : 'Show password')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {language === 'ar' ? 'يمكن للمستخدم تغيير كلمة المرور بعد أول تسجيل دخول.' : 'The user can change this after logging in.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c_confirm_password">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
              <div className="relative">
                <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="c_confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder={language === 'ar' ? 'أعد كتابة كلمة المرور' : 'Re-enter temporary password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="pl-9 pr-10 rtl:pr-9 rtl:pl-10 bg-card border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                  title={showConfirmPassword ? (language === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (language === 'ar' ? 'إظهار كلمة المرور' : 'Show password')}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role grid */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'دور الصلاحية' : 'Access Role'}</Label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
                {sortedRoles.filter(r => r.name !== 'owner').map(role => {
                  const cfg = getRoleDetails(role.name, language)
                  const Icon = cfg.icon
                  const isSelected = createRoleId === role.id
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => { setCreateRoleId(role.id); setCreateRoleName(role.name) }}
                      className={cn(
                        'flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left rtl:text-right transition-all cursor-pointer',
                        isSelected ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:bg-muted/40'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                          <span className={cn('text-xs font-bold', isSelected ? 'text-primary' : 'text-foreground')}>{cfg.label}</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{cfg.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {createError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {createError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1 border-t border-border/60">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={createLoading || !createRoleId} className="gap-2">
                {createLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> {language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}</>
                  : <><UserPlus className="h-4 w-4" /> {language === 'ar' ? 'إنشاء الحساب' : 'Create Account'}</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ────────────────────────────────────────────── */}
      <Dialog open={!!memberToDelete} onOpenChange={open => !open && setMemberToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              {language === 'ar' ? 'سحب وإلغاء صلاحية العضو' : 'Remove Member'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar'
                ? `سيتم سحب كافة الصلاحيات الإدارية فوراً من العضو ${memberToDelete?.email || memberToDelete?.user_id}.`
                : `This will revoke ${memberToDelete?.email || memberToDelete?.user_id}'s access immediately.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setMemberToDelete(null)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              disabled={!!deleting}
              onClick={handleDelete}
              className="gap-2"
            >
              {deleting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> {language === 'ar' ? 'جاري الإزالة...' : 'Removing...'}</>
                : <><Trash2 className="h-4 w-4" /> {language === 'ar' ? 'سحب الصلاحية' : 'Remove Access'}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
