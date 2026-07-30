create table if not exists domains (
  id uuid primary key default gen_random_uuid(),
  name_fr text not null unique,
  name_ar text
);
