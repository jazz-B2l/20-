'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
  Edit3,
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
  FileEdit,
  Users,
  GitPullRequest,
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

// ─── Role display config ───────────────────────────────────────────────────────

interface RoleDisplayConfig {
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  badgeClass: string
}

const ROLE_DISPLAY: Record<string, RoleDisplayConfig> = {
  owner: {
    label: 'Owner',
    description: 'Can do anything — full system & team access, role assignments, and ownership transfer.',
    icon: Crown,
    color: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400',
  },
  super_admin: {
    label: 'Super Admin',
    description: 'Can do anything — manage all content and team access, except touching ownership.',
    icon: ShieldCheck,
    color: 'text-violet-500',
    badgeClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-400',
  },
  admin: {
    label: 'Admin',
    description: 'Manages all content (universities, listings, publishing). Cannot access Team & Access.',
    icon: Shield,
    color: 'text-primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/30',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to view work of admins and leave notes / suggested updates.',
    icon: Eye,
    color: 'text-muted-foreground',
    badgeClass: 'bg-secondary text-muted-foreground border-border',
  },
}

// Ordered list for dropdowns (by permission level, highest first)
const ROLE_ORDER = ['owner', 'super_admin', 'admin', 'viewer']

function getRoleCfg(roleName: string): RoleDisplayConfig {
  return ROLE_DISPLAY[roleName] || {
    label: roleName,
    description: '',
    icon: Shield,
    color: 'text-muted-foreground',
    badgeClass: 'bg-secondary text-muted-foreground border-border',
  }
}

// ─── RoleBadge ──────────────────────────────────────────────────────────────

function RoleBadge({ roleName }: { roleName: string }) {
  const cfg = getRoleCfg(roleName)
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border', cfg.badgeClass)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

// ─── RoleSelector ──────────────────────────────────────────────────────────

function RoleSelector({
  value,
  allRoles,
  onChange,
  disabled,
}: {
  value: string
  allRoles: { id: string; name: string; description: string }[]
  onChange: (roleId: string, roleName: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const cfg = getRoleCfg(value)
  const Icon = cfg.icon

  const sorted = [...allRoles].sort((a, b) => {
    const ia = ROLE_ORDER.indexOf(a.name)
    const ib = ROLE_ORDER.indexOf(b.name)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/40 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Icon className={cn('h-4 w-4', cfg.color)} />
        <span>{cfg.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 right-0 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-[340px] overflow-y-auto">
          {sorted.map(role => {
            const rc = getRoleCfg(role.name)
            const Ic = rc.icon
            const isSelected = role.name === value
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => { onChange(role.id, role.name); setOpen(false) }}
                className={cn('w-full flex items-start gap-3 px-4 py-3 transition-colors text-left hover:bg-muted/50', isSelected ? 'bg-primary/5' : '')}
              >
                <Ic className={cn('h-4 w-4 mt-0.5 shrink-0', rc.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{rc.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{role.description || rc.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── TeamTab ──────────────────────────────────────────────────────────────────

export function TeamTab({ currentUserEmail }: { currentUserEmail: string }) {
  const supabase = createClient()

  const [members, setMembers] = useState<any[]>([])
  const [allRoles, setAllRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRoleId, setCreateRoleId] = useState('')
  const [createRoleName, setCreateRoleName] = useState('editor')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Delete confirm
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null)

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
      setError('Failed to load team: ' + membersRes.error.message)
    } else {
      setMembers(membersRes.data || [])
    }

    if (!rolesRes.error) {
      setAllRoles(rolesRes.data || [])
      // Default create role to 'admin'
      const defaultRole = rolesRes.data?.find((r: any) => r.name === 'admin') || rolesRes.data?.[0]
      if (defaultRole) { setCreateRoleId(defaultRole.id); setCreateRoleName(defaultRole.name) }
    }

    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const resetCreateForm = () => {
    setCreateEmail('')
    setCreatePassword('')
    setCreateError(null)
  }

  const handleRoleChange = async (userUid: string, newRoleId: string, newRoleName: string) => {
    setUpdating(userUid)
    const { error } = await supabase
      .from('user_roles')
      .update({ role_id: newRoleId })
      .eq('user_id', userUid)

    if (error) {
      alert('Failed to update role: ' + error.message)
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
      alert('Failed to remove member: ' + error.message)
    } else {
      setMembers(prev => prev.filter(m => m.user_id !== memberToDelete.user_id))
    }
    setDeleting(null)
    setMemberToDelete(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
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
        setCreateError(data.error || 'Failed to create account')
        setCreateLoading(false)
        return
      }

      setIsCreateOpen(false)
      resetCreateForm()
      loadData()
    } catch (err: any) {
      setCreateError(err.message || 'Unexpected error')
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
            Team & Access Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admin accounts, assign roles and control permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 cursor-pointer">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {sortedRoles.map(role => {
          const cfg = getRoleCfg(role.name)
          const Icon = cfg.icon
          return (
            <div key={role.id} className="bg-card border border-border rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                <span className="text-xs font-bold text-foreground">{cfg.label}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{role.description || cfg.description}</p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email, user ID, or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
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
          <span>Member</span>
          <span>Role</span>
          <span>Remove</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-semibold">Loading team...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <User className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-semibold text-muted-foreground">
              {search ? 'No members match your search.' : 'No team members yet.'}
            </p>
            {!search && (
              <button onClick={() => setIsCreateOpen(true)} className="text-xs text-primary font-bold hover:underline cursor-pointer">
                Add the first member →
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
                          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-bold">You</span>
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
                    title="Remove member"
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
              Add Team Member
            </DialogTitle>
            <DialogDescription>
              Create a new account directly and assign a role. The email will bypass verification.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="c_email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="c_email" type="email" required
                  placeholder="member@example.com"
                  value={createEmail}
                  onChange={e => setCreateEmail(e.target.value)}
                  className="pl-9 bg-card border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c_password">Temporary Password</Label>
              <Input
                id="c_password" type="password" required minLength={8}
                placeholder="At least 8 characters"
                value={createPassword}
                onChange={e => setCreatePassword(e.target.value)}
                className="bg-card border-border"
              />
              <p className="text-[11px] text-muted-foreground">The user can change this after logging in.</p>
            </div>

            {/* Role grid */}
            <div className="space-y-2">
              <Label>Access Role</Label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
                {sortedRoles.filter(r => r.name !== 'owner').map(role => {
                  const cfg = getRoleCfg(role.name)
                  const Icon = cfg.icon
                  const isSelected = createRoleId === role.id
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => { setCreateRoleId(role.id); setCreateRoleName(role.name) }}
                      className={cn(
                        'flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all cursor-pointer',
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
                      <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{role.description || cfg.description}</p>
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
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createLoading || !createRoleId} className="gap-2">
                {createLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                  : <><UserPlus className="h-4 w-4" /> Create Account</>}
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
              Remove Member
            </DialogTitle>
            <DialogDescription>
              This will revoke <strong>{memberToDelete?.email || memberToDelete?.user_id}'s</strong> access immediately. Their Supabase Auth account will remain but all admin privileges will be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setMemberToDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!!deleting}
              onClick={handleDelete}
              className="gap-2"
            >
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin" /> Removing...</> : <><Trash2 className="h-4 w-4" /> Remove Access</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
