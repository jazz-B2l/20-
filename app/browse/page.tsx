import { Header } from '@/components/header'
import { BrowseClient } from '@/components/browse-client'
import { getListings, getDomains, getWilayas } from '@/lib/data'

export const metadata = {
  title: 'Parcourir les Masters - 20%',
  description: 'Explorez les programmes de master disponibles dans les universités algériennes',
}

export default async function BrowsePage() {
  const [listings, domains, wilayas] = await Promise.all([
    getListings(),
    getDomains(),
    getWilayas(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BrowseClient 
          initialListings={listings}
          domains={domains}
          wilayas={wilayas}
        />
      </main>
    </div>
  )
}
