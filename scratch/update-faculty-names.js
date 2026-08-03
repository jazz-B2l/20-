const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const arTranslations = {
  'Faculté de Chimie': 'كلية الكيمياء',
  'Faculté de Chimie ': 'كلية الكيمياء',
  'Faculté de Génie Mécanique': 'كلية الهندسة الميكانيكية',
  'Faculté des Mathématiques et Informatiques': 'كلية الرياضيات والإعلام الآلي',
  'math et info': 'كلية الرياضيات والإعلام الآلي',
  'Faculté d’Architecture et de Génie Civil': 'كلية الهندسة المعمارية والهندسة المدنية',
  "Faculté d'Architecture et de Génie Civil": 'كلية الهندسة المعمارية والهندسة المدنية',
  'Faculté de Génie Electrique': 'كلية الهندسة الكهربائية',
  'Faculté de Physique': 'كلية الفيزياء',
  'Faculté de Physique ': 'كلية الفيزياء'
}

async function main() {
  const { data: faculties, error } = await supabase.from('faculties').select('*')
  if (error) {
    console.error('Error fetching faculties:', error)
    return
  }

  for (const f of faculties) {
    const trimmed = (f.name_fr || '').trim()
    const arName = arTranslations[f.name_fr] || arTranslations[trimmed]
    if (arName) {
      console.log(`Updating faculty "${f.name_fr}" -> "${arName}"`)
      const { error: updateError } = await supabase
        .from('faculties')
        .update({ name_ar: arName })
        .eq('id', f.id)
      
      if (updateError) {
        console.error('Update error:', updateError)
      }
    }
  }

  console.log('Finished updating faculty Arabic names in Supabase!')
}

main()
