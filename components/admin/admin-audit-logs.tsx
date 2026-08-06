'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/language-context'
import {
  History,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  Calendar,
  User,
  ArrowRight,
  Database,
  FileJson,
  X,
  Trash2,
  RotateCcw
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

interface AuditLog {
  id: string
  user_id: string | null
  action: 'insert' | 'update' | 'soft_delete' | 'restore'
  table_name: string
  record_id: string
  old_data: Record<string, any> | null
  new_data: Record<string, any> | null
  timestamp: string
  deleted_at?: string | null
}

export function AuditLogsTab({ roleName }: { roleName: string }) {
  const { language } = useLanguage()
  const supabase = createClient()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // User profiles map (user_id -> { email, name })
  const [userProfiles, setUserProfiles] = useState<Record<string, { email: string; name: string }>>({})

  // Filters state
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [tableFilter, setTableFilter] = useState<string>('all')

  // Selected log for detailed view modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // View mode: 'active' (active logs) or 'trash' (recycle bin)
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active')
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // 0. Auto-purge soft-deleted logs older than 3 days
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      await supabase
        .from('audit_logs')
        .delete()
        .not('deleted_at', 'is', null)
        .lt('deleted_at', threeDaysAgo.toISOString())

      // 1. Fetch audit logs based on viewMode
      let query = supabase.from('audit_logs').select('*')
      if (viewMode === 'active') {
        query = query.is('deleted_at', null)
      } else {
        query = query.not('deleted_at', 'is', null)
      }
      
      const { data: logsData, error: logsError } = await query.order('timestamp', { ascending: false })

      if (logsError) throw logsError

      // 2. Fetch user roles for email mapping
      const { data: usersData, error: usersError } = await supabase
        .from('user_roles')
        .select('user_id, email, name')

      if (usersError) {
        console.warn('Failed to load user profiles for audit mapping:', usersError.message)
      } else {
        const profileMap: Record<string, { email: string; name: string }> = {}
        usersData?.forEach((u: any) => {
          if (u.user_id) {
            profileMap[u.user_id] = {
              email: u.email || '',
              name: u.name || ''
            }
          }
        })
        setUserProfiles(profileMap)
      }

      setLogs((logsData as AuditLog[]) || [])
    } catch (err: any) {
      setError(language === 'ar' ? 'فشل تحميل سجل العمليات: ' + err.message : 'Failed to load audit logs: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (roleName === 'super_admin' || roleName === 'owner') {
      loadData()
    }
  }, [roleName, viewMode])

  const handleCleanLogs = async () => {
    if (!confirm(language === 'ar' 
      ? 'هل أنت متأكد من نقل جميع السجلات الحالية إلى سلة المحذوفات؟ سيتم حذفها نهائياً بعد 3 أيام.' 
      : 'Are you sure you want to move all current logs to the Recycle Bin? They will be permanently deleted after 3 days.')) return

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('audit_logs')
        .update({ deleted_at: new Date().toISOString() })
        .is('deleted_at', null)

      if (error) throw error
      loadData()
    } catch (err: any) {
      alert(language === 'ar' ? 'فشل تنظيف السجلات: ' + err.message : 'Failed to clean logs: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSoftDeleteLog = async (id: string) => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('audit_logs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRestoreLog = async (id: string) => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('audit_logs')
        .update({ deleted_at: null })
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRestoreAllLogs = async () => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('audit_logs')
        .update({ deleted_at: null })
        .not('deleted_at', 'is', null)

      if (error) throw error
      loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteForeverLog = async (id: string) => {
    if (!confirm(language === 'ar' 
      ? 'هل أنت متأكد من حذف هذا السجل نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' 
      : 'Are you sure you want to delete this log permanently? This action cannot be undone.')) return

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteAllForeverLogs = async () => {
    if (!confirm(language === 'ar' 
      ? 'تحذير: سيتم حذف جميع السجلات الموجودة في سلة المحذوفات نهائياً. لا يمكن التراجع عن هذا الإجراء!' 
      : 'WARNING: This will permanently delete all logs in the recycle bin. This action cannot be undone! Proceed?')) return

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .not('deleted_at', 'is', null)

      if (error) throw error
      loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Deny access if user is not super_admin or owner
  if (roleName !== 'super_admin' && roleName !== 'owner') {
    return (
      <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-xl max-w-xl mx-auto space-y-3 mt-12">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-lg font-bold text-destructive">
          {language === 'ar' ? 'غير مصرح بالدخول' : 'Access Denied'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'ar' 
            ? 'هذه الصفحة مخصصة للمشرف العام والمالك فقط.' 
            : 'This page is only accessible by Super Admins and Owners.'}
        </p>
      </div>
    )
  }

  // Filter logs based on search and selected filters
  const filteredLogs = logs.filter(log => {
    // 1. Action filter
    if (actionFilter !== 'all' && log.action !== actionFilter) return false

    // 2. Table filter
    if (tableFilter !== 'all' && log.table_name !== tableFilter) return false

    // 3. Search query (matches email, name, table name, or record ID)
    if (search.trim()) {
      const q = search.toLowerCase()
      const profile = log.user_id ? userProfiles[log.user_id] : null
      const email = profile?.email || ''
      const name = profile?.name || ''
      const table = log.table_name || ''
      const recordId = log.record_id || ''
      
      const matchesEmail = email.toLowerCase().includes(q)
      const matchesName = name.toLowerCase().includes(q)
      const matchesTable = table.toLowerCase().includes(q)
      const matchesRecordId = recordId.toLowerCase().includes(q)

      return matchesEmail || matchesName || matchesTable || matchesRecordId
    }

    return true
  })

  // Group unique tables for the table filter dropdown
  const uniqueTables = Array.from(new Set(logs.map(l => l.table_name))).sort()

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'insert':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            {language === 'ar' ? 'إضافة' : 'Insert'}
          </span>
        )
      case 'update':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            {language === 'ar' ? 'تعديل' : 'Update'}
          </span>
        )
      case 'soft_delete':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            {language === 'ar' ? 'أرشفة / حذف' : 'Archive'}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground">
            {action}
          </span>
        )
    }
  }

  // Calculate changed properties for the diff view
  const getChangedFields = (oldData: any, newData: any) => {
    if (!oldData || !newData) return []
    const changes: { key: string; oldVal: any; newVal: any }[] = []
    
    // Union of all keys
    const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]))
    
    allKeys.forEach(key => {
      // Skip generic noise columns
      if (['updated_at', 'created_at', 'updated_by', 'created_by'].includes(key)) return

      const oldVal = oldData[key]
      const newVal = newData[key]

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({ key, oldVal, newVal })
      }
    })

    return changes
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            {language === 'ar' ? 'سجل عمليات النظام (الرقابة)' : 'System Audit Logs'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'مراقبة وتتبع جميع التغييرات التي قام بها أعضاء الفريق والمشرفون.' 
              : 'Track changes made by team members, university admins, and system operators.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* View mode switcher */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border shrink-0 text-xs">
            <button
              onClick={() => setViewMode('active')}
              className={cn(
                "px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer",
                viewMode === 'active' 
                  ? "bg-card text-foreground shadow-xs border border-border" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {language === 'ar' ? 'السجلات النشطة' : 'Active Logs'}
            </button>
            <button
              onClick={() => setViewMode('trash')}
              className={cn(
                "px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                viewMode === 'trash' 
                  ? "bg-card text-foreground shadow-xs border border-border" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {language === 'ar' ? 'سلة المحذوفات' : 'Recycle Bin'}
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title={language === 'ar' ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>

          {/* Clean / Purge / Restore buttons */}
          {viewMode === 'active' ? (
            <Button
              size="sm"
              variant="outline"
              disabled={actionLoading || loading || logs.length === 0}
              onClick={handleCleanLogs}
              className="gap-1.5 text-xs cursor-pointer border-border hover:bg-muted"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              {language === 'ar' ? 'تنظيف السجلات' : 'Clean Logs'}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={actionLoading || loading || logs.length === 0}
              onClick={handleRestoreAllLogs}
              className="gap-1.5 text-xs cursor-pointer border-border hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5 text-primary" />
              {language === 'ar' ? 'استعادة الكل' : 'Restore All'}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">{language === 'ar' ? 'إجمالي العمليات' : 'Total Logs'}</span>
          <span className="text-xl sm:text-2xl font-extrabold mt-1 text-foreground">{filteredLogs.length}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase">{language === 'ar' ? 'التعديلات' : 'Updates'}</span>
          <span className="text-xl sm:text-2xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">
            {filteredLogs.filter(l => l.action === 'update').length}
          </span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold text-rose-500 uppercase">{language === 'ar' ? 'الأرشفة' : 'Archives'}</span>
          <span className="text-xl sm:text-2xl font-extrabold mt-1 text-rose-600 dark:text-rose-400">
            {filteredLogs.filter(l => l.action === 'soft_delete').length}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'ar' ? 'ابحث بالبريد الإلكتروني، المعرف، أو الجدول...' : 'Search email, record ID, or table...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rtl:pr-9 rtl:pl-3 bg-card border-border"
          />
        </div>

        {/* Action filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            {language === 'ar' ? 'العملية:' : 'Action:'}
          </span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card text-foreground cursor-pointer focus:outline-none focus:border-primary"
          >
            <option value="all">{language === 'ar' ? 'الكل' : 'All Actions'}</option>
            <option value="insert">{language === 'ar' ? 'إضافة (Insert)' : 'Insert'}</option>
            <option value="update">{language === 'ar' ? 'تعديل (Update)' : 'Update'}</option>
            <option value="soft_delete">{language === 'ar' ? 'أرشفة (Archive)' : 'Archive'}</option>
          </select>
        </div>

        {/* Table filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            {language === 'ar' ? 'الجدول:' : 'Table:'}
          </span>
          <select
            value={tableFilter}
            onChange={e => setTableFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card text-foreground cursor-pointer focus:outline-none focus:border-primary"
          >
            <option value="all">{language === 'ar' ? 'كل الجداول' : 'All Tables'}</option>
            {uniqueTables.map(tbl => (
              <option key={tbl} value={tbl}>{tbl}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_auto] items-center gap-4 px-5 py-3 bg-muted/30 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>{language === 'ar' ? 'العضو' : 'Member'}</span>
          <span>{language === 'ar' ? 'العملية' : 'Action'}</span>
          <span>{language === 'ar' ? 'الجدول المستهدف' : 'Target Table'}</span>
          <span>{language === 'ar' ? 'تاريخ العملية' : 'Timestamp'}</span>
          <span className="text-center">{language === 'ar' ? 'التفاصيل' : 'Details'}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-semibold">
              {language === 'ar' ? 'جاري تحميل السجلات...' : 'Loading audit logs...'}
            </span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <History className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-semibold text-muted-foreground">
              {language === 'ar' ? 'لم يتم العثور على أي سجلات مطابقة.' : 'No audit logs found.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredLogs.map(log => {
              const profile = log.user_id ? userProfiles[log.user_id] : null
              const displayName = profile ? (profile.name || profile.email) : (language === 'ar' ? 'النظام / تلقائي' : 'System / Auto')
              const tooltipText = profile ? (profile.name ? `${profile.name} (${profile.email})` : profile.email) : (language === 'ar' ? 'عملية تلقائية من النظام' : 'System automated action')
              const date = new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })

              return (
                <div
                  key={log.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_auto] items-center gap-4 px-5 py-3.5 hover:bg-muted/15 transition-colors"
                >
                  {/* Member Profile */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-bold text-foreground truncate" title={tooltipText}>
                      {displayName}
                    </span>
                  </div>

                  {/* Action type */}
                  <div className="min-w-0">
                    {getActionBadge(log.action)}
                  </div>

                  {/* Target Table */}
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground bg-muted border border-border/80 px-2 py-0.5 rounded-md">
                      <Database className="h-2.5 w-2.5" />
                      {log.table_name}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span className="truncate">{date}</span>
                  </div>

                  {/* View / Manage Action Details */}
                  <div className="flex items-center justify-center gap-1 shrink-0">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title={language === 'ar' ? 'عرض تفاصيل العملية' : 'View Action Details'}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {viewMode === 'active' ? (
                      <button
                        onClick={() => handleSoftDeleteLog(log.id)}
                        disabled={actionLoading}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                        title={language === 'ar' ? 'نقل لسلة المحذوفات' : 'Move to Recycle Bin'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestoreLog(log.id)}
                        disabled={actionLoading}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer disabled:opacity-50"
                        title={language === 'ar' ? 'استعادة' : 'Restore'}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Log Detail Modal ────────────────────────────────────────── */}
      <Dialog open={!!selectedLog} onOpenChange={open => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedLog && (() => {
            const profile = selectedLog.user_id ? userProfiles[selectedLog.user_id] : null
            const initiatedBy = profile ? (profile.name ? `${profile.name} (${profile.email})` : profile.email) : 'System / Auto'
            const formattedDate = new Date(selectedLog.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
              dateStyle: 'long',
              timeStyle: 'medium'
            })
            
            const changes = selectedLog.action === 'update' 
              ? getChangedFields(selectedLog.old_data, selectedLog.new_data)
              : []

            return (
              <>
                <DialogHeader className="border-b border-border/60 pb-3">
                  <DialogTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary" />
                    {language === 'ar' ? 'تفاصيل السجل والعملية' : 'Audit Log Details'}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'ar' ? 'معلومات تفصيلية وتغييرات الحقول المرتبطة بالسجل.' : 'View raw properties or specific values modified in this action.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-3 text-xs">
                  {/* Log meta info grid */}
                  <div className="grid grid-cols-2 gap-4 bg-muted/40 border border-border/60 rounded-xl p-3.5">
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-bold">{language === 'ar' ? 'العضو المنفذ:' : 'Initiated By:'}</span>
                      <p className="font-semibold text-foreground break-all">{initiatedBy}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-bold">{language === 'ar' ? 'تاريخ العملية:' : 'Date & Time:'}</span>
                      <p className="font-semibold text-foreground">{formattedDate}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-bold">{language === 'ar' ? 'الجدول المستهدف:' : 'Database Table:'}</span>
                      <p className="font-semibold font-mono text-[11px]">{selectedLog.table_name}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-bold">{language === 'ar' ? 'معرف السجل:' : 'Record ID:'}</span>
                      <p className="font-semibold font-mono text-[10px] break-all">{selectedLog.record_id}</p>
                    </div>
                  </div>

                  {/* Specific Action content */}
                  {selectedLog.action === 'update' && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-foreground text-sm border-b border-border/50 pb-1">
                        {language === 'ar' ? 'تعديلات الحقول والبيانات' : 'Modified Fields & Diffs'}
                      </h3>
                      {changes.length === 0 ? (
                        <p className="text-muted-foreground italic py-2 text-center">
                          {language === 'ar' ? 'تم تحديث بيانات النظام أو لم يطرأ تغيير مرئي على الحقول الأساسية.' : 'No primary user-visible fields changed.'}
                        </p>
                      ) : (
                        <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                          {changes.map(chg => {
                            const isOldObj = chg.oldVal && typeof chg.oldVal === 'object'
                            const isNewObj = chg.newVal && typeof chg.newVal === 'object'
                            
                            return (
                              <div key={chg.key} className="p-3 bg-card space-y-1.5">
                                <span className="font-bold font-mono text-[11px] text-primary">{chg.key}</span>
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                  {/* Old value */}
                                  <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-700 dark:text-rose-400 break-words font-mono text-[10px]">
                                    {isOldObj ? JSON.stringify(chg.oldVal) : String(chg.oldVal ?? '—')}
                                  </div>
                                  
                                  {/* Direction Indicator */}
                                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  
                                  {/* New value */}
                                  <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-400 break-words font-mono text-[10px]">
                                    {isNewObj ? JSON.stringify(chg.newVal) : String(chg.newVal ?? '—')}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raw Data Inspect tab */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-foreground text-sm border-b border-border/50 pb-1">
                      {language === 'ar' ? 'البيانات الكاملة الخام' : 'Complete Raw JSON Payload'}
                    </h3>
                    <div className="p-3 rounded-xl bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] overflow-x-auto whitespace-pre leading-relaxed max-h-56">
                      {JSON.stringify(
                        selectedLog.action === 'insert' ? selectedLog.new_data : (selectedLog.new_data || selectedLog.old_data),
                        null,
                        2
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                  <Button type="button" onClick={() => setSelectedLog(null)}>
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </Button>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
