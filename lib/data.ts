'use server'

import { createClient } from '@/lib/supabase/server'
import { WILAYAS } from './wilayas'

export async function getListings(filters?: {
  search?: string
  wilaya?: string
  domainId?: string
  level?: string
}) {
  const supabase = await createClient()

  // 1. Fetch published admission windows (program listings)
  const { data: winData, error: winError } = await supabase
    .from('admission_windows')
    .select(`
      id,
      seats,
      deadline,
      portal_url,
      is_published,
      academic_year,
      last_verified_at,
      program:programs(
        id,
        title_fr,
        title_ar,
        level,
        description_fr,
        description_ar,
        university:universities(id, name, city, wilaya, website, logo_url),
        faculty:faculties(id, name_fr, unit_type, application_link, deadline, master_programs, required_documents, notes),
        domain:domains(id, name_fr, name_ar)
      )
    `)
    .eq('is_published', true)

  if (winError) {
    console.error('Error fetching admission windows:', winError)
  }

  // 2. Fetch published faculties (college/unit listings)
  const { data: facData, error: facError } = await supabase
    .from('faculties')
    .select(`
      id,
      name_fr,
      unit_type,
      application_link,
      deadline,
      master_programs,
      required_documents,
      notes,
      workflow_status,
      university:universities(id, name, city, wilaya, website, logo_url)
    `)
    .eq('workflow_status', 'published')

  if (facError) {
    console.error('Error fetching faculties:', facError)
  }

  // Normalize admission windows
  const winListings = (winData || []).map((win: any) => {
    const prog = win.program || {}
    const uni = prog.university || {}
    const fac = prog.faculty || {}
    const dom = prog.domain || {}

    return {
      id: win.id,
      specialty_fr: prog.title_fr || '',
      specialty_ar: prog.title_ar || '',
      level: prog.level || 'M1 / M2',
      seats: win.seats || 0,
      deadline: win.deadline || fac.deadline || uni.deadline || '',
      portal_url: win.portal_url || fac.application_link || uni.website || '',
      is_published: win.is_published,
      academic_year: win.academic_year || '2025/2026',
      prerequisites_fr: prog.description_fr || null,
      prerequisites_ar: prog.description_ar || null,
      master_programs: fac.master_programs || null,
      required_documents: fac.required_documents || null,
      notes: fac.notes || null,
      faculty_name: fac.name_fr || null,
      unit_type: fac.unit_type || 'faculty',
      university: {
        id: uni.id || '',
        name_fr: uni.name || '',
        name_ar: '',
        city: uni.city || '',
        wilaya: uni.wilaya || '',
        logo_url: null,
        website_url: uni.website || ''
      },
      domain: {
        id: dom.id || '',
        name_fr: dom.name_fr || 'Général',
        name_ar: dom.name_ar || 'عام'
      }
    }
  })

  // Normalize faculty listings
  const facListings = (facData || []).map((fac: any) => {
    const uni = fac.university || {}

    return {
      id: fac.id,
      specialty_fr: uni.name || (fac.name_fr ? `Faculté: ${fac.name_fr}` : 'Offres 20% Master'),
      specialty_ar: uni.name || (fac.name_fr ? `كلية: ${fac.name_fr}` : 'عروض الماجستير 20%'),
      level: 'M1 / M2',
      seats: 0,
      deadline: fac.deadline || uni.deadline || '',
      portal_url: fac.application_link || uni.website || '',
      is_published: true,
      academic_year: '2025/2026',
      prerequisites_fr: null,
      prerequisites_ar: null,
      master_programs: fac.master_programs || null,
      required_documents: fac.required_documents || null,
      notes: fac.notes || null,
      faculty_name: fac.name_fr || null,
      unit_type: fac.unit_type || 'faculty',
      university: {
        id: uni.id || '',
        name_fr: uni.name || '',
        name_ar: '',
        city: uni.city || '',
        wilaya: uni.wilaya || '',
        logo_url: null,
        website_url: uni.website || ''
      },
      domain: {
        id: '',
        name_fr: 'Tous Domaines',
        name_ar: 'جميع المجالات'
      }
    }
  })

  let results = [...winListings, ...facListings]

  // Apply filters in JS
  if (filters?.level) {
    results = results.filter((r: any) => r.level.includes(filters.level!))
  }

  if (filters?.domainId) {
    results = results.filter((r: any) => r.domain?.id === filters.domainId)
  }

  if (filters?.wilaya) {
    results = results.filter(
      (r: any) => r.university?.wilaya?.toLowerCase() === filters.wilaya?.toLowerCase()
    )
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    results = results.filter(
      (r: any) =>
        r.specialty_fr?.toLowerCase().includes(searchLower) ||
        r.specialty_ar?.toLowerCase().includes(searchLower) ||
        r.university?.name_fr?.toLowerCase().includes(searchLower) ||
        r.faculty_name?.toLowerCase().includes(searchLower) ||
        r.master_programs?.toLowerCase().includes(searchLower)
    )
  }

  return results
}

