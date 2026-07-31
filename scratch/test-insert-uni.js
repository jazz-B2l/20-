const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple env file parser
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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing university insert...');
  const { data, error } = await supabase
    .from('universities')
    .insert([
      {
        name_fr: 'Test University from Script',
        wilaya: 'Alger',
        city: 'Bab Ezzouar',
        workflow_status: 'published'
      }
    ])
    .select();

  if (error) {
    console.error('Insert failed:', error);
  } else {
    console.log('Insert succeeded!', data);
  }
}

testInsert();
