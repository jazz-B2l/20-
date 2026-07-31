-- Add message column to sources to store community suggested updates messages
alter table sources 
add column if not exists message text;
