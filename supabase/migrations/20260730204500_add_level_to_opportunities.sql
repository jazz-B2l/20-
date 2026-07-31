-- Add level column to opportunities
alter table opportunities 
add column if not exists level text check (level in ('M1', 'M2'));
