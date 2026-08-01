-- Migration to add is_open column to faculties table for status override switcher
alter table faculties
  add column if not exists is_open boolean default true;
