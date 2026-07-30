create index if not exists listings_university_id_idx on listings(university_id);
create index if not exists listings_domain_id_idx on listings(domain_id);
create index if not exists listings_type_idx on listings(type);
create index if not exists listings_is_published_idx on listings(is_published);
create index if not exists listings_application_deadline_idx on listings(application_deadline);
create index if not exists listings_academic_year_idx on listings(academic_year);
create index if not exists universities_wilaya_idx on universities(wilaya);
create index if not exists suggested_updates_status_idx on suggested_updates(status);
