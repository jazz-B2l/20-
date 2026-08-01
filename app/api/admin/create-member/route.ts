import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  // 1. Verify caller is admin
  try {
    const { roleName } = await requireAdmin()
    const canManageTeam = roleName === 'super_admin' || roleName === 'owner'
    if (!canManageTeam) throw new Error('Unauthorized')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, password, roleId } = await request.json()
  if (!email || !password || !roleId) {
    return NextResponse.json({ error: 'email, password, and roleId are required' }, { status: 400 })
  }

  // 2. Use service role admin client
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 3. Check if user already exists in Supabase Auth to prevent duplicate errors
  const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers()
  if (listError) {
    return NextResponse.json({ error: 'Failed to look up auth users: ' + listError.message }, { status: 500 })
  }

  const existingUser = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  let targetUserId: string

  if (existingUser) {
    targetUserId = existingUser.id
    // Update the password and confirm email for this existing user
    const { error: updateError } = await adminClient.auth.admin.updateUserById(targetUserId, {
      password,
      email_confirm: true
    })
    if (updateError) {
      return NextResponse.json({ error: 'User already exists but failed to update password: ' + updateError.message }, { status: 400 })
    }
  } else {
    // Create new user in Supabase Auth directly
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (userError || !userData.user) {
      return NextResponse.json({ error: userError?.message || 'Failed to create user' }, { status: 400 })
    }
    targetUserId = userData.user.id
  }

  // 4. Assign or update role in user_roles
  const { data: existingRole } = await adminClient
    .from('user_roles')
    .select('*')
    .eq('user_id', targetUserId)
    .single()

  if (existingRole) {
    const { error: roleError } = await adminClient
      .from('user_roles')
      .update({ role_id: roleId, email })
      .eq('user_id', targetUserId)

    if (roleError) {
      return NextResponse.json({ error: 'Failed to update role assignment: ' + roleError.message }, { status: 500 })
    }
  } else {
    const { error: roleError } = await adminClient
      .from('user_roles')
      .insert([{ user_id: targetUserId, role_id: roleId, email }])

    if (roleError) {
      return NextResponse.json({ error: 'Failed to insert role assignment: ' + roleError.message }, { status: 500 })
    }
  }

  console.log(`[Create Member] Member successfully created/updated: ${email} with role ID ${roleId}`);

  return NextResponse.json({
    success: true,
    userId: targetUserId,
    email
  })
}
