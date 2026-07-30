'use server'

import { createClient } from '@/lib/supabase/server'

export async function getListings(filters?: {
  search?: string
  wilaya?: string
  domainId?: string
  level?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select(`
      *,
      university:universities(name_fr, name_ar, city, wilaya, logo_url),
      domain:domains(name_fr, name_ar)
    `)
    .eq('is_published', true)
    .order('deadline', { ascending: true })

  if (filters?.wilaya) {
    query = query.eq('university.wilaya', filters.wilaya)
  }

  if (filters?.domainId) {
    query = query.eq('domain_id', filters.domainId)
  }

  if (filters?.level) {
    query = query.eq('level', filters.level)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching listings:', error)
    return []
  }

  return data || []
}

export async function getListingById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      university:universities(id, name_fr, name_ar, city, wilaya, logo_url, website_url),
      domain:domains(name_fr, name_ar)
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error) {
    console.error('Error fetching listing:', error)
    return null
  }

  return data
}

export async function getDomains() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('domains')
    .select('*')
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
    .order('name_fr', { ascending: true })

  if (error) {
    console.error('Error fetching universities:', error)
    return []
  }

  return data || []
}

export async function getWilayas() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('universities')
    .select('wilaya')
    .order('wilaya', { ascending: true })

  if (error) {
    console.error('Error fetching wilayas:', error)
    return []
  }

  // Remove duplicates
  const wilayas = [...new Set(data?.map(d => d.wilaya) || [])]
  return wilayas.sort()
}

export async function submitCorrection(listingId: string, message: string, email?: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('suggested_updates')
    .insert([
      {
        listing_id: listingId,
        message,
        contact_email: email || null,
      },
    ])

  if (error) {
    console.error('Error submitting correction:', error)
    throw error
  }

  return true
}
