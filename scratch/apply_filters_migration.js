const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
    console.log("Connected successfully to pooler!");
    
    const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260802190000_create_custom_filters_table.sql'), 'utf8');
    
    await client.query(sql);
    await client.query(`GRANT ALL ON public.custom_filters TO anon, authenticated, service_role; NOTIFY pgrst, 'reload schema';`);
    
    await client.end();
    console.log("Custom filters migration executed successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    try {
      await client.end();
    } catch(e) {}
  }
}

main().catch(console.error);
