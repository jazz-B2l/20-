-- Recreate domains table
create table if not exists domains (
  id uuid primary key default gen_random_uuid(),
  name_fr text not null unique,
  name_ar text,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

-- Rename academic_units to faculties if it exists
alter table if exists academic_units rename to faculties;

-- Create programs table (replacing opportunities)
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  faculty_id uuid references faculties(id) on delete set null,
  domain_id uuid references domains(id) on delete set null,
  title_fr text not null,
  title_ar text,
  level text not null check (level in ('M1', 'M2')),
  description_fr text,
  description_ar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

-- Create admission_windows table (replacing sessions)
create table if not exists admission_windows (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  academic_year text not null,
  seats integer,
  deadline date,
  portal_url text,
  is_published boolean not null default true,
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create suggested_updates table (replacing sources)
create table if not exists suggested_updates (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null,
  message text not null,
  contact_email text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

-- Create alert_subscriptions table
create table if not exists alert_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  wilaya text,
  domain_id uuid references domains(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Seed domains table
insert into domains (name_fr, name_ar, slug)
values
  ('Sciences et Technologies', 'علوم وتكنولوجيا', 'sciences-technologies'),
  ('Sciences de la Nature et de la Vie', 'علوم الطبيعة والحياة', 'sciences-nature-vie'),
  ('Sciences Humaines et Sociales', 'العلوم الإنسانية والاجتماعية', 'sciences-humaines-sociales'),
  ('Droit et Sciences Politiques', 'الحقوق والعلوم السياسية', 'droit-sciences-politiques'),
  ('Sciences Économiques et Gestion', 'العلوم الاقتصادية والتسيير', 'sciences-economiques-gestion'),
  ('Lettres et Langues', 'الآداب واللغات', 'lettres-langues'),
  ('Médecine et Sciences de la Santé', 'الطب والعلوم الصحية', 'medecine-sciences-sante'),
  ('Mathématiques et Informatique', 'الرياضيات والإعلام الآلي', 'mathematiques-informatique')
on conflict (name_fr) do nothing;

-- Enable RLS
alter table domains enable row level security;
alter table faculties enable row level security;
alter table programs enable row level security;
alter table admission_windows enable row level security;
alter table suggested_updates enable row level security;
alter table alert_subscriptions enable row level security;

-- Drop old policies if they exist (due to rename table)
drop policy if exists "Public can read published academic_units" on faculties;
drop policy if exists "Auth users manage academic_units" on faculties;

-- Public read policies
create policy "Public can read published domains" on domains for select using (workflow_status = 'published');
create policy "Public can read published faculties" on faculties for select using (workflow_status = 'published');
create policy "Public can read published programs" on programs for select using (workflow_status = 'published');
create policy "Public can read published admission_windows" on admission_windows for select using (is_published = true);

-- Public insert policies
create policy "Anyone can insert suggested_updates" on suggested_updates for insert with check (true);
create policy "Anyone can insert alert_subscriptions" on alert_subscriptions for insert with check (true);

-- Authenticated full CRUD policies for admins
create policy "Auth manage domains" on domains for all to authenticated using (true) with check (true);
create policy "Auth manage faculties" on faculties for all to authenticated using (true) with check (true);
create policy "Auth manage programs" on programs for all to authenticated using (true) with check (true);
create policy "Auth manage admission_windows" on admission_windows for all to authenticated using (true) with check (true);
create policy "Auth manage suggested_updates" on suggested_updates for all to authenticated using (true) with check (true);
create policy "Auth manage alert_subscriptions" on alert_subscriptions for all to authenticated using (true) with check (true);
