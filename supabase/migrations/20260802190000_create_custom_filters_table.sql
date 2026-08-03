-- Create custom_filters table for managing filters from Admin Settings
create table if not exists custom_filters (
  id uuid primary key default gen_random_uuid(),
  name_fr text not null,
  name_ar text,
  category text not null check (category in ('level', 'unit_type', 'status', 'domain_tag', 'custom')),
  value text not null,
  is_active boolean not null default true,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed initial default filters
insert into custom_filters (name_fr, name_ar, category, value, display_order)
values
  ('Master 1 (M1)', 'ماستر 1', 'level', 'M1', 1),
  ('Master 2 (M2)', 'ماستر 2', 'level', 'M2', 2),
  ('M1 & M2', 'ماستر 1 و 2', 'level', 'M1 / M2', 3),
  ('Faculté', 'كلية', 'unit_type', 'faculty', 1),
  ('Institut', 'معهد', 'unit_type', 'institute', 2),
  ('École Supérieure', 'مدرسة العليا', 'unit_type', 'school', 3),
  ('Inscriptions Ouvertes', 'التسجيلات مفتوحة', 'status', 'open', 1),
  ('Inscriptions Fermées', 'التسجيلات مغلقة', 'status', 'closed', 2)
on conflict do nothing;

-- Enable Row Level Security
alter table custom_filters enable row level security;

-- Policies
drop policy if exists "Public can read active custom_filters" on custom_filters;
create policy "Public can read active custom_filters" on custom_filters
  for select using (is_active = true);

drop policy if exists "Auth users manage custom_filters" on custom_filters;
create policy "Auth users manage custom_filters" on custom_filters
  for all to authenticated using (true) with check (true);
