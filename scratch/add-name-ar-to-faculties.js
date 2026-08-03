const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE faculties ADD COLUMN IF NOT EXISTS name_ar TEXT;'
  })
  if (error) {
    console.log('RPC exec_sql error (expected if exec_sql rpc is not enabled):', error.message)
  } else {
    console.log('Successfully added column name_ar to faculties!')
  }
}

main()
