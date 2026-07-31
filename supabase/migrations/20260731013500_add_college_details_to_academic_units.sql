-- Migration to add college application details to academic_units for 20% Master Units publishing workflow
alter table academic_units 
  add column if not exists application_link text,
  add column if not exists deadline date,
  add column if not exists master_programs text,
  add column if not exists required_documents text,
  add column if not exists notes text;
