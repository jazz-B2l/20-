-- Fix infinite recursion in user_roles RLS policies
-- Root cause: policies that query user_roles to check roles → triggers the same policy → infinite loop
-- Solution: SECURITY DEFINER functions bypass RLS internally (run as DB owner)

-- Drop all recursive policies
drop policy if exists "Only owners can manage roles" on public.user_roles;
drop policy if exists "Auth read roles" on public.user_roles;
drop policy if exists "Auth write roles" on public.user_roles;
drop policy if exists "Admins read audit logs" on public.audit_logs;

-- Safe helper: get the role name of the current user
-- SECURITY DEFINER + set search_path = public ensures this runs as owner and bypasses RLS
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select r.name
  from user_roles ur
  join roles r on r.id = ur.role_id
  where ur.user_id = auth.uid()
  limit 1;
$$;

-- user_roles: each user can read their own row
create policy "Users read own role"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- user_roles: admins/owners can read ALL rows (for Team panel listing)
create policy "Admins read all roles"
  on public.user_roles for select
  to authenticated
  using (public.get_my_role() in ('owner', 'super_admin', 'admin'));

-- user_roles: only owners/super_admins can insert/update/delete
create policy "Owners manage roles"
  on public.user_roles for all
  to authenticated
  using (public.get_my_role() in ('owner', 'super_admin'))
  with check (public.get_my_role() in ('owner', 'super_admin'));

-- Update is_admin to join through roles table (no recursive self-reference)
create or replace function public.is_admin(user_uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = user_uid
      and r.name in ('owner', 'super_admin', 'admin')
  );
$$;

-- Audit logs: admins only
create policy "Admins read audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin(auth.uid()));
