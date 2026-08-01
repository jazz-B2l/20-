'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  School,
  ArrowLeft,
  Settings,
  Grid,
  List,
  Network,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Trash2,
  Edit,
  Search,
  Plus,
  Calendar,
  Link as LinkIcon,
  BookOpen,
  FileText,
  Scale,
  Languages,
  Binary,
  HeartPulse,
  Leaf,
  TrendingUp,
  Atom,
  Check,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react'

// Icon mapping helper for domain filters
function getDomainIcon(nameFr: string) {
  const normalized = nameFr.toLowerCase()
  if (normalized.includes('droit') || normalized.includes('politique')) {
    return Scale
  }
  if (normalized.includes('lettre') || normalized.includes('langue')) {
    return Languages
  }
  if (normalized.includes('math') || normalized.includes('informatique')) {
    return Binary
  }
  if (normalized.includes('méd') || normalized.includes('santé') || normalized.includes('medecine')) {
    return HeartPulse
  }
  if (normalized.includes('nature') || normalized.includes('vie') || normalized.includes('dnas')) {
    return Leaf
  }
  if (normalized.includes('écon') || normalized.includes('gestion') || normalized.includes('bus')) {
    return TrendingUp
  }
  if (normalized.includes('techno') || normalized.includes('sciences et tech')) {
    return Atom
  }
  if (normalized.includes('humaine') || normalized.includes('sociale')) {
    return Users
  }
  return BookOpen
}

// 58 Algerian Wilayas dataset with coordinates
export const WILAYAS = [
  { id: 1, arabic: 'أدرار', french: 'Adrar', latitude: 26.4888155, longitude: -1.3582442 },
  { id: 2, arabic: 'الشلف', french: 'Chlef', latitude: 36.20342, longitude: 1.2680696 },
  { id: 3, arabic: 'الأغواط', french: 'Laghouat', latitude: 33.7504405, longitude: 2.6431094 },
  { id: 4, arabic: 'أم البواقي', french: 'Oum El Bouaghi', latitude: 35.8105805, longitude: 7.0184178 },
  { id: 5, arabic: 'باتنة', french: 'Batna', latitude: 35.3384291, longitude: 5.7315453 },
  { id: 6, arabic: 'بجاية', french: 'Béjaïa', latitude: 36.5569005, longitude: 4.7858925 },
  { id: 7, arabic: 'بسكرة', french: 'Biskra', latitude: 34.7845635, longitude: 5.8124353 },
  { id: 8, arabic: 'بشار', french: 'Béchar', latitude: 31.385726, longitude: -2.0115958 },
  { id: 9, arabic: 'البليدة', french: 'Blida', latitude: 36.5012595, longitude: 2.9517666 },
  { id: 10, arabic: 'البويرة', french: 'Bouira', latitude: 36.2316481, longitude: 3.9082579 },
  { id: 11, arabic: 'تمنراست', french: 'Tamanrasset', latitude: 24.3753438, longitude: 4.3208436 },
  { id: 12, arabic: 'تبسة', french: 'Tébessa', latitude: 35.124945, longitude: 7.9011735 },
  { id: 13, arabic: 'تلمسان', french: 'Tlemcen', latitude: 34.667468, longitude: -1.2978132 },
  { id: 14, arabic: 'تيارت', french: 'Tiaret', latitude: 34.8947575, longitude: 1.5945792 },
  { id: 15, arabic: 'تيزي وزو', french: 'Tizi Ouzou', latitude: 36.6816175, longitude: 4.237186 },
  { id: 16, arabic: 'الجزائر', french: 'Alger', latitude: 36.700051, longitude: 3.0291266 },
  { id: 17, arabic: 'الجلفة', french: 'Djelfa', latitude: 34.342841, longitude: 3.2172531 },
  { id: 18, arabic: 'جيجل', french: 'Jijel', latitude: 36.7292188, longitude: 5.9607776 },
  { id: 19, arabic: 'سطيف', french: 'Sétif', latitude: 36.105661, longitude: 5.5620276 },
  { id: 20, arabic: 'سعيدة', french: 'Saïda', latitude: 34.743349, longitude: 0.2440764 },
  { id: 21, arabic: 'سكيكدة', french: 'Skikda', latitude: 36.7545115, longitude: 6.8856255 },
  { id: 22, arabic: 'سيدي بلعباس', french: 'Sidi Bel Abbès', latitude: 34.682268, longitude: -0.4357555 },
  { id: 23, arabic: 'عنابة', french: 'Annaba', latitude: 36.8438878, longitude: 7.5983068 },
  { id: 24, arabic: 'قالمة', french: 'Guelma', latitude: 36.3491635, longitude: 7.409499 },
  { id: 25, arabic: 'قسنطينة', french: 'Constantine', latitude: 36.3584165, longitude: 6.6671674 },
  { id: 26, arabic: 'المدية', french: 'Médéa', latitude: 35.9752045, longitude: 3.0123504 },
  { id: 27, arabic: 'مستغانم', french: 'Mostaganem', latitude: 36.0026915, longitude: 0.3686867 },
  { id: 28, arabic: 'المسيلة', french: "M'Sila", latitude: 35.1300205, longitude: 4.2003107 },
  { id: 29, arabic: 'معسكر', french: 'Mascara', latitude: 35.3978385, longitude: 0.2430195 },
  { id: 30, arabic: 'ورقلة', french: 'Ouargla', latitude: 31.92823306, longitude: 5.27516681 },
  { id: 31, arabic: 'وهران', french: 'Oran', latitude: 35.6215862, longitude: -0.7016143 },
  { id: 32, arabic: 'البيض', french: 'El Bayadh', latitude: 32.570303, longitude: 1.1259581 },
  { id: 33, arabic: 'إليزي', french: 'Illizi', latitude: 27.8528505, longitude: 7.8189636 },
  { id: 34, arabic: 'برج بوعريريج', french: 'Bordj Bou Arreridj', latitude: 36.0962029, longitude: 4.6602742 },
  { id: 35, arabic: 'بومرداس', french: 'Boumerdès', latitude: 36.7358032, longitude: 3.6163046 },
  { id: 36, arabic: 'الطارف', french: 'El Tarf', latitude: 36.6713563, longitude: 8.070134 },
  { id: 37, arabic: 'تندوف', french: 'Tindouf', latitude: 27.543907, longitude: -6.2399251 },
  { id: 38, arabic: 'تيسمسيلت', french: 'Tissemsilt', latitude: 35.7858975, longitude: 1.8340957 },
  { id: 39, arabic: 'الوادي', french: 'El Oued', latitude: 33.215441, longitude: 7.1553214 },
  { id: 40, arabic: 'خنشلة', french: 'Khenchela', latitude: 34.9133455, longitude: 6.9059431 },
  { id: 41, arabic: 'سوق أهراس', french: 'Souk Ahras', latitude: 36.1378681, longitude: 7.8262426 },
  { id: 42, arabic: 'تيبازة', french: 'Tipaza', latitude: 36.527157, longitude: 2.1672012 },
  { id: 43, arabic: 'ميلة', french: 'Mila', latitude: 36.2502135, longitude: 6.1652163 },
  { id: 44, arabic: 'عين الدفلة', french: 'Aïn Defla', latitude: 36.1586843, longitude: 2.0842817 },
  { id: 45, arabic: 'النعامة', french: 'Naâma', latitude: 33.2336851, longitude: -0.8151958 },
  { id: 46, arabic: 'عين تيموشنت', french: 'Aïn Témouchent', latitude: 35.3651297, longitude: -0.9452171 },
  { id: 47, arabic: 'غرداية', french: 'Ghardaïa', latitude: 32.440827, longitude: 3.5618209 },
  { id: 48, arabic: 'غليزان', french: 'Relizane', latitude: 35.8363185, longitude: 0.9118537 },
  { id: 49, arabic: 'تيميمون', french: 'Timimoun', latitude: 29.26631963, longitude: 0.23483276 },
  { id: 50, arabic: 'برج باجي مختار', french: 'Bordj Badji Mokhtar', latitude: 21.32437224, longitude: 0.94928741 },
  { id: 51, arabic: 'بني عباس', french: 'Beni Abbes', latitude: 30.1317426, longitude: -2.169031 },
  { id: 52, arabic: 'أولاد جلال', french: 'Ouled Djellal', latitude: 34.4254103, longitude: 5.0644342 },
  { id: 53, arabic: 'عين صالح', french: 'In Salah', latitude: 27.19902208, longitude: 2.48016357 },
  { id: 54, arabic: 'عين قزام', french: 'In Guezzam', latitude: 19.5704491, longitude: 5.76953888 },
  { id: 55, arabic: 'تقرت', french: 'Touggourt', latitude: 33.1098968, longitude: 6.066102 },
  { id: 56, arabic: 'جانت', french: 'Djanet', latitude: 24.55149974, longitude: 9.48669434 },
  { id: 57, arabic: 'المغير', french: 'El Mghair', latitude: 33.9496809, longitude: 5.921089 },
  { id: 58, arabic: 'المنيعة', french: 'El Menia', latitude: 30.5841144, longitude: 2.88219452 }
]

