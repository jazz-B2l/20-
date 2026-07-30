'use client'

import Link from 'next/link'
import { useLanguage } from './language-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ListingCardProps {
  listing: {
    id: string
    specialty_fr: string
    specialty_ar: string
    level: string
    seats: number
    deadline: string
    portal_url: string
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
}

export function ListingCard({ listing }: ListingCardProps) {
  const { language, t } = useLanguage()
  const isDeadlineSoon = new Date(listing.deadline) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

  const specialty = language === 'ar' ? listing.specialty_ar : listing.specialty_fr
  const university = language === 'ar' ? listing.university.name_ar : listing.university.name_fr
  const domain = language === 'ar' ? listing.domain.name_ar : listing.domain.name_fr

  const deadlineDate = new Date(listing.deadline)
  const formattedDeadline = deadlineDate.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR')

  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-accent transition-all cursor-pointer">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Logo */}
          {listing.university.logo_url && (
            <div className="flex-shrink-0">
              <img
                src={listing.university.logo_url}
                alt={university}
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <div>
                <h3 className="text-xl font-semibold text-foreground truncate">
                  {specialty}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {university}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="whitespace-nowrap">
                  {listing.level}
                </Badge>
                {isDeadlineSoon && (
                  <Badge variant="destructive" className="whitespace-nowrap">
                    {language === 'ar' ? 'عاجل' : 'Urgent'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">{t('listing.seats')}</p>
                <p className="font-semibold text-foreground">{listing.seats}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{t('listing.deadline')}</p>
                <p className="font-semibold text-foreground">{formattedDeadline}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{t('browse.domain')}</p>
                <p className="font-semibold text-foreground truncate">{domain}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Wilaya</p>
                <p className="font-semibold text-foreground">{listing.university.wilaya}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/listing/${listing.id}`}>
                  {language === 'ar' ? 'التفاصيل' : 'Détails'}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <a href={listing.portal_url} target="_blank" rel="noopener noreferrer">
                  {t('listing.portal')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
