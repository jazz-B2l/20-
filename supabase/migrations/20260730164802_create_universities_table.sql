create table if not exists universities (
  id uuid primary key default gen_random_uuid(),
  name_fr text not null,
  name_ar text,
  wilaya text not null,
  city text,
  logo_url text,
  official_website_url text,
  created_at timestamptz not null default now()
);
