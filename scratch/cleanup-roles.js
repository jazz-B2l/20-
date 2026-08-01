const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) process.env[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '');
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const keepRoleNames = ['owner', 'super_admin', 'admin', 'viewer'];
  
  // 1. Get all roles
  const { data: roles } = await supabase.from('roles').select('*');
  const adminRole = roles.find(r => r.name === 'admin');

  // 2. Find roles to delete
  const rolesToDelete = roles.filter(r => !keepRoleNames.includes(r.name));

  for (const r of rolesToDelete) {
    // Reassign any users with this role to 'admin'
    await supabase.from('user_roles').update({ role_id: adminRole.id }).eq('role_id', r.id);
    // Delete unused role
    await supabase.from('roles').delete().eq('id', r.id);
  }

  const { data: finalRoles } = await supabase.from('roles').select('*');
  console.log('Final roles in DB:', finalRoles);
}

run();