export async function getListingById(id: string) {
  const supabase = await createClient()

  // Try fetching from admission_windows first
  const { data: win, error: winErr } = await supabase
    .from('admission_windows')
    .select(`
      id,
      seats,
      deadline,
      portal_url,
      is_published,
      academic_year,
      last_verified_at,
      program:programs(
        id,
        title_fr,
        title_ar,
        level,
        description_fr,
        description_ar,
        university:universities(id, name, city, wilaya, website),
        faculty:faculties(id, name_fr, unit_type, application_link, deadline, master_programs, required_documents, notes),
        domain:domains(id, name_fr, name_ar)
      )
    `)
    .eq('id', id)
    .single()

  if (win && !winErr) {
    const prog = win.program || {}
    const uni = prog.university || {}
    const fac = prog.faculty || {}
    const dom = prog.domain || {}

    return {
      id: win.id,
      specialty_fr: prog.title_fr || '',
      specialty_ar: prog.title_ar || '',
      level: prog.level || 'M1 / M2',
      seats: win.seats || 0,
      deadline: win.deadline || fac.deadline || uni.deadline || '',
      portal_url: win.portal_url || fac.application_link || uni.website || '',
      is_published: win.is_published,
      prerequisites_fr: prog.description_fr || null,
      prerequisites_ar: prog.description_ar || null,
      master_programs: fac.master_programs || null,
      required_documents: fac.required_documents || null,
      notes: fac.notes || null,
      faculty_name: fac.name_fr || null,
      unit_type: fac.unit_type || 'faculty',
      last_verified_at: win.last_verified_at,
      academic_year: win.academic_year || '2025/2026',
      university: {
        id: uni.id || '',
        name_fr: uni.name || '',
        name_ar: '',
        city: uni.city || '',
        wilaya: uni.wilaya || '',
        logo_url: null,
        website_url: uni.website || ''
      },
      domain: {
        name_fr: dom.name_fr || 'Général',
        name_ar: dom.name_ar || 'عام'
      }
    }
  }

  // Fallback to faculties table
  const { data: fac, error: facErr } = await supabase
    .from('faculties')
    .select(`
      id,
      name_fr,
      unit_type,
      application_link,
      deadline,
      master_programs,
      required_documents,
      notes,
      university:universities(id, name, city, wilaya, website)
    `)
    .eq('id', id)
    .single()

  if (fac && !facErr) {
    const uni = fac.university || {}
    return {
      id: fac.id,
      specialty_fr: uni.name || (fac.name_fr ? `Faculté: ${fac.name_fr}` : 'Offres 20% Master'),
      specialty_ar: uni.name || (fac.name_fr ? `كلية: ${fac.name_fr}` : 'عروض الماجستير 20%'),
      level: 'M1 / M2',
      seats: 0,
      deadline: fac.deadline || uni.deadline || '',
      portal_url: fac.application_link || uni.website || '',
      is_published: true,
      prerequisites_fr: null,
      prerequisites_ar: null,
      master_programs: fac.master_programs || null,
      required_documents: fac.required_documents || null,
      notes: fac.notes || null,
      faculty_name: fac.name_fr || null,
      unit_type: fac.unit_type || 'faculty',
      last_verified_at: null,
      academic_year: '2025/2026',
      university: {
        id: uni.id || '',
        name_fr: uni.name || '',
        name_ar: '',
        city: uni.city || '',
        wilaya: uni.wilaya || '',
        logo_url: null,
        website_url: uni.website || ''
      },
      domain: {
        name_fr: 'Tous Domaines',
        name_ar: 'جميع المجالات'
      }
    }
  }

  return null
}

export async function getDomains() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .eq('workflow_status', 'published')
    .order('name_fr', { ascending: true })

  if (error) {
    console.error('Error fetching domains:', error)
    return []
  }

  return data || []
}

export async function getUniversities() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .eq('workflow_status', 'published')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching universities:', error)
    return []
  }

  return data || []
}

export async function getWilayas() {
  return WILAYAS.map(w => ({
    id: w.id,
    name_fr: w.name_fr,
    name_ar: w.name_ar
  }))
}

export async function submitCorrection(listingId: string, message: string, email?: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('suggested_updates')
    .insert([
      {
        listing_id: listingId,
        message: message,
        contact_email: email || null,
        verification_status: 'pending'
      },
    ])

  if (error) {
    console.error('Error submitting suggested updates:', error)
    throw error
  }

  return true
}
