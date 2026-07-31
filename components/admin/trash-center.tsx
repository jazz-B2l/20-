'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  RefreshCw,
  AlertTriangle,
  GraduationCap,
  Loader2
} from 'lucide-react'

export function TrashCenter() {
  const supabase = createClient()
  const [archivedOpps, setArchivedOpps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)

  useEffect(() => {
    loadArchived()
  }, [])

  const loadArchived = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        university:universities(name_fr)
      `)
      .eq('workflow_status', 'archived')
      .order('updated_at', { ascending: false })

    if (!error) {
      setArchivedOpps(data || [])
    }
    setLoading(false)
  }

  const handleRestore = async (id: string) => {
    setActioning(id)
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ workflow_status: 'draft' }) // Restore as draft first
        .eq('id', id)

      if (error) throw error
      alert('Opportunity successfully restored as Draft.')
      loadArchived()
    } catch (err) {
      console.error(err)
      alert('Error restoring: ' + (err as any).message)
    } finally {
      setActioning(null)
    }
  }

  const handleDeleteForever = async (id: string) => {
    if (!confirm('WARNING: This will permanently delete this opportunity from the database. This action cannot be undone. Proceed?')) return

    setActioning(id)
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Opportunity deleted forever.')
      loadArchived()
    } catch (err) {
      console.error(err)
      alert('Error deleting permanently: ' + (err as any).message)
    } finally {
      setActioning(null)
    }
  }

  if (loading && archivedOpps.length === 0) return <div>Loading...</div>

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Trash / Archived Center</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Restore soft-deleted records or delete them permanently.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 p-4 rounded-lg mb-6">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 leading-normal">
            <span className="font-bold">Important Note</span>: Opportunities set to &quot;Archived&quot; status function as soft-deleted items. They are hidden from the frontend but can be recovered from this panel at any time.
          </div>
        </div>

        {archivedOpps.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">Trash bin is empty. No archived records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-3 px-4 font-semibold">Program</th>
                  <th className="text-left py-3 px-4 font-semibold">University</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Archived Date</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {archivedOpps.map((opp) => (
                  <tr key={opp.id} className="border-b border-border hover:bg-muted/50 last:border-none">
                    <td className="py-4 px-4 font-semibold text-foreground flex items-center gap-2">
                      <GraduationCap className="h-4.5 w-4.5 text-muted-foreground" />
                      <span>{opp.title_fr}</span>
                    </td>
                    <td className="py-4 px-4">{opp.university?.name_fr || '—'}</td>
                    <td className="py-4 px-4 uppercase text-xs font-semibold">{opp.opportunity_type}</td>
                    <td className="py-4 px-4 font-mono text-xs">
                      {new Date(opp.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(opp.id)}
                          disabled={actioning === opp.id}
                          className="cursor-pointer text-xs font-semibold hover:text-primary hover:bg-primary/5 border-border"
                        >
                          {actioning === opp.id ? (
                            <Loader2 className="animate-spin h-3.5 w-3.5" />
                          ) : (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 mr-1" />
                              Restore
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteForever(opp.id)}
                          disabled={actioning === opp.id}
                          className="cursor-pointer text-xs font-semibold"
                        >
                          {actioning === opp.id ? (
                            <Loader2 className="animate-spin h-3.5 w-3.5" />
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete Forever
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
