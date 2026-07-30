import { Header } from '@/components/header'
import { ListingDetail } from '@/components/listing-detail'
import { getListingById } from '@/lib/data'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const listing = await getListingById(params.id)
  
  if (!listing) {
    return { title: 'Master non trouvé' }
  }

  return {
    title: `${listing.specialty_fr} - 20%`,
    description: listing.specialty_fr,
  }
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await getListingById(params.id)

  if (!listing) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ListingDetail listing={listing} />
      </main>
    </div>
  )
}
