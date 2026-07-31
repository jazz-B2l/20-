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

async function testDelete() {
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

  console.log('Sign in succeeded!');

  // Fetch one university
  const { data: univs, error: fetchError } = await supabase
    .from('universities')
    .select('id, name_fr')
    .limit(1);

  if (fetchError || !univs || univs.length === 0) {
    console.error('Failed to fetch university to delete:', fetchError);
    return;
  }

  const targetUni = univs[0];
  console.log(`Attempting to delete university: ${targetUni.name_fr} (${targetUni.id})`);

  const { error: deleteError } = await supabase
    .from('universities')
    .delete()
    .eq('id', targetUni.id);

  if (deleteError) {
    console.error('Delete failed:', deleteError);
  } else {
    console.log('Delete succeeded!');
  }
}

testDelete();
