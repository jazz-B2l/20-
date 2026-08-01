import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getCurrentSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const supabase = await createClient()
  const { data: roleData, error: queryError } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', user.id)
    .single()

  console.log('[requireAdmin] user_id:', user.id)
  console.log('[requireAdmin] roleData:', roleData)
  console.log('[requireAdmin] queryError:', queryError)

  const roleName = (roleData?.role as any)?.name
  const isAdmin = !!roleName || user?.user_metadata?.is_admin === true
  console.log('[requireAdmin] roleName:', roleName, 'isAdmin:', isAdmin)
  
  if (!isAdmin) {
    redirect('/auth/login')
  }
  return { user, roleName: roleName || (user?.user_metadata?.is_admin ? 'admin' : 'viewer') }
}
