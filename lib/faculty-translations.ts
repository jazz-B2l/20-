/**
 * Utility helper to automatically translate French faculty names into Arabic or English
 */

const arFacultyMap: Record<string, string> = {
  'Faculté de Chimie': 'كلية الكيمياء',
  'Faculté de Chimie ': 'كلية الكيمياء',
  'Faculté de Génie Mécanique': 'كلية الهندسة الميكانيكية',
  'Faculté des Mathématiques et Informatiques': 'كلية الرياضيات والإعلام الآلي',
  'Faculté de Mathématiques': 'كلية الرياضيات',
  'math et info': 'كلية الرياضيات والإعلام الآلي',
  'Faculté d’Architecture et de Génie Civil': 'كلية الهندسة المعمارية والهندسة المدنية',
  "Faculté d'Architecture et de Génie Civil": 'كلية الهندسة المعمارية والهندسة المدنية',
  'Faculté d Architecture et de Génie Civil': 'كلية الهندسة المعمارية والهندسة المدنية',
  'Faculté de Génie Electrique': 'كلية الهندسة الكهربائية',
  'Faculté de Génie Électrique': 'كلية الهندسة الكهربائية',
  'Faculté de Physique': 'كلية الفيزياء',
  'Faculté de Physique ': 'كلية الفيزياء',
  'Faculté des Sciences de la Terre': 'كلية علوم الأرض والتهيأة العمرانية',
  'Faculté des Sciences Biologiques': 'كلية العلوم البيولوجية',
  'Faculté de Droit': 'كلية الحقوق',
  'Faculté de Médecine': 'كلية الطب',
  'Faculté de Pharmacie': 'كلية الصيدلة',
  'Faculté de Chirurgie Dentaire': 'كلية طب الأسنان',
  'Faculté des Sciences Économiques': 'كلية العلوم الاقتصادية والتجارية وعلوم التسيير',
  'Faculté des Sciences Économiques, Commerciales et des Sciences de Gestion': 'كلية العلوم الاقتصادية والتجارية وعلوم التسيير',
  'Faculté des Lettres et des Langues': 'كلية الآداب واللغات',
  'Faculté des Sciences Humaines et Sociales': 'كلية العلوم الإنسانية والاجتماعية',
  'Faculté des Sciences': 'كلية العلوم',
  'Faculté des Sciences et de la Technologie': 'كلية العلوم والتكنولوجيا'
}

const enFacultyMap: Record<string, string> = {
  'Faculté de Chimie': 'Faculty of Chemistry',
  'Faculté de Chimie ': 'Faculty of Chemistry',
  'Faculté de Génie Mécanique': 'Faculty of Mechanical Engineering',
  'Faculté des Mathématiques et Informatiques': 'Faculty of Mathematics and Computer Science',
  'Faculté de Mathématiques': 'Faculty of Mathematics',
  'math et info': 'Faculty of Mathematics and Computer Science',
  'Faculté d’Architecture et de Génie Civil': 'Faculty of Architecture and Civil Engineering',
  "Faculté d'Architecture et de Génie Civil": 'Faculty of Architecture and Civil Engineering',
  'Faculté d Architecture et de Génie Civil': 'Faculty of Architecture and Civil Engineering',
  'Faculté de Génie Electrique': 'Faculty of Electrical Engineering',
  'Faculté de Génie Électrique': 'Faculty of Electrical Engineering',
  'Faculté de Physique': 'Faculty of Physics',
  'Faculté de Physique ': 'Faculty of Physics',
  'Faculté des Sciences de la Terre': 'Faculty of Earth Sciences',
  'Faculté des Sciences Biologiques': 'Faculty of Biological Sciences',
  'Faculté de Droit': 'Faculty of Law',
  'Faculté de Médecine': 'Faculty of Medicine',
  'Faculté de Pharmacie': 'Faculty of Pharmacy',
  'Faculté de Chirurgie Dentaire': 'Faculty of Dental Medicine',
  'Faculté des Sciences Économiques': 'Faculty of Economics and Management',
  'Faculté des Sciences Économiques, Commerciales et des Sciences de Gestion': 'Faculty of Economics, Business and Management',
  'Faculté des Lettres et des Langues': 'Faculty of Letters and Languages',
  'Faculté des Sciences Humaines et Sociales': 'Faculty of Human and Social Sciences',
  'Faculté des Sciences': 'Faculty of Sciences',
  'Faculté des Sciences et de la Technologie': 'Faculty of Science and Technology'
}

export function translateFacultyName(nameFr: string = '', lang: string = 'en', nameAr?: string | null): string {
  if (!nameFr && !nameAr) return ''
  
  if (lang === 'ar') {
    if (nameAr && nameAr.trim()) return nameAr.trim()
    const trimmed = (nameFr || '').trim()
    return arFacultyMap[trimmed] || arFacultyMap[nameFr] || trimmed
  }

  // English translation
  const trimmed = (nameFr || '').trim()
  return enFacultyMap[trimmed] || enFacultyMap[nameFr] || trimmed
}
