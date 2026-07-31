-- Create domains table
create table if not exists domains (
  id uuid primary key default gen_random_uuid(),
  name_fr text not null unique,
  name_ar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

-- Add domain_id to opportunities
alter table opportunities 
add column if not exists domain_id uuid references domains(id) on delete set null;

-- Seed domains table
insert into domains (name_fr, name_ar)
values
  ('Sciences et Technologies', 'علوم وتكنولوجيا'),
  ('Sciences de la Nature et de la Vie', 'علوم الطبيعة والحياة'),
  ('Sciences Humaines et Sociales', 'العلوم الإنسانية والاجتماعية'),
  ('Droit et Sciences Politiques', 'الحقوق والعلوم السياسية'),
  ('Sciences Économiques et Gestion', 'العلوم الاقتصادية والتسيير'),
  ('Lettres et Langues', 'الآداب واللغات'),
  ('Médecine et Sciences de la Santé', 'الطب والعلوم الصحية'),
  ('Mathématiques et Informatique', 'الرياضيات والإعلام الآلي')
on conflict (name_fr) do nothing;

-- Enable RLS and policies for domains
alter table domains enable row level security;

drop policy if exists "Public can read published domains" on domains;
create policy "Public can read published domains" on domains
  for select using (workflow_status = 'published');

drop policy if exists "Auth users manage domains" on domains;
create policy "Auth users manage domains" on domains
  for all to authenticated using (true) with check (true);

-- Enable updated_at and audit triggers for domains
drop trigger if exists set_domains_updated_at on domains;
create trigger set_domains_updated_at 
  before update on domains 
  for each row execute function set_updated_at();

drop trigger if exists log_domains_audit on domains;
create trigger log_domains_audit 
  after insert or update on domains 
  for each row execute function log_audit_action();
