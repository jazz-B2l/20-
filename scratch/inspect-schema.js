const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

try {
  const env = fs.readFileSync('.env', 'utf8');
  const lines = env.split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  }
} catch (e) {
  console.error('Failed to parse .env file', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  const { data: rows, error } = await supabase.from('universities').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Universities columns:', Object.keys(rows[0] || {}));
  }
}

inspectSchema();
