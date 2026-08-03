const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  const { data: faculties, error } = await supabase.from('faculties').select('*')
  if (error) {
    console.error('Error fetching faculties:', error)
    return
  }
  console.log('Found faculties:', faculties)
}

main()
