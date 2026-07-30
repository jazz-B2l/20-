'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CorrectionsTab() {
  const supabase = createClient()
  const [corrections, setCorrections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCorrections()
  }, [])

  const loadCorrections = async () => {
    const { data, error } = await supabase
      .from('suggested_updates')
      .select(`
        *,
        listing:listings(specialty_fr, specialty_ar, university_id)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!error) {
      setCorrections(data || [])
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('suggested_updates')
      .update({ status })
      .eq('id', id)

    if (!error) {
      loadCorrections()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Community Corrections</h2>

      {corrections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pending corrections</p>
        </div>
      ) : (
        <div className="space-y-4">
          {corrections.map((correction) => (
            <div key={correction.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {correction.listing?.specialty_fr}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(correction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>

              <p className="text-foreground mb-4 whitespace-pre-wrap">{correction.message}</p>

              {correction.contact_email && (
                <p className="text-sm text-muted-foreground mb-4">
                  Email: {correction.contact_email}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => updateStatus(correction.id, 'accepted')}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(correction.id, 'dismissed')}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
