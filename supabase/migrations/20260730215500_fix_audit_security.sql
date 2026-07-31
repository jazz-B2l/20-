-- Change log_audit_action trigger function to SECURITY DEFINER so that it runs with creator (superuser) privileges.
-- This allows the audit log inserts to succeed without violating RLS policies, regardless of the calling user's permissions,
-- and avoids exposing raw INSERT privileges on the audit_logs table to the REST API.
create or replace function log_audit_action()
returns trigger as $$
declare
  val_created_by uuid;
  val_updated_by uuid;
  rec_id uuid;
  new_jsonb jsonb;
  old_jsonb jsonb;
begin
  new_jsonb := to_jsonb(new);
  
  -- Extract record ID (checking for 'id' or 'user_id')
  if (new_jsonb ? 'id') then
    rec_id := (new_jsonb ->> 'id')::uuid;
  elsif (new_jsonb ? 'user_id') then
    rec_id := (new_jsonb ->> 'user_id')::uuid;
  end if;

  if (tg_op = 'INSERT') then
    if (new_jsonb ? 'created_by') then
      val_created_by := (new_jsonb ->> 'created_by')::uuid;
    end if;
    
    insert into audit_logs (user_id, action, table_name, record_id, new_data)
    values (val_created_by, 'insert', tg_table_name, rec_id, row_to_json(new));
    return new;
  elsif (tg_op = 'UPDATE') then
    old_jsonb := to_jsonb(old);
    
    if (new_jsonb ? 'updated_by') then
      val_updated_by := (new_jsonb ->> 'updated_by')::uuid;
    end if;
    
    if (new_jsonb ? 'workflow_status' and old_jsonb ? 'workflow_status' and (new_jsonb ->> 'workflow_status') = 'archived' and (old_jsonb ->> 'workflow_status') != 'archived') then
      insert into audit_logs (user_id, action, table_name, record_id, old_data, new_data)
      values (val_updated_by, 'soft_delete', tg_table_name, rec_id, row_to_json(old), row_to_json(new));
    else
      insert into audit_logs (user_id, action, table_name, record_id, old_data, new_data)
      values (val_updated_by, 'update', tg_table_name, rec_id, row_to_json(old), row_to_json(new));
    end if;
    return new;
  end if;
  return null;
end;
$$ language plpgsql security definer;
