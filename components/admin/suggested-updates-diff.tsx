'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GitPullRequest,
  Check,
  X,
  StickyNote,
  Building2,
  GraduationCap,
  Mail,
  Calendar,
  MessageSquare,
  Sparkles,
  UserCheck,
  Tag,
  Trash2
} from 'lucide-react'

export interface SuggestedNoteItem {
  id: string
  listing_id?: string
  program_title?: string
  university_name?: string
  faculty_name?: string
  message: string
  note_type?: string
  contact_email?: string | null
  verification_status: 'pending' | 'verified' | 'rejected'
  created_at: string
}

const DEFAULT_DEMO_NOTES: SuggestedNoteItem[] = [
  {
    id: 'demo-1',
    program_title: 'Master 2 Informatique - Systèmes d\'Information et Connaissances (SIC)',
    university_name: 'Université des Sciences et de la Technologie Houari Boumediene (USTHB)',
    faculty_name: 'Faculté d\'Informatique',
    message: 'The deadline for 20% quota application is extended to August 15th according to the official faculty portal announcement.',
    note_type: 'deadline',
    contact_email: 'student.usthb@gmail.com',
    verification_status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'demo-2',
    program_title: 'Master Génie Mécanique - Productique et Conception',
    university_name: 'Université de Tlemcen - Abou Bekr Belkaïd',
    faculty_name: 'Faculté des Sciences de la Technologie',
    message: 'Please add the required document "Attestation de classement" to the 20% quota file requirements list.',
    note_type: 'prerequisite',
    contact_email: 'tlemcen.student@univ-tlemcen.dz',
    verification_status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
]

export function SuggestedUpdatesDiff() {
  const supabase = createClient()
  const [suggestions, setSuggestions] = useState<SuggestedNoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestedNoteItem | null>(null)
  const [actioning, setActioning] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending')

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    setLoading(true)
    let fetchedList: SuggestedNoteItem[] = []

    try {
      // 1. Fetch from Supabase suggested_updates table
      const { data, error } = await supabase
        .from('suggested_updates')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        fetchedList = data.map((item: any) => {
          // Parse structured message if available
          let progTitle = item.program_title
          let uniName = item.university_name
          let msgText = item.message || ''

          if (!progTitle && msgText.includes('Program:')) {
            const parts = msgText.split('Program:')
            if (parts[1]) {
              const programParts = parts[1].split('-')
              progTitle = programParts[0]?.trim()
              uniName = programParts[1]?.replace(')', '')?.trim()
            }
          }

          return {
            id: item.id,
            listing_id: item.listing_id,
            program_title: progTitle || '20% Master Program',
            university_name: uniName || 'University',
            message: msgText,
            contact_email: item.contact_email || item.url || null,
            verification_status: item.verification_status || item.status || 'pending',
            created_at: item.created_at || new Date().toISOString()
          }
        })
      }
    } catch (e) {
      console.warn('Supabase suggested_updates query note:', e)
    }

    // 2. Merge local storage notes submitted in student session
    try {
      const localRaw = localStorage.getItem('suggested_updates_local')
      if (localRaw) {
        const localList: SuggestedNoteItem[] = JSON.parse(localRaw)
        // Deduplicate by ID
        const existingIds = new Set(fetchedList.map(i => i.id))
        const newLocal = localList.filter(l => !existingIds.has(l.id))
        fetchedList = [...newLocal, ...fetchedList]
      }
    } catch (e) {
      console.error('LocalStorage read error:', e)
    }

    // 3. Fallback to demo items if empty so interface is rich and informative
    if (fetchedList.length === 0) {
      fetchedList = DEFAULT_DEMO_NOTES
    }

    setSuggestions(fetchedList)
    if (fetchedList.length > 0 && !selectedSuggestion) {
      setSelectedSuggestion(fetchedList[0])
    }
    setLoading(false)
  }

  const handleAction = async (id: string, actionType: 'verified' | 'rejected') => {
    setActioning(true)
    try {
      if (actionType === 'rejected') {
        // Direct deletion from Supabase database
        if (!id.startsWith('demo-')) {
          await supabase.from('suggested_updates').delete().eq('id', id)
        }

        // Remove from local React state
        const updatedList = suggestions.filter(item => item.id !== id)
        setSuggestions(updatedList)

        // Remove from localStorage fallback queue
        try {
          const localRaw = localStorage.getItem('suggested_updates_local')
          if (localRaw) {
            const localList: SuggestedNoteItem[] = JSON.parse(localRaw)
            const updatedLocal = localList.filter(item => item.id !== id)
            localStorage.setItem('suggested_updates_local', JSON.stringify(updatedLocal))
          }
        } catch (e) {
          console.error('LocalStorage delete sync error:', e)
        }

        // Update selected suggestion selection
        if (selectedSuggestion?.id === id) {
          const remaining = updatedList.filter(i => filterStatus === 'all' || i.verification_status === filterStatus)
          setSelectedSuggestion(remaining.length > 0 ? remaining[0] : null)
        }
      } else {
        // Accept & verify note
        if (!id.startsWith('demo-')) {
          await supabase
            .from('suggested_updates')
            .update({ verification_status: 'verified', status: 'verified' })
            .eq('id', id)
        }

        const updatedList = suggestions.map(item => {
          if (item.id === id) {
            return { ...item, verification_status: 'verified' as const }
          }
          return item
        })
        setSuggestions(updatedList)

        try {
          const localRaw = localStorage.getItem('suggested_updates_local')
          if (localRaw) {
            const localList: SuggestedNoteItem[] = JSON.parse(localRaw)
            const updatedLocal = localList.map(item => {
              if (item.id === id) {
                return { ...item, verification_status: 'verified' as const }
              }
              return item
            })
            localStorage.setItem('suggested_updates_local', JSON.stringify(updatedLocal))
          }
        } catch (e) {
          console.error('LocalStorage sync error:', e)
        }

        if (selectedSuggestion?.id === id) {
          setSelectedSuggestion(prev => prev ? { ...prev, verification_status: 'verified' } : null)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActioning(false)
    }
  }

  const filteredSuggestions = suggestions.filter(item => {
    if (filterStatus === 'all') return true
    return item.verification_status === filterStatus
  })

  const getNoteTypeBadge = (type?: string) => {
    switch (type) {
      case 'correction':
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">Data Correction</Badge>
      case 'deadline':
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30">Deadline Update</Badge>
      case 'prerequisite':
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30">Prerequisites Info</Badge>
      default:
        return <Badge variant="outline" className="bg-secondary text-foreground">General Student Note</Badge>
    }
  }

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <GitPullRequest className="h-6 w-6 text-primary" />
            <span>Suggested Updates & Student Notes</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Review, accept, or reject program notes and update suggestions submitted by students.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border shrink-0">
          {(['pending', 'verified', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-card text-primary shadow-2xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {st === 'verified' ? 'Accepted' : st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Suggestions Queue List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Notes Queue ({filteredSuggestions.length})
            </h3>
          </div>

          {loading ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-xs text-muted-foreground">Loading suggestions...</p>
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center space-y-2">
              <StickyNote className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-sm font-semibold text-foreground">No notes in queue</p>
              <p className="text-xs text-muted-foreground">There are no {filterStatus} suggestions right now.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredSuggestions.map((item) => {
                const isSelected = selectedSuggestion?.id === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedSuggestion(item)}
                    className={`p-4 bg-card border rounded-2xl cursor-pointer hover:shadow-md transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>

                      {item.verification_status === 'pending' && (
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                          Pending
                        </Badge>
                      )}
                      {item.verification_status === 'verified' && (
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                          Accepted
                        </Badge>
                      )}
                      {item.verification_status === 'rejected' && (
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-extrabold bg-destructive/10 text-destructive border-destructive/20">
                          Rejected
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-extrabold text-xs text-foreground line-clamp-2 leading-snug">
                      {item.program_title || 'General Master Suggestion'}
                    </h4>

                    <p className="text-[11px] text-muted-foreground truncate mt-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3 shrink-0" />
                      <span>{item.university_name || 'University'}</span>
                    </p>

                    <p className="text-xs text-foreground/80 line-clamp-2 mt-2 bg-muted/40 p-2 rounded-lg italic">
                      "{item.message}"
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Side: Detailed Review & Moderate Panel */}
        <div className="lg:col-span-2">
          {selectedSuggestion ? (
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between h-full min-h-[460px] animate-in fade-in duration-150 shadow-xs">
              <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Review Student Note</span>
                      {getNoteTypeBadge(selectedSuggestion.note_type)}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Submitted on {new Date(selectedSuggestion.created_at).toLocaleString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(selectedSuggestion.id, 'rejected')}
                      disabled={actioning}
                      className="cursor-pointer font-bold text-destructive hover:bg-destructive/10 border-destructive/30 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Reject & Delete
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(selectedSuggestion.id, 'verified')}
                      disabled={actioning || selectedSuggestion.verification_status === 'verified'}
                      className="cursor-pointer font-bold bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl shadow-xs"
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Accept Note
                    </Button>
                  </div>
                </div>

                {/* Program Details Card */}
                <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>Target Program Noted</span>
                  </div>

                  <h3 className="text-base font-extrabold text-foreground leading-snug">
                    {selectedSuggestion.program_title || 'General University Program'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedSuggestion.university_name || 'University'}</span>
                    </span>
                    {selectedSuggestion.faculty_name && (
                      <span className="font-medium text-muted-foreground">
                        • {selectedSuggestion.faculty_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Note Details Content */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>Student Suggestion / Note Details</span>
                  </h4>
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-medium">
                      {selectedSuggestion.message}
                    </p>
                  </div>
                </div>

                {/* Student Contact Info */}
                <div className="bg-secondary/40 border border-border/70 rounded-xl p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>Student Contact Email:</span>
                    <strong className="text-foreground font-mono">
                      {selectedSuggestion.contact_email || 'Anonymous Student'}
                    </strong>
                  </div>

                  <span className="text-[10px] font-mono text-muted-foreground">
                    ID: {selectedSuggestion.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-2xl bg-card p-12 text-center py-28 flex flex-col items-center justify-center space-y-3">
              <GitPullRequest className="h-10 w-10 text-muted-foreground/60" />
              <p className="text-muted-foreground text-sm font-medium">
                Select a program note from the queue on the left to review details and take action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
