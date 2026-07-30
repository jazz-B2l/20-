alter table universities enable row level security;
alter table domains enable row level security;
alter table listings enable row level security;
alter table suggested_updates enable row level security;

-- universities
drop policy if exists "Allow select for anon and authenticated" on universities;
create policy "Allow select for anon and authenticated" on universities
  for select to anon, authenticated using (true);

drop policy if exists "Allow insert/update/delete for authenticated only" on universities;
create policy "Allow insert/update/delete for authenticated only" on universities
  for all to authenticated using (true) with check (true);

-- domains
drop policy if exists "Allow select for anon and authenticated" on domains;
create policy "Allow select for anon and authenticated" on domains
  for select to anon, authenticated using (true);

drop policy if exists "Allow insert/update/delete for authenticated only" on domains;
create policy "Allow insert/update/delete for authenticated only" on domains
  for all to authenticated using (true) with check (true);

-- listings
drop policy if exists "Allow select published for anon and authenticated" on listings;
create policy "Allow select published for anon and authenticated" on listings
  for select to anon, authenticated using (is_published = true);

drop policy if exists "Allow select all for authenticated" on listings;
create policy "Allow select all for authenticated" on listings
  for select to authenticated using (true);

drop policy if exists "Allow insert/update/delete for authenticated only" on listings;
create policy "Allow insert/update/delete for authenticated only" on listings
  for all to authenticated using (true) with check (true);

-- suggested_updates
drop policy if exists "Allow insert for anon and authenticated" on suggested_updates;
create policy "Allow insert for anon and authenticated" on suggested_updates
  for insert to anon, authenticated with check (true);

drop policy if exists "Allow select/update/delete for authenticated only" on suggested_updates;
create policy "Allow select/update/delete for authenticated only" on suggested_updates
  for all to authenticated using (true) with check (true);
