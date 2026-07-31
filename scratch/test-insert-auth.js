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
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Signing in...');
  
  // Sign in using the credentials provided
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: '0656866025@admin.com',
    password: 'Allahakkbar2006souha'
  });

  if (authError) {
    console.error('Sign in failed:', authError);
    return;
  }

  console.log('Sign in succeeded! User UID:', authData.user.id);

  console.log('Testing university insert...');
  const { data, error } = await supabase
    .from('universities')
    .insert([
      {
        name_fr: 'Test University from Auth Script',
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
