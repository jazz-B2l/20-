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
    
    // Add name column to user_roles
    const queries = [
      `ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS name text;`,
      `NOTIFY pgrst, 'reload schema';`
    ];

    for (const q of queries) {
      console.log(`Running query: ${q}`);
      await client.query(q);
    }

    await client.end();
    console.log("Database updated successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    try {
      await client.end();
    } catch(e) {}
  }
}

main().catch(console.error);
