-- Add email column to user_roles for display purposes
alter table public.user_roles add column if not exists email text;
alter table public.user_roles add column if not exists created_at timestamptz not null default now();
