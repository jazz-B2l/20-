-- Create is_admin helper function
create or replace function public.is_admin(user_uid uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.user_roles 
    where user_id = user_uid 
    and (role = 'admin' or role = 'owner')
  );
end;
$$ language plpgsql;

-- Secure user_roles table
drop policy if exists "Auth write roles" on public.user_roles;
create policy "Only owners can manage roles" on public.user_roles for all to authenticated using (
  exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'owner'
  )
) with check (
  exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'owner'
  )
);

-- Secure domains table
drop policy if exists "Auth manage domains" on public.domains;
drop policy if exists "Auth users manage domains" on public.domains;
create policy "Admins manage domains" on public.domains for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Secure faculties table
drop policy if exists "Auth manage faculties" on public.faculties;
drop policy if exists "Auth users manage academic_units" on public.faculties;
create policy "Admins manage faculties" on public.faculties for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Secure programs table
drop policy if exists "Auth manage programs" on public.programs;
drop policy if exists "Auth users manage opportunities" on public.programs;
create policy "Admins manage programs" on public.programs for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Secure admission_windows table
drop policy if exists "Auth manage admission_windows" on public.admission_windows;
create policy "Admins manage admission_windows" on public.admission_windows for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Secure suggested_updates table
drop policy if exists "Auth manage suggested_updates" on public.suggested_updates;
create policy "Admins manage suggested_updates" on public.suggested_updates for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Secure alert_subscriptions table
drop policy if exists "Auth manage alert_subscriptions" on public.alert_subscriptions;
create policy "Admins manage alert_subscriptions" on public.alert_subscriptions for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Secure universities table
drop policy if exists "Auth users manage universities" on public.universities;
create policy "Admins manage universities" on public.universities for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Secure audit_logs table
drop policy if exists "Auth read audit logs" on public.audit_logs;
create policy "Admins read audit logs" on public.audit_logs for select to authenticated using (public.is_admin(auth.uid()));
