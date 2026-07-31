-- Drop audit logging triggers on unnecessary tables
drop trigger if exists log_opportunities_audit on opportunities;
drop trigger if exists log_sessions_audit on sessions;
drop trigger if exists log_events_audit on events;
drop trigger if exists log_required_documents_audit on required_documents;
drop trigger if exists log_announcements_audit on announcements;
drop trigger if exists log_domains_audit on domains;

-- Drop set_updated_at triggers on unnecessary tables
drop trigger if exists set_opportunities_updated_at on opportunities;
drop trigger if exists set_sessions_updated_at on sessions;
drop trigger if exists set_events_updated_at on events;
drop trigger if exists set_required_documents_updated_at on required_documents;
drop trigger if exists set_announcements_updated_at on announcements;
drop trigger if exists set_domains_updated_at on domains;

-- Drop unnecessary tables cascade
drop table if exists announcements cascade;
drop table if exists events cascade;
drop table if exists required_documents cascade;
drop table if exists sessions cascade;
drop table if exists opportunities cascade;
drop table if exists domains cascade;
drop table if exists saved_items cascade;
