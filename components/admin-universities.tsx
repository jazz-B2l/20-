'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function UniversitiesTab() {
  const supabase = createClient()
  const [universities, setUniversities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name_fr: '',
    name_ar: '',
    wilaya: '',
    city: '',
    website_url: '',
    logo_url: '',
  })

  useEffect(() => {
    loadUniversities()
  }, [])

  const loadUniversities = async () => {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name_fr')

    if (!error) {
      setUniversities(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('universities')
      .insert([formData])

    if (!error) {
      setFormData({
        name_fr: '',
        name_ar: '',
        wilaya: '',
        city: '',
        website_url: '',
        logo_url: '',
      })
      setIsDialogOpen(false)
      loadUniversities()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Universities</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add University</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New University</DialogTitle>
              <DialogDescription>Add a new university to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name_fr">Name (French)</Label>
                <Input
                  id="name_fr"
                  required
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="name_ar">Name (Arabic)</Label>
                <Input
                  id="name_ar"
                  required
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="wilaya">Wilaya</Label>
                <Input
                  id="wilaya"
                  required
                  value={formData.wilaya}
                  onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Add University</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-4 font-semibold">Name</th>
              <th className="text-left py-2 px-4 font-semibold">Wilaya</th>
              <th className="text-left py-2 px-4 font-semibold">City</th>
              <th className="text-left py-2 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {universities.map((uni) => (
              <tr key={uni.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">{uni.name_fr}</td>
                <td className="py-3 px-4">{uni.wilaya}</td>
                <td className="py-3 px-4">{uni.city}</td>
                <td className="py-3 px-4">
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
