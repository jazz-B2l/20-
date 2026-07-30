'use client'

import { useState, useMemo } from 'react'
import { useLanguage } from './language-context'
import { ListingCard } from './listing-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Listing {
  id: string
  specialty_fr: string
  specialty_ar: string
  level: string
  seats: number
  deadline: string
  portal_url: string
  is_published: boolean
  university: {
    name_fr: string
    name_ar: string
    city: string
    wilaya: string
    logo_url: string | null
  }
  domain: {
    name_fr: string
    name_ar: string
  }
}

interface Domain {
  id: string
  name_fr: string
  name_ar: string
  slug: string
}

export function BrowseClient({
  initialListings,
  domains,
  wilayas,
}: {
  initialListings: Listing[]
  domains: Domain[]
  wilayas: string[]
}) {
  const { t, language } = useLanguage()
  const [search, setSearch] = useState('')
  const [selectedWilaya, setSelectedWilaya] = useState<string>('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')

  const filteredListings = useMemo(() => {
    return initialListings.filter(listing => {
      const searchTerm = search.toLowerCase()
      const nameField = language === 'ar' ? 'specialty_ar' : 'specialty_fr'
      const universityNameField = language === 'ar' ? 'name_ar' : 'name_fr'
      
      const matchesSearch =
        listing[nameField].toLowerCase().includes(searchTerm) ||
        listing.university[universityNameField].toLowerCase().includes(searchTerm) ||
        listing.domain[universityNameField].toLowerCase().includes(searchTerm)

      const matchesWilaya = !selectedWilaya || listing.university.wilaya === selectedWilaya
      const matchesDomain = !selectedDomain || listing.domain.id === selectedDomain
      const matchesLevel = !selectedLevel || listing.level === selectedLevel

      return matchesSearch && matchesWilaya && matchesDomain && matchesLevel
    })
  }, [initialListings, search, selectedWilaya, selectedDomain, selectedLevel, language])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">{t('browse.title')}</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <Input
              placeholder={language === 'ar' ? 'ابحث...' : 'Rechercher...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-card border-border"
            />
          </div>

          <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder={t('browse.wilaya')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les wilayas</SelectItem>
              {wilayas.map(wilaya => (
                <SelectItem key={wilaya} value={wilaya}>
                  {wilaya}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder={t('browse.domain')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les domaines</SelectItem>
              {domains.map(domain => (
                <SelectItem key={domain.id} value={domain.id}>
                  {language === 'ar' ? domain.name_ar : domain.name_fr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder={t('browse.level')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les niveaux</SelectItem>
              <SelectItem value="M1">M1</SelectItem>
              <SelectItem value="M2">M2</SelectItem>
            </SelectContent>
          </Select>

          {(search || selectedWilaya || selectedDomain || selectedLevel) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearch('')
                setSelectedWilaya('')
                setSelectedDomain('')
                setSelectedLevel('')
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          {filteredListings.length} résultat{filteredListings.length !== 1 ? 's' : ''} trouvé{filteredListings.length !== 1 ? 's' : ''}
        </p>

        {filteredListings.length > 0 ? (
          <div className="grid gap-6">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Aucun master ne correspond à votre recherche</p>
          </div>
        )}
      </div>
    </div>
  )
}
