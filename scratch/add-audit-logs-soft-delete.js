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

    // 1. Add deleted_at column to audit_logs
    console.log("Adding deleted_at column to public.audit_logs...");
    await client.query(`ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT null;`);

    // 2. Drop existing policy if exists and create a new ALL policy for super_admin and owner
    console.log("Updating RLS policies for public.audit_logs...");
    await client.query(`DROP POLICY IF EXISTS "Superadmins manage audit logs" ON public.audit_logs;`);
    await client.query(`
      CREATE POLICY "Superadmins manage audit logs" 
      ON public.audit_logs FOR ALL 
      TO authenticated 
      USING (public.get_my_role() in ('owner', 'super_admin'))
      WITH CHECK (public.get_my_role() in ('owner', 'super_admin'));
    `);

    // 3. Reload PostgREST schema
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log("Schema reload request sent.");

    await client.end();
    console.log("Migration successfully executed!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    try {
      await client.end();
    } catch(e) {}
  }
}

main().catch(console.error);
