-- 1. DROP OLD SCHEMA (Cascade to remove old views/policies/triggers if any)
drop table if exists suggested_updates cascade;
drop table if exists listings cascade;
drop table if exists domains cascade;
drop table if exists universities cascade;
-- Old triggers
drop function if exists set_updated_at() cascade;

-- 2. CREATE EXTENSIONS
create extension if not exists "pgcrypto";

-- 3. CORE ENTITIES
create table media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'pdf', 'document')),
  alt_text text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

create table universities (
  id uuid primary key default gen_random_uuid(),
  name_fr text not null,
  name_ar text,
  name_en text,
  logo_media_id uuid references media(id) on delete set null,
  cover_media_id uuid references media(id) on delete set null,
  location_gps text,
  city text,
  wilaya text,
  website text,
  phone text,
  email text,
  ranking int,
  description_fr text,
  description_ar text,
  description_en text,
  social_links jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

create table academic_units (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  parent_unit_id uuid references academic_units(id) on delete cascade,
  unit_type text not null check (unit_type in ('faculty', 'institute', 'school', 'center', 'department')),
  name_fr text not null,
  name_ar text,
  name_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  academic_unit_id uuid references academic_units(id) on delete set null,
  opportunity_type text not null check (opportunity_type in ('master', 'concours', 'doctorate', 'scholarship')),
  title_fr text not null,
  title_ar text,
  title_en text,
  description_fr text,
  description_ar text,
  description_en text,
  duration_months int,
  language text[],
  career_prospects jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  workflow_status text not null default 'draft' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  academic_year text not null,
  semester text,
  portal_url text,
  seats_available int,
  application_fee numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  workflow_status text not null default 'draft' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

create table events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  event_type text not null check (event_type in ('app_opens', 'app_closes', 'interview', 'exam', 'results', 'appeal', 'enrollment')),
  event_date timestamptz not null,
  is_tentative boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

create table required_documents (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  name_fr text not null,
  name_ar text,
  name_en text,
  description text,
  is_required boolean not null default true,
  display_order int not null default 0,
  template_media_id uuid references media(id) on delete set null,
  accepted_formats text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

-- 4. SUPPORTING TABLES
create table announcements (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  title text not null,
  content text not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  workflow_status text not null default 'draft' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

create table sources (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  source_type text not null check (source_type in ('official_website', 'social_media', 'official_pdf', 'ministry', 'manual')),
  url text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  workflow_status text not null default 'published' check (workflow_status in ('draft', 'review', 'published', 'archived'))
);

create table saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, 
  item_type text not null check (item_type in ('university', 'opportunity', 'announcement')),
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, item_type, item_id)
);

create table user_roles (
  user_id uuid primary key,
  role text not null check (role in ('owner', 'admin', 'moderator', 'contributor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null check (action in ('insert', 'update', 'soft_delete', 'restore')),
  table_name text not null,
  record_id uuid not null,
  old_data jsonb,
  new_data jsonb,
  timestamp timestamptz not null default now()
);

-- 5. TRIGGERS (UPDATED_AT & AUDIT)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function log_audit_action()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into audit_logs (user_id, action, table_name, record_id, new_data)
    values (new.created_by, 'insert', tg_table_name, new.id, row_to_json(new));
    return new;
  elsif (tg_op = 'UPDATE') then
    if (new.workflow_status = 'archived' and old.workflow_status != 'archived') then
      insert into audit_logs (user_id, action, table_name, record_id, old_data, new_data)
      values (new.updated_by, 'soft_delete', tg_table_name, new.id, row_to_json(old), row_to_json(new));
    else
      insert into audit_logs (user_id, action, table_name, record_id, old_data, new_data)
      values (new.updated_by, 'update', tg_table_name, new.id, row_to_json(old), row_to_json(new));
    end if;
    return new;
  end if;
  return null;
end;
$$ language plpgsql;

-- Apply updated_at and audit triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
        EXECUTE format('CREATE TRIGGER log_%I_audit AFTER INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION log_audit_action()', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. INDEXES
create index idx_opps_title_fr on opportunities using gin(to_tsvector('french', title_fr));
create index idx_opps_type on opportunities(opportunity_type);
create index idx_opps_status on opportunities(workflow_status);
create index idx_univs_name_fr on universities using gin(to_tsvector('french', name_fr));
create index idx_sessions_year on sessions(academic_year);
create index idx_events_date on events(event_date);
create index idx_saved_user on saved_items(user_id);
create index idx_audit_table_record on audit_logs(table_name, record_id);

-- 7. RLS POLICIES
alter table media enable row level security;
alter table universities enable row level security;
alter table academic_units enable row level security;
alter table opportunities enable row level security;
alter table sessions enable row level security;
alter table events enable row level security;
alter table required_documents enable row level security;
alter table announcements enable row level security;
alter table sources enable row level security;
alter table saved_items enable row level security;
alter table user_roles enable row level security;
alter table audit_logs enable row level security;

-- Universal Read Policies for published content
create policy "Public can read published media" on media for select using (workflow_status = 'published');
create policy "Public can read published universities" on universities for select using (workflow_status = 'published');
create policy "Public can read published academic_units" on academic_units for select using (workflow_status = 'published');
create policy "Public can read published opportunities" on opportunities for select using (workflow_status = 'published');
create policy "Public can read published sessions" on sessions for select using (workflow_status = 'published');
create policy "Public can read published events" on events for select using (workflow_status = 'published');
create policy "Public can read published required_documents" on required_documents for select using (workflow_status = 'published');
create policy "Public can read published announcements" on announcements for select using (workflow_status = 'published');

-- Role-based Write Policies (Allow authenticated users full access, app logic restricts by roles)
create policy "Auth users manage media" on media for all to authenticated using (true) with check (true);
create policy "Auth users manage universities" on universities for all to authenticated using (true) with check (true);
create policy "Auth users manage academic_units" on academic_units for all to authenticated using (true) with check (true);
create policy "Auth users manage opportunities" on opportunities for all to authenticated using (true) with check (true);
create policy "Auth users manage sessions" on sessions for all to authenticated using (true) with check (true);
create policy "Auth users manage events" on events for all to authenticated using (true) with check (true);
create policy "Auth users manage required_documents" on required_documents for all to authenticated using (true) with check (true);
create policy "Auth users manage announcements" on announcements for all to authenticated using (true) with check (true);
create policy "Auth users manage sources" on sources for all to authenticated using (true) with check (true);

create policy "Users manage own saved items" on saved_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Auth read roles" on user_roles for select to authenticated using (true);
create policy "Auth write roles" on user_roles for all to authenticated using (true) with check (true);

create policy "Auth read audit logs" on audit_logs for select to authenticated using (true);
