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

async function testExactPayload() {
  console.log('Signing in...');
  await supabase.auth.signInWithPassword({
    email: '0656866025@admin.com',
    password: 'Allahakkbar2006souha'
  });

  // Fetch a college
  const { data: colleges } = await supabase.from('academic_units').select('*').limit(1);
  if (!colleges || colleges.length === 0) {
    console.log('No colleges to test with.');
    return;
  }
  const testCol = colleges[0];
  console.log('Testing update on college ID:', testCol.id);

  // Exact payload as handleUpdateCollege WITHOUT name_ar:
  const payload = {
    name_fr: 'Test Edit name ' + Date.now(),
    unit_type: 'faculty',
    application_link: null,
    deadline: null,
    master_programs: null,
    required_documents: null,
    notes: null
  };

  const { data, error } = await supabase
    .from('academic_units')
    .update(payload)
    .eq('id', testCol.id)
    .select();

  if (error) {
    console.error('Update Error:', error);
  } else {
    console.log('Update Succeeded!', data[0]);
  }
}

testExactPayload();
