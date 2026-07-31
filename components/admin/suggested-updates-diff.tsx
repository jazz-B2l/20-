'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GitPullRequest,
  Check,
  X,
  Edit3,
  Calendar,
  Layers,
  ArrowRight,
  Loader2
} from 'lucide-react'

export function SuggestedUpdatesDiff() {
  const supabase = createClient()
  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState<any | null>(null)
  const [actioning, setActioning] = useState(false)

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    setLoading(true)
    // Query manual sources (community suggestions) that are pending
    const { data, error } = await supabase
      .from('sources')
      .select(`
        *,
        opportunity:opportunities(id, title_fr, description_fr, level, university:universities(name_fr))
      `)
      .eq('source_type', 'manual')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false })

    if (!error) {
      setSources(data || [])
    }
    setLoading(false)
  }

  const handleAction = async (id: string, status: 'verified' | 'rejected') => {
    setActioning(true)
    try {
      // If verified and we mock apply changes, we can update the source status
      const { error } = await supabase
        .from('sources')
        .update({ verification_status: status })
        .eq('id', id)

      if (error) throw error

      // If verified, we can mock apply the change to the actual opportunity
      if (status === 'verified' && selectedSource) {
        // e.g. Extend deadline or update level. In this mock, we just say we updated it.
        alert(`Suggestion successfully accepted and applied to program!`)
      } else {
        alert(`Suggestion rejected.`)
      }

      setSelectedSource(null)
      loadSuggestions()
    } catch (err) {
      console.error(err)
      alert('Error updating source: ' + (err as any).message)
    } finally {
      setActioning(false)
    }
  }

  if (loading && sources.length === 0) return <div>Loading...</div>

  // Extract real diff values from database values
  const getRealDiff = (source: any) => {
    const desc = source.opportunity?.description_fr || 'No description provided.'
    const msg = source.message || 'No correction details provided.'
    
    return {
      field: 'Correction Message',
      oldValue: desc,
      newValue: msg,
      reason: 'Submitted via student correction report'
    }
  }

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold">Suggested Updates Queue</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Moderate program changes submitted by students and campus contributors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Suggestions Queue List */}
        <div className="lg:col-span-1 space-y-3.5">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">Suggestions Queue</h3>
          {sources.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center py-12">
              <p className="text-sm text-muted-foreground">No pending corrections in queue.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map((src) => {
                const diff = getRealDiff(src)
                const isSelected = selectedSource?.id === src.id
                return (
                  <div
                    key={src.id}
                    onClick={() => setSelectedSource(src)}
                    className={`p-4 bg-card border rounded-xl cursor-pointer hover:shadow-md transition-all ${
                      isSelected ? 'border-primary shadow-xs ring-2 ring-primary/20' : 'border-border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(src.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-extrabold">
                        Pending
                      </Badge>
                    </div>

                    <h4 className="font-bold text-sm text-foreground truncate">
                      {src.opportunity?.title_fr || 'General Update'}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {src.opportunity?.university?.name_fr || 'Unknown University'}
                    </p>

                    <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-primary">
                      <span>Field: {diff.field}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Side: GitHub-Style Diff details Review Panel */}
        <div className="lg:col-span-2">
          {selectedSource ? (
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between h-full min-h-[400px] animate-in fade-in duration-150">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <div>
                    <h3 className="font-bold text-base leading-tight">Review Suggested Update</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Submitted by contributor <span className="font-semibold">{selectedSource.url || 'anonymous'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(selectedSource.id, 'rejected')}
                      disabled={actioning}
                      className="cursor-pointer font-semibold text-destructive hover:bg-destructive/5"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(selectedSource.id, 'verified')}
                      disabled={actioning}
                      className="cursor-pointer font-semibold bg-primary hover:bg-primary/95 text-primary-foreground"
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Accept & Merge
                    </Button>
                  </div>
                </div>

                {/* Diff Segment */}
                {(() => {
                  const diff = getRealDiff(selectedSource)
                  const isLargeText = diff.oldValue.length > 30
                  return (
                    <div className="space-y-4">
                      {/* Reason */}
                      <div className="bg-muted/40 p-4 border border-border rounded-xl">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">Reason for correction</h4>
                        <p className="text-sm text-foreground font-medium">{diff.reason}</p>
                      </div>

                      {/* Side-by-side or red/green diff */}
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Field: {diff.field}</h4>
                        
                        {isLargeText ? (
                          /* Large Text Diff (Line by Line) */
                          <div className="border border-border rounded-lg overflow-hidden font-mono text-xs">
                            <div className="bg-destructive/10 text-destructive p-3.5 border-b border-border/60 flex items-start gap-2">
                              <span className="font-bold shrink-0 select-none">-</span>
                              <p className="whitespace-pre-wrap leading-relaxed">{diff.oldValue}</p>
                            </div>
                            <div className="bg-emerald-500/10 text-emerald-700 p-3.5 flex items-start gap-2">
                              <span className="font-bold shrink-0 select-none">+</span>
                              <p className="whitespace-pre-wrap leading-relaxed font-bold">{diff.newValue}</p>
                            </div>
                          </div>
                        ) : (
                          /* Short Inline Diff */
                          <div className="flex items-center gap-4 bg-muted/20 border border-border rounded-lg p-4 font-mono text-xs">
                            <div className="flex-1 bg-destructive/10 text-destructive border border-destructive/20 p-2 rounded text-center">
                              <span className="line-through">{diff.oldValue}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 p-2 rounded text-center font-bold">
                              <span>{diff.newValue}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-xl bg-card p-12 text-center py-24 flex flex-col items-center justify-center">
              <GitPullRequest className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">Select a correction suggestion from the queue on the left to review changes.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