export function UniversitiesTab() {
  const supabase = createClient()
  const router = useRouter()
  const [universities, setUniversities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Views toggle: grid vs list
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState('')

  // Detail sub-dashboard selection state
  const [selectedUni, setSelectedUni] = useState<any | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'colleges' | 'settings'>('colleges')

  // Colleges (Academic Units) list for selected university
  const [uniColleges, setUniColleges] = useState<any[]>([])

  // Modal Dialogs state for Universities
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUni, setEditingUni] = useState<any | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [uniToDelete, setUniToDelete] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Modal Dialogs state for Colleges
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false)
  const [isEditCollegeOpen, setIsEditCollegeOpen] = useState(false)
  const [isDeleteCollegeOpen, setIsDeleteCollegeOpen] = useState(false)
  const [collegeToEdit, setCollegeToEdit] = useState<any | null>(null)
  const [collegeToDelete, setCollegeToDelete] = useState<any | null>(null)
  const [deletingCollege, setDeletingCollege] = useState(false)

  // Form states for University
  const emptyForm = {
    name: '',
    wilaya: '',
    city: '',
    website: '',
    email: '',
    description_fr: '',
    description_ar: '',
    location_gps: '',
    ranking: '1',
    deadline: '',
    logo: ''
  }

  const [addFormData, setAddFormData] = useState(emptyForm)
  const [editFormData, setEditFormData] = useState(emptyForm)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `uni-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      const logoUrl = data.publicUrl
      
      if (isEdit) {
        setEditFormData(prev => ({ ...prev, logo: logoUrl }))
      } else {
        setAddFormData(prev => ({ ...prev, logo: logoUrl }))
      }
      
      alert('Logo uploaded successfully!')
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      alert('Error uploading logo: ' + error.message)
    } finally {
      setUploadingLogo(false)
    }
  }

  // Form states for College
  const emptyCollegeForm = {
    name_fr: '',
    name_ar: '',
    unit_type: 'faculty',
    application_link: '',
    deadline: '',
    master_programs: '',
    required_documents: '',
    notes: '',
    domain_id: '',
    is_open: true
  }
  const [collegeFormData, setCollegeFormData] = useState(emptyCollegeForm)

  const [domains, setDomains] = useState<any[]>([])
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false)
  const [isEditDomainOpen, setIsEditDomainOpen] = useState(false)
  const [addDomainSearch, setAddDomainSearch] = useState('')
  const [editDomainSearch, setEditDomainSearch] = useState('')

  const addDomainRef = useRef<HTMLDivElement>(null)
  const editDomainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadDomains()
  }, [])

  const loadDomains = async () => {
    const { data } = await supabase
      .from('domains')
      .select('*')
      .eq('workflow_status', 'published')
      .order('name_fr', { ascending: true })
    setDomains(data || [])
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addDomainRef.current && !addDomainRef.current.contains(event.target as Node)) {
        setIsAddDomainOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editDomainRef.current && !editDomainRef.current.contains(event.target as Node)) {
        setIsEditDomainOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    loadUniversities()
  }, [])

  // Load colleges when university is selected
  useEffect(() => {
    if (!selectedUni) return
    loadColleges()

    // Pre-fill edit form for settings tab
    setEditFormData({
      name: selectedUni.name || '',
      wilaya: selectedUni.wilaya || '',
      city: selectedUni.city || '',
      website: selectedUni.website || '',
      email: selectedUni.email || '',
      description_fr: selectedUni.description_fr || '',
      description_ar: selectedUni.description_ar || '',
      location_gps: selectedUni.location_gps || '',
      ranking: String(selectedUni.ranking || '1'),
      deadline: selectedUni.deadline || '',
      logo: selectedUni.logo || ''
    })
  }, [selectedUni])

  const loadUniversities = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name')

    if (!error) {
      setUniversities(data || [])
    } else {
      console.error('Error loading universities:', error)
    }
    setLoading(false)
  }

  const loadColleges = async () => {
    if (!selectedUni) return
    const { data: units } = await supabase
      .from('faculties')
      .select('*')
      .eq('university_id', selectedUni.id)
      .order('name_fr')
    setUniColleges(units || [])
  }

  // CREATE UNIVERSITY
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addFormData.name || !addFormData.wilaya || !addFormData.city) {
      alert('Please fill in required fields: Name, Wilaya, and City.')
      return
    }

    const { error } = await supabase
      .from('universities')
      .insert([
        {
          name: addFormData.name,
          wilaya: addFormData.wilaya,
          city: addFormData.city,
          website: addFormData.website || null,
          email: addFormData.email || null,
          description_fr: addFormData.description_fr || null,
          description_ar: addFormData.description_ar || null,
          location_gps: addFormData.location_gps || null,
          ranking: parseInt(addFormData.ranking) || 1,
          deadline: addFormData.deadline || null,
          logo: addFormData.logo || null,
          workflow_status: 'published'
        }
      ])

    if (!error) {
      alert('University added successfully!')
      setAddFormData(emptyForm)
      setIsAddOpen(false)
      loadUniversities()
      router.refresh()
    } else {
      console.error('Error inserting university:', error)
      alert('Error adding university: ' + error.message)
    }
  }

  // Quick Edit Trigger
  const openEditModal = (uni: any) => {
    setEditingUni(uni)
    setEditFormData({
      name: uni.name || '',
      wilaya: uni.wilaya || '',
      city: uni.city || '',
      website: uni.website || '',
      email: uni.email || '',
      description_fr: uni.description_fr || '',
      description_ar: uni.description_ar || '',
      location_gps: uni.location_gps || '',
      ranking: String(uni.ranking || '1'),
      deadline: uni.deadline || '',
      logo: uni.logo || ''
    })
    setIsEditOpen(true)
  }

  // UPDATE UNIVERSITY
  const handleUpdateSubmit = async (e: React.FormEvent, targetUniId?: string) => {
    e.preventDefault()
    const idToUpdate = targetUniId || (selectedUni ? selectedUni.id : editingUni?.id)
    if (!idToUpdate) return

    const { error } = await supabase
      .from('universities')
      .update({
        name: editFormData.name,
        wilaya: editFormData.wilaya,
        city: editFormData.city,
        website: editFormData.website || null,
        email: editFormData.email || null,
        description_fr: editFormData.description_fr || null,
        description_ar: editFormData.description_ar || null,
        location_gps: editFormData.location_gps || null,
        ranking: parseInt(editFormData.ranking) || 1,
        deadline: editFormData.deadline || null,
        logo: editFormData.logo || null
      })
      .eq('id', idToUpdate)

    if (!error) {
      alert('University details updated successfully!')
      setIsEditOpen(false)
      if (selectedUni && selectedUni.id === idToUpdate) {
        setSelectedUni({
          ...selectedUni,
          name: editFormData.name,
          wilaya: editFormData.wilaya,
          city: editFormData.city,
          website: editFormData.website || null,
          email: editFormData.email || null,
          description_fr: editFormData.description_fr || null,
          description_ar: editFormData.description_ar || null,
          location_gps: editFormData.location_gps || null,
          ranking: parseInt(editFormData.ranking) || 1,
          deadline: editFormData.deadline || null,
          logo: editFormData.logo || null
        })
      }
      loadUniversities()
      router.refresh()
    } else {
      console.error('Error updating university:', error)
      alert('Error updating university: ' + error.message)
    }
  }

  // DELETE UNIVERSITY MODAL TRIGGER
  const openDeleteModal = (target?: any) => {
    const uni = target || selectedUni
    if (!uni) return
    setUniToDelete(uni)
    setIsDeleteOpen(true)
  }

  // CONFIRM DELETE EXECUTION
  const confirmDelete = async () => {
    if (!uniToDelete) return
    setDeleting(true)
    const { error } = await supabase
      .from('universities')
      .delete()
      .eq('id', uniToDelete.id)

    setDeleting(false)
    if (!error) {
      alert('University deleted successfully!')
      setIsDeleteOpen(false)
      if (selectedUni && selectedUni.id === uniToDelete.id) {
        setSelectedUni(null)
      }
      setUniToDelete(null)
      loadUniversities()
      router.refresh()
    } else {
      console.error('Error deleting university:', error)
      alert('Error deleting university: ' + error.message)
    }
  }

  // CREATE COLLEGE / 20% MASTER UNIT
  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUni || !collegeFormData.name_fr) {
      alert('Please fill in the college name.')
      return
    }

    const { error } = await supabase
      .from('faculties')
      .insert([
        {
          university_id: selectedUni.id,
          name_fr: collegeFormData.name_fr,
          unit_type: collegeFormData.unit_type || 'faculty',
          application_link: collegeFormData.application_link || null,
          deadline: collegeFormData.deadline || null,
          master_programs: collegeFormData.master_programs || null,
          required_documents: collegeFormData.required_documents || null,
          notes: collegeFormData.notes || null,
          domain_id: collegeFormData.domain_id || null,
          is_open: collegeFormData.is_open
        }
      ])

    if (!error) {
      alert('College / 20% Master Unit added successfully!')
      setCollegeFormData(emptyCollegeForm)
      setIsAddCollegeOpen(false)
      loadColleges()
      router.refresh()
    } else {
      console.error('Error adding college:', error)
      alert('Error adding college: ' + error.message)
    }
  }

  // UPDATE COLLEGE
  const handleUpdateCollege = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collegeToEdit) return

    const { error } = await supabase
      .from('faculties')
      .update({
        name_fr: collegeFormData.name_fr,
        unit_type: collegeFormData.unit_type || 'faculty',
        application_link: collegeFormData.application_link || null,
        deadline: collegeFormData.deadline || null,
        master_programs: collegeFormData.master_programs || null,
        required_documents: collegeFormData.required_documents || null,
        notes: collegeFormData.notes || null,
        domain_id: collegeFormData.domain_id || null,
        is_open: collegeFormData.is_open
      })
      .eq('id', collegeToEdit.id)

    if (!error) {
      alert('College updated successfully!')
      setIsEditCollegeOpen(false)
      loadColleges()
      router.refresh()
    } else {
      console.error('Error updating college:', error)
      alert('Error updating college: ' + error.message)
    }
  }

  // DELETE COLLEGE MODAL TRIGGER
  const openDeleteCollegeModal = (college: any) => {
    setCollegeToDelete(college)
    setIsDeleteCollegeOpen(true)
  }

  // CONFIRM DELETE COLLEGE EXECUTION
  const confirmDeleteCollege = async () => {
    if (!collegeToDelete) return
    setDeletingCollege(true)
    const { error } = await supabase
      .from('faculties')
      .delete()
      .eq('id', collegeToDelete.id)

    setDeletingCollege(false)
    if (!error) {
      alert('College deleted successfully!')
      setIsDeleteCollegeOpen(false)
      setCollegeToDelete(null)
      loadColleges()
      router.refresh()
    } else {
      console.error('Error deleting college:', error)
      alert('Error deleting college: ' + error.message)
    }
  }

  // Open Edit College Dialog
  const openEditCollegeModal = (college: any) => {
    setCollegeToEdit(college)
    setCollegeFormData({
      name_fr: college.name_fr || '',
      name_ar: college.name_ar || '',
      unit_type: college.unit_type || 'faculty',
      application_link: college.application_link || '',
      deadline: college.deadline || '',
      master_programs: college.master_programs || '',
      required_documents: college.required_documents || '',
      notes: college.notes || '',
      domain_id: college.domain_id || '',
      is_open: college.is_open !== false
    })
    setIsEditCollegeOpen(true)
  }

  // Filter universities list based on search and wilaya select safely
  const filteredUniversities = universities.filter(uni => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      (uni.name && uni.name.toLowerCase().includes(searchLower)) ||
      (uni.city && uni.city.toLowerCase().includes(searchLower))
    const matchesWilaya = !selectedWilayaFilter || uni.wilaya === selectedWilayaFilter
    return matchesSearch && matchesWilaya
  })

  if (loading && universities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground font-semibold">
        Loading institutions database...
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* 1. CONDITIONAL PRIMARY WORKSPACE (SUB-DASHBOARD OR MAIN LIST) */}
      {selectedUni ? (
        /* A. SUB-DASHBOARD VIEW */
        <div className="space-y-6 select-none animate-in fade-in duration-200">
          {/* Header Breadcrumbs Back button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUni(null)}
                className="cursor-pointer font-semibold"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Universities
              </Button>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-foreground leading-tight">{selectedUni.name}</h2>
                <p className="text-xs text-muted-foreground font-semibold">
                  {selectedUni.city}, {selectedUni.wilaya}
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => openDeleteModal(selectedUni)}
              className="cursor-pointer font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete University
            </Button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="border-b border-border flex items-center justify-between overflow-x-auto select-none">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'colleges', label: 'Colleges & 20% Master Units', icon: Network },
                { id: 'settings', label: 'University Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeSubTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {activeSubTab === 'colleges' && (
              <Button
                onClick={() => {
                  setCollegeFormData(emptyCollegeForm)
                  setIsAddCollegeOpen(true)
                }}
                size="sm"
                className="cursor-pointer flex items-center gap-1.5 mb-1"
              >
                <Plus className="h-4 w-4" />
                Add College / Faculty
              </Button>
            )}
          </div>

          {/* Sub Tab View Content */}
          <div className="py-2">
            {activeSubTab === 'colleges' && (
              <div className="space-y-6">
                {uniColleges.length === 0 ? (
                  <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center space-y-4">
                    <Network className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">No Colleges Added Yet</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                        Add university colleges and faculties to publish their specific 20% Master portal application links, deadlines, and requirements for students.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setCollegeFormData(emptyCollegeForm)
                        setIsAddCollegeOpen(true)
                      }}
                      className="cursor-pointer font-semibold"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add First College
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {uniColleges.map((college) => {
                      const domainName = domains.find(d => d.id === college.domain_id)?.name_fr
                      return (
                        <div
                          key={college.id}
                          className="bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4 relative group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="uppercase text-[9px] tracking-wider font-bold">
                                    {college.unit_type || 'Faculty'}
                                  </Badge>
                                  {college.is_open === false ? (
                                    <Badge variant="destructive" className="text-[10px] font-semibold">
                                      Closed
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[10px] font-semibold bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                      Open
                                    </Badge>
                                  )}
                                  {domainName && (
                                    <Badge variant="secondary" className="text-[10px] font-semibold flex items-center gap-1 bg-primary/10 border-primary/20 text-primary">
                                      <BookOpen className="h-3.5 w-3.5" />
                                      {domainName}
                                    </Badge>
                                  )}
                                  {college.deadline && (
                                    <Badge variant="secondary" className="text-[10px] font-semibold flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Deadline: {college.deadline}
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-lg font-bold text-foreground leading-snug">{college.name_fr}</h3>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  title="Edit College"
                                  onClick={() => openEditCollegeModal(college)}
                                  className="p-1.5 hover:bg-muted hover:text-primary rounded-md transition-colors cursor-pointer text-muted-foreground"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  title="Delete College"
                                  onClick={() => openDeleteCollegeModal(college)}
                                  className="p-1.5 hover:bg-muted hover:text-destructive rounded-md transition-colors cursor-pointer text-muted-foreground"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Master Programs */}
                            {college.master_programs && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  Offered Master Programs
                                </span>
                                <p className="text-xs text-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50 leading-relaxed whitespace-pre-wrap">
                                  {college.master_programs}
                                </p>
                              </div>
                            )}

                            {/* Required Documents */}
                            {college.required_documents && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  Required Documents
                                </span>
                                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                  {college.required_documents}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Application Link Footer */}
                          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                            {college.application_link ? (
                              <a
                                href={college.application_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                              >
                                <LinkIcon className="h-3.5 w-3.5" />
                                <span>Application Portal Link →</span>
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No application link added</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'settings' && editFormData && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-base font-bold text-foreground mb-4">Configure Institution Details</h3>
                <form onSubmit={(e) => handleUpdateSubmit(e, selectedUni.id)} className="space-y-4 max-w-xl">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit_name">University Name</Label>
                    <Input
                      id="edit_name"
                      required
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_wilaya">Wilaya</Label>
                      <select
                        id="edit_wilaya"
                        required
                        value={editFormData.wilaya}
                        onChange={e => {
                          const selectedWilaya = WILAYAS.find(w => w.french === e.target.value)
                          setEditFormData({ 
                            ...editFormData, 
                            wilaya: e.target.value,
                            location_gps: selectedWilaya ? `${selectedWilaya.latitude},${selectedWilaya.longitude}` : editFormData.location_gps
                          })
                        }}
                        className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                      >
                        <option value="">-- Choose Wilaya --</option>
                        {WILAYAS.map(w => (
                          <option key={w.id} value={w.french}>
                            {w.id} - {w.french} ({w.arabic})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit_city">City</Label>
                      <Input
                        id="edit_city"
                        required
                        value={editFormData.city}
                        onChange={e => setEditFormData({ ...editFormData, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      type="email"
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>

                   <div>
                    <Label htmlFor="edit_website">Website URL</Label>
                    <Input
                      id="edit_website"
                      type="url"
                      value={editFormData.website}
                      onChange={e => setEditFormData({ ...editFormData, website: e.target.value })}
                    />
                  </div>

                  {/* University Logo Settings */}
                  <div className="space-y-3 border border-border p-3.5 rounded-xl bg-secondary/15">
                    <Label className="font-bold">Logo de l'université</Label>
                    
                    {editFormData.logo && editFormData.logo !== 'placeholder' && (
                      <div className="flex items-center gap-3">
                        <img
                          src={editFormData.logo}
                          alt="Logo Preview"
                          className="w-16 h-16 rounded-xl object-contain border border-border bg-white p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setEditFormData(prev => ({ ...prev, logo: '' }))}
                          className="text-xs font-bold text-destructive hover:bg-destructive/5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                        >
                          Supprimer le logo
                        </button>
                      </div>
                    )}
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="edit_logo_file" className="text-xs font-semibold text-muted-foreground">
                        {uploadingLogo ? 'Téléversement en cours...' : 'Téléverser le fichier du logo depuis votre PC'}
                      </Label>
                      <Input
                        id="edit_logo_file"
                        type="file"
                        accept="image/*"
                        disabled={uploadingLogo}
                        onChange={(e) => handleLogoUpload(e, true)}
                        className="bg-card border-border file:bg-secondary file:text-foreground file:border-none file:rounded-md file:px-2.5 file:py-1 file:font-semibold file:cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit_desc_fr">Description</Label>
                    <Textarea
                      id="edit_desc_fr"
                      rows={4}
                      value={editFormData.description_fr}
                      onChange={e => setEditFormData({ ...editFormData, description_fr: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit_deadline">Application Deadline</Label>
                    <Input
                      id="edit_deadline"
                      type="date"
                      value={editFormData.deadline}
                      onChange={e => setEditFormData({ ...editFormData, deadline: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full cursor-pointer font-semibold">Save Configurations</Button>
                </form>

                <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-6 mt-8 max-w-xl">
                  <h4 className="text-sm font-bold text-destructive">Danger Zone</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Permanently delete this university and all of its associated colleges and master units. This action is irreversible.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteModal(selectedUni)}
                    className="mt-4 font-semibold cursor-pointer"
                  >
                    Delete University
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* B. UNIVERSITIES LIST VIEW */
        <div className="space-y-6 select-none animate-in fade-in duration-200">
          {/* Top Header & Quick Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">20% Master Universities</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage universities and configure college portals for students.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggler */}
              <div className="border border-border rounded-lg p-0.5 bg-muted flex items-center shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <Button onClick={() => setIsAddOpen(true)} className="cursor-pointer flex items-center gap-1.5 font-semibold">
                <Plus className="h-4 w-4" />
                Add University
              </Button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
            <div className="flex items-center gap-3 max-w-md w-full">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 border border-border rounded-xl flex-1 text-xs">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search university by name or city..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <select
                value={selectedWilayaFilter}
                onChange={e => setSelectedWilayaFilter(e.target.value)}
                className="bg-muted/40 text-foreground border border-border rounded-xl px-3 py-1.5 outline-none font-semibold text-xs cursor-pointer max-w-[180px]"
              >
                <option value="">All Wilayas</option>
                {WILAYAS.map(w => (
                  <option key={w.id} value={w.french}>
                    {w.id} - {w.french}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUniversities.length === 0 ? (
                <div className="col-span-full py-16 border border-dashed border-border rounded-xl text-center bg-card">
                  <p className="text-sm text-muted-foreground">No universities match your search criteria.</p>
                </div>
              ) : (
                filteredUniversities.map((uni) => (
                  <div
                    key={uni.id}
                    onClick={() => {
                      setSelectedUni(uni)
                      setActiveSubTab('colleges')
                    }}
                    className="bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-md hover:border-primary/45 transition-all cursor-pointer flex flex-col justify-between min-h-[14rem] h-auto group select-none"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg border border-border bg-white text-primary flex items-center justify-center shrink-0 overflow-hidden">
                            {uni.logo ? (
                              <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <School className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-foreground truncate text-base leading-snug">{uni.name}</h3>
                            <p className="text-xs text-muted-foreground">{uni.city}, {uni.wilaya}</p>
                          </div>
                        </div>
                      </div>

                      {uni.description_fr && (
                        <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                          {uni.description_fr}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {uni.deadline && (
                          <Badge variant="secondary" className="text-[10px] font-semibold flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Deadline: {uni.deadline}
                          </Badge>
                        )}
                        {uni.website && (
                          <a
                            href={uni.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 border-t border-border/60 pt-3 text-xs font-semibold text-muted-foreground">
                      <span className="text-[10px] uppercase tracking-wider">Rank #{uni.ranking}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          title="Quick Edit"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(uni)
                          }}
                          className="p-1.5 hover:bg-muted hover:text-primary rounded-md transition-colors cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Delete University"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteModal(uni)
                          }}
                          className="p-1.5 hover:bg-muted hover:text-destructive rounded-md transition-colors cursor-pointer text-destructive/80"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-primary font-bold text-[10px] uppercase tracking-wider ml-1">Configure Colleges →</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto bg-card border border-border rounded-xl shadow-xs">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Wilaya</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">City</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Ranking</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUniversities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-sm text-muted-foreground font-semibold">
                        No universities match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUniversities.map((uni) => (
                      <tr key={uni.id} className="border-b border-border hover:bg-muted/50 last:border-none transition-colors">
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center shrink-0 overflow-hidden">
                              {uni.logo ? (
                                <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain p-0.5" />
                              ) : (
                                <School className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <span className="truncate max-w-[280px]" title={uni.name}>{uni.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{uni.wilaya}</td>
                        <td className="py-3.5 px-4">{uni.city}</td>
                        <td className="py-3.5 px-4 font-semibold">Rank #{uni.ranking}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUni(uni)
                                setActiveSubTab('colleges')
                              }}
                              className="cursor-pointer font-semibold"
                            >
                              Configure Colleges
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Edit"
                              onClick={() => openEditModal(uni)}
                              className="cursor-pointer hover:text-primary"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Delete"
                              onClick={() => openDeleteModal(uni)}
                              className="cursor-pointer text-destructive hover:bg-destructive/5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. ROOT-LEVEL DIALOG MODALS MOUNT (ALWAYS ON DOM FOR RENDERING CORRECTNESS) */}
      
      {/* ADD UNIVERSITY MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New University</DialogTitle>
            <DialogDescription>Register a new academic institution into the system.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="add_name">University Name</Label>
              <Input
                id="add_name"
                required
                placeholder="e.g. Université des Sciences et de la Technologie Houari Boumediene"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="add_wilaya">Wilaya</Label>
                <select
                  id="add_wilaya"
                  required
                  value={addFormData.wilaya}
                  onChange={(e) => {
                    const selectedWilaya = WILAYAS.find(w => w.french === e.target.value)
                    setAddFormData({ 
                      ...addFormData, 
                      wilaya: e.target.value,
                      location_gps: selectedWilaya ? `${selectedWilaya.latitude},${selectedWilaya.longitude}` : addFormData.location_gps
                    })
                  }}
                  className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                >
                  <option value="">-- Choose Wilaya --</option>
                  {WILAYAS.map(w => (
                    <option key={w.id} value={w.french}>
                      {w.id} - {w.french} ({w.arabic})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add_city">City</Label>
                <Input
                  id="add_city"
                  required
                  placeholder="e.g. Bab Ezzouar"
                  value={addFormData.city}
                  onChange={(e) => setAddFormData({ ...addFormData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add_email">Email</Label>
              <Input
                id="add_email"
                type="email"
                placeholder="contact@univ.dz"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add_website">Website URL</Label>
              <Input
                id="add_website"
                type="url"
                placeholder="https://www.univ.dz"
                value={addFormData.website}
                onChange={(e) => setAddFormData({ ...addFormData, website: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add_desc_fr">Description (French)</Label>
              <Textarea
                id="add_desc_fr"
                rows={3}
                placeholder="Provide details about the university campus..."
                value={addFormData.description_fr}
                onChange={(e) => setAddFormData({ ...addFormData, description_fr: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add_deadline">Application Deadline</Label>
              <Input
                id="add_deadline"
                type="date"
                value={addFormData.deadline}
                onChange={(e) => setAddFormData({ ...addFormData, deadline: e.target.value })}
              />
            </div>

            {/* University Logo Settings */}
            <div className="space-y-3 border border-border p-3.5 rounded-xl bg-secondary/15">
              <Label className="font-bold">Logo de l'université</Label>
              
              {addFormData.logo && addFormData.logo !== 'placeholder' && (
                <div className="flex items-center gap-3">
                  <img
                    src={addFormData.logo}
                    alt="Logo Preview"
                    className="w-16 h-16 rounded-xl object-contain border border-border bg-white p-1"
                  />
                  <button
                    type="button"
                    onClick={() => setAddFormData(prev => ({ ...prev, logo: '' }))}
                    className="text-xs font-bold text-destructive hover:bg-destructive/5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Supprimer le logo
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="add_logo_file" className="text-xs font-semibold text-muted-foreground">
                  {uploadingLogo ? 'Téléversement en cours...' : 'Téléverser le fichier du logo depuis votre PC'}
                </Label>
                <Input
                  id="add_logo_file"
                  type="file"
                  accept="image/*"
                  disabled={uploadingLogo}
                  onChange={(e) => handleLogoUpload(e, false)}
                  className="bg-card border-border file:bg-secondary file:text-foreground file:border-none file:rounded-md file:px-2.5 file:py-1 file:font-semibold file:cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer font-semibold">Add University</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QUICK EDIT UNIVERSITY MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit University</DialogTitle>
            <DialogDescription>Modify institution details and configurations.</DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => handleUpdateSubmit(e, editingUni?.id)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="modal_edit_name">University Name</Label>
              <Input
                id="modal_edit_name"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modal_edit_wilaya">Wilaya</Label>
                <select
                  id="modal_edit_wilaya"
                  required
                  value={editFormData.wilaya}
                  onChange={(e) => {
                    const selectedWilaya = WILAYAS.find(w => w.french === e.target.value)
                    setEditFormData({ 
                      ...editFormData, 
                      wilaya: e.target.value,
                      location_gps: selectedWilaya ? `${selectedWilaya.latitude},${selectedWilaya.longitude}` : editFormData.location_gps
                    })
                  }}
                  className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                >
                  <option value="">-- Choose Wilaya --</option>
                  {WILAYAS.map(w => (
                    <option key={w.id} value={w.french}>
                      {w.id} - {w.french} ({w.arabic})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="modal_edit_city">City</Label>
                <Input
                  id="modal_edit_city"
                  required
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modal_edit_email">Email</Label>
              <Input
                id="modal_edit_email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modal_edit_website">Website URL</Label>
              <Input
                id="modal_edit_website"
                type="url"
                value={editFormData.website}
                onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modal_edit_desc_fr">Description (French)</Label>
              <Textarea
                id="modal_edit_desc_fr"
                rows={3}
                value={editFormData.description_fr}
                onChange={(e) => setEditFormData({ ...editFormData, description_fr: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modal_edit_deadline">Application Deadline</Label>
              <Input
                id="modal_edit_deadline"
                type="date"
                value={editFormData.deadline}
                onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
              />
            </div>

            {/* University Logo Settings */}
            <div className="space-y-3 border border-border p-3.5 rounded-xl bg-secondary/15">
              <Label className="font-bold">Logo de l'université</Label>
              
              {editFormData.logo && editFormData.logo !== 'placeholder' && (
                <div className="flex items-center gap-3">
                  <img
                    src={editFormData.logo}
                    alt="Logo Preview"
                    className="w-16 h-16 rounded-xl object-contain border border-border bg-white p-1"
                  />
                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, logo: '' }))}
                    className="text-xs font-bold text-destructive hover:bg-destructive/5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Supprimer le logo
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="modal_edit_logo_file" className="text-xs font-semibold text-muted-foreground">
                  {uploadingLogo ? 'Téléversement en cours...' : 'Téléverser le fichier du logo depuis votre PC'}
                </Label>
                <Input
                  id="modal_edit_logo_file"
                  type="file"
                  accept="image/*"
                  disabled={uploadingLogo}
                  onChange={(e) => handleLogoUpload(e, true)}
                  className="bg-card border-border file:bg-secondary file:text-foreground file:border-none file:rounded-md file:px-2.5 file:py-1 file:font-semibold file:cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer font-semibold">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE UNIVERSITY CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete University
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-2">
              Are you sure you want to delete <strong className="text-foreground">{uniToDelete?.name}</strong>?
              <br /><br />
              This will permanently delete the university and all of its associated colleges and 20% Master units. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="cursor-pointer font-semibold"
            >
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD COLLEGE / 20% MASTER UNIT MODAL */}
      <Dialog open={isAddCollegeOpen} onOpenChange={setIsAddCollegeOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add College / 20% Master Unit</DialogTitle>
            <DialogDescription>
              Configure a faculty/college for {selectedUni?.name} including portal application link and deadline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCollege} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="col_name_fr">College Name</Label>
              <Input
                id="col_name_fr"
                required
                placeholder="e.g. Faculté des Sciences"
                value={collegeFormData.name_fr}
                onChange={(e) => setCollegeFormData({ ...collegeFormData, name_fr: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="col_type">College Type</Label>
                <select
                  id="col_type"
                  value={collegeFormData.unit_type}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, unit_type: e.target.value })}
                  className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                >
                  <option value="faculty">Faculty (كلية)</option>
                  <option value="institute">Institute (معهد)</option>
                  <option value="school">School (مدرسة العليا)</option>
                  <option value="center">Center (مركز)</option>
                  <option value="department">Department (قسم)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="col_deadline">Application Deadline</Label>
                <Input
                  id="col_deadline"
                  type="date"
                  value={collegeFormData.deadline}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="col_link">College Portal Application Link</Label>
              <Input
                id="col_link"
                type="url"
                placeholder="https://progres.mesrs.dz/webou..."
                value={collegeFormData.application_link}
                onChange={(e) => setCollegeFormData({ ...collegeFormData, application_link: e.target.value })}
              />
            </div>

            {/* Domain Filter Searchable Dropdown */}
            <div className="space-y-1.5 relative" ref={addDomainRef}>
              <Label className="flex items-center gap-1.5 font-semibold">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Domaine d'études</span>
              </Label>
              
              <button
                type="button"
                onClick={() => setIsAddDomainOpen(!isAddDomainOpen)}
                className="w-full bg-card hover:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground flex items-center justify-between transition-all duration-150 cursor-pointer h-10 shadow-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {(() => {
                    if (!collegeFormData.domain_id) {
                      return (
                        <>
                          <BookOpen className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">-- Choisir un domaine --</span>
                        </>
                      )
                    }
                    const activeDom = domains.find(d => d.id === collegeFormData.domain_id)
                    if (!activeDom) {
                      return (
                        <>
                          <BookOpen className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">-- Choisir un domaine --</span>
                        </>
                      )
                    }
                    const IconComp = getDomainIcon(activeDom.name_fr)
                    return (
                      <>
                        <IconComp className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{activeDom.name_fr}</span>
                      </>
                    )
                  })()}
                </div>
                {isAddDomainOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-1.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-1.5" />}
              </button>

              {isAddDomainOpen && (
                <div
                  className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[220px]"
                >
                  <div className="p-2 border-b border-border flex items-center gap-2 bg-muted/20 shrink-0">
                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
                    <input
                      type="text"
                      placeholder="Rechercher un domaine..."
                      value={addDomainSearch}
                      onChange={(e) => setAddDomainSearch(e.target.value)}
                      className="w-full bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground py-1 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="overflow-y-auto py-1 divide-y divide-border/20">
                    {/* Filtered domains */}
                    {(() => {
                      const filtered = domains.filter(dom => 
                        dom.name_fr.toLowerCase().includes(addDomainSearch.toLowerCase())
                      )

                      if (filtered.length === 0) {
                        return (
                          <div className="px-4 py-4 text-center text-xs text-muted-foreground italic">
                            Aucun domaine trouvé
                          </div>
                        )
                      }

                      return filtered.map(dom => {
                        const IconComp = getDomainIcon(dom.name_fr)
                        const isSelected = collegeFormData.domain_id === dom.id
                        return (
                          <button
                            key={dom.id}
                            type="button"
                            onClick={() => {
                              setCollegeFormData(prev => ({ ...prev, domain_id: dom.id }))
                              setIsAddDomainOpen(false)
                              setAddDomainSearch('')
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors hover:bg-secondary/40 cursor-pointer ${
                              isSelected ? 'text-primary bg-primary/5 font-semibold' : 'text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <IconComp className="h-4 w-4 text-primary shrink-0" />
                              <span className="truncate">{dom.name_fr}</span>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                          </button>
                        )
                      })
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Status Selector */}
            <div className="space-y-2.5 p-3.5 bg-secondary/10 dark:bg-secondary/5 border border-border rounded-xl">
              <div>
                <Label className="font-bold text-sm select-none">
                  Statut de l'offre / Inscriptions
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Activer pour garder l'offre ouverte. Désactiver pour forcer la fermeture de l'offre (Inscriptions closes) même si la date limite n'est pas encore dépassée.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setCollegeFormData(prev => ({ ...prev, is_open: true }))}
                  className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none ${
                    collegeFormData.is_open !== false
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                      : 'bg-card border-border hover:bg-secondary/40 text-muted-foreground'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${collegeFormData.is_open !== false ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
                  Ouvert / Actif
                </button>
                <button
                  type="button"
                  onClick={() => setCollegeFormData(prev => ({ ...prev, is_open: false }))}
                  className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none ${
                    collegeFormData.is_open === false
                      ? 'bg-destructive/10 border-destructive/30 text-destructive shadow-2xs'
                      : 'bg-card border-border hover:bg-secondary/40 text-muted-foreground'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${collegeFormData.is_open === false ? 'bg-destructive' : 'bg-muted-foreground/40'}`} />
                  Fermé / Clos
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="col_programs">Offered 20% Master Programs / Specializations</Label>
              <Textarea
                id="col_programs"
                rows={3}
                placeholder="e.g. Master 2 Intelligence Artificielle, Master 2 Génie Logiciel..."
                value={collegeFormData.master_programs}
                onChange={(e) => setCollegeFormData({ ...collegeFormData, master_programs: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="col_docs">Required Documents & Conditions</Label>
              <Textarea
                id="col_docs"
                rows={3}
                placeholder="e.g. Relevés de notes L1-L3, Attestation de classement, Baccalauréat..."
                value={collegeFormData.required_documents}
                onChange={(e) => setCollegeFormData({ ...collegeFormData, required_documents: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddCollegeOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer font-semibold">Save College Unit</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT COLLEGE / 20% MASTER UNIT MODAL */}
      <Dialog open={isEditCollegeOpen} onOpenChange={setIsEditCollegeOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit College Details</DialogTitle>
            <DialogDescription>
              Update portal link, deadline, and master program details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateCollege} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_col_name_fr">College Name</Label>
              <Input
                id="edit_col_name_fr"
                required
                value={collegeFormData.name_fr}
                onChange={(e) => setCollegeFormData({ ...collegeFormData, name_fr: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit_col_type">College Type</Label>
                <select
                  id="edit_col_type"
                  value={collegeFormData.unit_type}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, unit_type: e.target.value })}
                  className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                >
                  <option value="faculty">Faculty (كلية)</option>
                  <option value="institute">Institute (معهد)</option>
                  <option value="school">School (مدرسة العليا)</option>
                  <option value="center">Center (مركز)</option>
                  <option value="department">Department (قسم)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_col_deadline">Application Deadline</Label>
                <Input
                  id="edit_col_deadline"
                  type="date"
                  value={collegeFormData.deadline}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_col_link">College Portal Application Link</Label>
              <Input
                id="edit_col_link"
                type="url"
                value={collegeFormData.application_link}
                onChange={(e) => setCollegeFormData({ ...collegeFormData, application_link: e.target.value })}
              />
            </div>

            {/* Domain Filter Searchable Dropdown */}
            <div className="space-y-1.5 relative" ref={editDomainRef}>
              <Label className="flex items-center gap-1.5 font-semibold">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Domaine d'études</span>
              </Label>
              
              <button
                type="button"
                onClick={() => setIsEditDomainOpen(!isEditDomainOpen)}
                className="w-full bg-card hover:bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground flex items-center justify-between transition-all duration-150 cursor-pointer h-10 shadow-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {(() => {
                    if (!collegeFormData.domain_id) {
                      return (
                        <>
                          <BookOpen className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">-- Choisir un domaine --</span>
                        </>
                      )
                    }
                    const activeDom = domains.find(d => d.id === collegeFormData.domain_id)
                    if (!activeDom) {
                      return (
                        <>
                          <BookOpen className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">-- Choisir un domaine --</span>
                        </>
                      )
                    }
                    const IconComp = getDomainIcon(activeDom.name_fr)
                    return (
                      <>
                        <IconComp className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{activeDom.name_fr}</span>
                      </>
                    )
                  })()}
                </div>
                {isEditDomainOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-1.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-1.5" />}
              </button>

              {isEditDomainOpen && (
                <div
                  className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[220px]"
                >
                  <div className="p-2 border-b border-border flex items-center gap-2 bg-muted/20 shrink-0">
                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
                    <input
                      type="text"
                      placeholder="Rechercher un domaine..."
                      value={editDomainSearch}
                      onChange={(e) => setEditDomainSearch(e.target.value)}
                      className="w-full bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground py-1 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="overflow-y-auto py-1 divide-y divide-border/20">
                    {/* Filtered domains */}
                    {(() => {
                      const filtered = domains.filter(dom => 
                        dom.name_fr.toLowerCase().includes(editDomainSearch.toLowerCase())
                      )

                      if (filtered.length === 0) {
                        return (
                          <div className="px-4 py-4 text-center text-xs text-muted-foreground italic">
                            Aucun domaine trouvé
                          </div>
                        )
                      }

                      return filtered.map(dom => {
                        const IconComp = getDomainIcon(dom.name_fr)
                        const isSelected = collegeFormData.domain_id === dom.id
                        return (
                          <button
                            key={dom.id}
                            type="button"
                            onClick={() => {
                              setCollegeFormData(prev => ({ ...prev, domain_id: dom.id }))
                              setIsEditDomainOpen(false)
                              setEditDomainSearch('')
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors hover:bg-secondary/40 cursor-pointer ${
                              isSelected ? 'text-primary bg-primary/5 font-semibold' : 'text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <IconComp className="h-4 w-4 text-primary shrink-0" />
                              <span className="truncate">{dom.name_fr}</span>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                          </button>
                        )
                      })
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Status Selector */}
            <div className="space-y-2.5 p-3.5 bg-secondary/10 dark:bg-secondary/5 border border-border rounded-xl">
              <div>
                <Label className="font-bold text-sm select-none">
                  Statut de l'offre / Inscriptions
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Activer pour garder l'offre ouverte. Désactiver pour forcer la fermeture de l'offre (Inscriptions closes) même si la date limite n'est pas encore dépassée.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setCollegeFormData(prev => ({ ...prev, is_open: true }))}
                  className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none ${
                    collegeFormData.is_open !== false
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                      : 'bg-card border-border hover:bg-secondary/40 text-muted-foreground'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${collegeFormData.is_open !== false ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
                  Ouvert / Actif
                </button>
                <button
                  type="button"
                  onClick={() => setCollegeFormData(prev => ({ ...prev, is_open: false }))}
                  className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none ${
                    collegeFormData.is_open === false
                      ? 'bg-destructive/10 border-destructive/30 text-destructive shadow-2xs'
                      : 'bg-card border-border hover:bg-secondary/40 text-muted-foreground'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${collegeFormData.is_open === false ? 'bg-destructive' : 'bg-muted-foreground/40'}`} />
                  Fermé / Clos
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_col_programs">Offered 20% Master Programs</Label>
              <Textarea
                id="edit_col_programs"
                rows={3}
                value={collegeFormData.master_programs}
                onChange={(e) => setCollegeFormData({ ...collegeFormData, master_programs: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_col_docs">Required Documents & Conditions</Label>
              <Textarea
                id="edit_col_docs"
                rows={3}
                value={collegeFormData.required_documents}
                onChange={(e) => setCollegeFormData({ ...collegeFormData, required_documents: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditCollegeOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer font-semibold">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE COLLEGE CONFIRMATION MODAL */}
      <Dialog open={isDeleteCollegeOpen} onOpenChange={setIsDeleteCollegeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete College / 20% Master Unit
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-2">
              Are you sure you want to delete <strong className="text-foreground">{collegeToDelete?.name_fr}</strong>?
              <br /><br />
              This will permanently delete this college and its associated portal link and application details from the database. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteCollegeOpen(false)}
              disabled={deletingCollege}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteCollege}
              disabled={deletingCollege}
              className="cursor-pointer font-semibold"
            >
              {deletingCollege ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
