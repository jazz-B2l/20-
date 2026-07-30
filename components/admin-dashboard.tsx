'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UniversitiesTab } from './admin-universities'
import { ListingsTab } from './admin-listings'
import { CorrectionsTab } from './admin-corrections'
import { User } from '@supabase/supabase-js'

export function AdminDashboard({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('overview')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center text-accent-foreground text-sm">
                20
              </div>
              Admin
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="universities">Universities</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="corrections">Corrections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="grid md:grid-cols-4 gap-6">
              <StatCard title="Total Universities" value="—" />
              <StatCard title="Total Listings" value="—" />
              <StatCard title="Published" value="—" />
              <StatCard title="Pending Review" value="—" />
            </div>
          </TabsContent>

          <TabsContent value="universities" className="mt-8">
            <UniversitiesTab />
          </TabsContent>

          <TabsContent value="listings" className="mt-8">
            <ListingsTab />
          </TabsContent>

          <TabsContent value="corrections" className="mt-8">
            <CorrectionsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}
