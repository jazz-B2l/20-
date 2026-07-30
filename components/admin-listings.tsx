'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function ListingsTab() {
  const supabase = createClient()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        university:universities(name_fr, name_ar),
        domain:domains(name_fr, name_ar)
      `)
      .order('deadline', { ascending: true })

    if (!error) {
      setListings(data || [])
    }
    setLoading(false)
  }

  const togglePublish = async (id: string, isPublished: boolean) => {
    const { error } = await supabase
      .from('listings')
      .update({ is_published: !isPublished })
      .eq('id', id)

    if (!error) {
      loadListings()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Listings</h2>
        <Button>Add Listing</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-4 font-semibold">Specialty</th>
              <th className="text-left py-2 px-4 font-semibold">University</th>
              <th className="text-left py-2 px-4 font-semibold">Level</th>
              <th className="text-left py-2 px-4 font-semibold">Deadline</th>
              <th className="text-left py-2 px-4 font-semibold">Status</th>
              <th className="text-left py-2 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">{listing.specialty_fr}</td>
                <td className="py-3 px-4">{listing.university.name_fr}</td>
                <td className="py-3 px-4">{listing.level}</td>
                <td className="py-3 px-4">{new Date(listing.deadline).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <Badge variant={listing.is_published ? 'default' : 'outline'}>
                    {listing.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="py-3 px-4 space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePublish(listing.id, listing.is_published)}
                  >
                    {listing.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
