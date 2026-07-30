create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_listings_updated_at on listings;
create trigger set_listings_updated_at
  before update on listings
  for each row
  execute function set_updated_at();
