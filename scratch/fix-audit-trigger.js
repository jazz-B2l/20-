const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.abhcxhthgofoymvpxqdf',
    password: 'Allahakkbar2006souha',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected successfully to database!");

    // 1. Create or replace the log_audit_action function with auth.uid() fallback
    const updateFunctionQuery = `
      CREATE OR REPLACE FUNCTION public.log_audit_action()
      RETURNS trigger AS $$
      DECLARE
        val_created_by uuid;
        val_updated_by uuid;
        rec_id uuid;
        new_jsonb jsonb;
        old_jsonb jsonb;
      BEGIN
        new_jsonb := to_jsonb(new);
        
        -- Extract record ID (checking for 'id' or 'user_id')
        IF (new_jsonb ? 'id') THEN
          rec_id := (new_jsonb ->> 'id')::uuid;
        ELSIF (new_jsonb ? 'user_id') THEN
          rec_id := (new_jsonb ->> 'user_id')::uuid;
        END IF;

        IF (tg_op = 'INSERT') THEN
          IF (new_jsonb ? 'created_by') THEN
            val_created_by := (new_jsonb ->> 'created_by')::uuid;
          END IF;
          IF (val_created_by IS NULL) THEN
            val_created_by := auth.uid();
          END IF;
          
          INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
          VALUES (val_created_by, 'insert', tg_table_name, rec_id, row_to_json(new));
          RETURN new;
        ELSIF (tg_op = 'UPDATE') THEN
          old_jsonb := to_jsonb(old);
          
          IF (new_jsonb ? 'updated_by') THEN
            val_updated_by := (new_jsonb ->> 'updated_by')::uuid;
          END IF;
          IF (val_updated_by IS NULL) THEN
            val_updated_by := auth.uid();
          END IF;
          
          IF (new_jsonb ? 'workflow_status' AND old_jsonb ? 'workflow_status' AND (new_jsonb ->> 'workflow_status') = 'archived' AND (old_jsonb ->> 'workflow_status') != 'archived') THEN
            INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
            VALUES (val_updated_by, 'soft_delete', tg_table_name, rec_id, row_to_json(old), row_to_json(new));
          ELSE
            INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
            VALUES (val_updated_by, 'update', tg_table_name, rec_id, row_to_json(old), row_to_json(new));
          END IF;
          RETURN new;
        END IF;
        RETURN null;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    console.log("Updating trigger function...");
    await client.query(updateFunctionQuery);

    // 2. Fetch the first user to map existing NULL logs
    const userRes = await client.query(`SELECT user_id, name, email FROM public.user_roles LIMIT 1;`);
    if (userRes.rows.length > 0) {
      const firstUser = userRes.rows[0];
      console.log(`Found user: ${firstUser.name || firstUser.email} (${firstUser.user_id})`);
      
      // Update existing null user_id logs
      console.log("Updating existing audit logs with NULL user_id...");
      const updateLogsRes = await client.query(`
        UPDATE public.audit_logs 
        SET user_id = $1 
        WHERE user_id IS NULL;
      `, [firstUser.user_id]);
      console.log(`Updated ${updateLogsRes.rowCount} historical logs.`);
    } else {
      console.log("No users found in user_roles to backfill historical logs.");
    }

    // 3. Reload PostgREST schema
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log("Schema reload request sent.");

    await client.end();
    console.log("Audit log fallback successfully deployed!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    try {
      await client.end();
    } catch(e) {}
  }
}

main().catch(console.error);
