-- Sync email column in public.user_roles from auth.users
update public.user_roles ur
set email = u.email
from auth.users u
where ur.user_id = u.id
  and (ur.email is null or ur.email = '');
