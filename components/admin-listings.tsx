'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  GraduationCap,
  Search,
  Filter,
  Eye,
  Edit2,
  Copy,
  Archive,
  CheckCircle,
  MoreHorizontal,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react'

export function ListingsTab() {
  const supabase = createClient()
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    loadOpportunities()
  }, [])

  const loadOpportunities = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('admission_windows')
      .select(`
        id,
        seats,
        deadline,
        portal_url,
        is_published,
        academic_year,
        program:programs(
          id,
          title_fr,
          title_ar,
          level,
          university:universities(name),
          domain:domains(name_fr)
        )
      `)

    if (!error) {
      setOpportunities(data || [])
    } else {
      console.error('Error loading opportunities:', error)
    }
    setLoading(false)
  }

  // Handle single action
  const handleUpdateStatus = async (id: string, status: string) => {
    const isPublished = status === 'published'
    const { error } = await supabase
      .from('admission_windows')
      .update({ is_published: isPublished })
      .eq('id', id)

    if (!error) {
      loadOpportunities()
    } else {
      alert('Error updating status: ' + error.message)
    }
  }

  const handleDuplicate = async (window: any) => {
    const prog = window.program || {}
    // 1. Create duplicate program
    const { data: newProg, error: progError } = await supabase
      .from('programs')
      .insert([
        {
          university_id: window.program?.university?.id || null, // Let's try to query university_id if possible
          title_fr: `${prog.title_fr} (Copy)`,
          title_ar: prog.title_ar ? `${prog.title_ar} (نسخة)` : null,
          level: prog.level,
          workflow_status: 'published'
        }
      ])
      .select()
      .single()

    if (progError) {
      alert('Error duplicating program: ' + progError.message)
      return
    }

    // 2. Create duplicate admission window
    const { error: winError } = await supabase
      .from('admission_windows')
      .insert([
        {
          program_id: newProg.id,
          academic_year: window.academic_year,
          seats: window.seats,
          deadline: window.deadline,
          portal_url: window.portal_url,
          is_published: false
        }
      ])

    if (!winError) {
      alert('Listing duplicated as Draft.')
      loadOpportunities()
    } else {
      alert('Error duplicating listing: ' + winError.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return
    const { error } = await supabase
      .from('admission_windows')
      .delete()
      .eq('id', id)

    if (!error) {
      loadOpportunities()
    } else {
      alert('Error deleting: ' + error.message)
    }
  }

  // Bulk Actions
  const handleBulkStatus = async (status: string) => {
    if (selectedIds.length === 0) return
    const isPublished = status === 'published'
    const { error } = await supabase
      .from('admission_windows')
      .update({ is_published: isPublished })
      .in('id', selectedIds)

    if (!error) {
      setSelectedIds([])
      loadOpportunities()
    } else {
      alert('Error in bulk update: ' + error.message)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOpps.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredOpps.map(o => o.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  if (loading && opportunities.length === 0) return <div className="text-sm font-semibold p-6 text-muted-foreground">Loading listings...</div>

  // Filter listings
  const filteredOpps = opportunities.filter(win => {
    const prog = win.program || {}
    const uni = prog.university || {}
    const matchesSearch = (prog.title_fr || '').toLowerCase().includes(search.toLowerCase()) ||
                          (uni.name || '').toLowerCase().includes(search.toLowerCase())
    const matchesLevel = !filterLevel || prog.level === filterLevel

    return matchesSearch && matchesLevel
  })

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Header title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Academic Opportunities</h2>
          <p className="text-xs text-[#6B6B63] mt-0.5">Manage study tracks, verification links, and publication statuses.</p>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        
        {/* Search & Level select */}
        <div className="flex items-center gap-3 max-w-md w-full">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 border border-border rounded-xl flex-1 text-xs">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search opportunity title or university..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="bg-muted/40 text-foreground border border-border rounded-xl px-3 py-1.5 outline-none font-semibold text-xs cursor-pointer"
          >
            <option value="">All Levels</option>
            <option value="M1">M1 (Master 1)</option>
            <option value="M2">M2 (Master 2)</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0F7B5C]/5 border border-[#0F7B5C]/25 rounded-xl px-4 py-1.5 text-xs font-semibold animate-in slide-in-from-top duration-150 select-none">
            <span className="text-[#0F7B5C]">{selectedIds.length} selected</span>
            <span className="text-muted-foreground/45">|</span>
            <button
              onClick={() => handleBulkStatus('published')}
              className="text-[#0F7B5C] hover:underline cursor-pointer"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkStatus('draft')}
              className="text-[#6B6B63] hover:underline cursor-pointer"
            >
              Draft
            </button>
          </div>
        )}
      </div>

      {/* Table grid listing */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[#6B6B63] select-none">
              <th className="py-3 px-4 text-left w-10">
                <button
                  onClick={toggleSelectAll}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {selectedIds.length === filteredOpps.length && filteredOpps.length > 0 ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4 text-left font-semibold">Title</th>
              <th className="py-3 px-4 text-left font-semibold">University</th>
              <th className="py-3 px-4 text-left font-semibold">Level</th>
              <th className="py-3 px-4 text-left font-semibold">Domain</th>
              <th className="py-3 px-4 text-left font-semibold">Session Seats</th>
              <th className="py-3 px-4 text-left font-semibold">Status</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOpps.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#6B6B63] text-sm font-semibold">
                  No opportunities match your search parameters.
                </td>
              </tr>
            ) : (
              filteredOpps.map((win) => {
                const prog = win.program || {}
                const uni = prog.university || {}
                const dom = prog.domain || {}
                const isSelected = selectedIds.includes(win.id)
                const isPublished = win.is_published

                return (
                  <tr
                    key={win.id}
                    className={`border-b border-border hover:bg-muted/30 last:border-none transition-colors ${
                      isSelected ? 'bg-primary/5 hover:bg-primary/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-left">
                      <button
                        onClick={() => toggleSelect(win.id)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4.5 w-4.5 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{prog.title_fr}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6B63] truncate max-w-[150px]">
                      {uni.name || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{prog.level}</td>
                    <td className="py-3.5 px-4 text-[#6B6B63] truncate max-w-[120px]">
                      {dom.name_fr || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#6B6B63]">
                      {win.academic_year || '—'} ({win.seats || 0} seats)
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={isPublished ? 'default' : 'outline'}
                        className={`capitalize text-[10px] ${
                          isPublished
                            ? 'bg-emerald-500/10 text-emerald-600 border-none'
                            : 'bg-amber-500/10 text-amber-600 border-none'
                        }`}
                      >
                        {isPublished ? 'published' : 'draft'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Duplicate"
                          onClick={() => handleDuplicate(win)}
                          className="cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title={isPublished ? 'Set as Draft' : 'Publish'}
                          onClick={() => handleUpdateStatus(win.id, isPublished ? 'draft' : 'published')}
                          className="cursor-pointer text-primary"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Delete Listing"
                          onClick={() => handleDelete(win.id)}
                          className="cursor-pointer text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
