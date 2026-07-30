'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from './language-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface ListingDetailProps {
  listing: {
    id: string
    specialty_fr: string
    specialty_ar: string
    level: string
    seats: number
    deadline: string
    portal_url: string
    prerequisites_fr: string | null
    prerequisites_ar: string | null
    last_verified_at: string | null
    academic_year: string
    university: {
      id: string
      name_fr: string
      name_ar: string
      city: string
      wilaya: string
      logo_url: string | null
      website_url: string | null
    }
    domain: {
      name_fr: string
      name_ar: string
    }
  }
}

export function ListingDetail({ listing }: ListingDetailProps) {
  const { language, t } = useLanguage()
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [correctionMessage, setCorrectionMessage] = useState('')
  const [correctionEmail, setCorrectionEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const specialty = language === 'ar' ? listing.specialty_ar : listing.specialty_fr
  const university = language === 'ar' ? listing.university.name_ar : listing.university.name_fr
  const domain = language === 'ar' ? listing.domain.name_ar : listing.domain.name_fr
  const prerequisites = language === 'ar' ? listing.prerequisites_ar : listing.prerequisites_fr

  const deadlineDate = new Date(listing.deadline)
  const formattedDeadline = deadlineDate.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR')
  const isDeadlineSoon = deadlineDate < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!correctionMessage.trim()) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('suggested_updates')
        .insert([
          {
            listing_id: listing.id,
            message: correctionMessage,
            contact_email: correctionEmail || null,
          },
        ])

      if (error) throw error

      setSubmitSuccess(true)
      setCorrectionMessage('')
      setCorrectionEmail('')
      setTimeout(() => {
        setShowCorrectionForm(false)
        setSubmitSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Error submitting correction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link href="/browse" className="text-accent hover:text-accent/80 text-sm font-medium">
        ← {language === 'ar' ? 'العودة' : 'Retour'}
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start mb-6">
          {listing.university.logo_url && (
            <img
              src={listing.university.logo_url}
              alt={university}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{specialty}</h1>
            <p className="text-lg text-muted-foreground mb-3">{university}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge>{listing.level}</Badge>
              <Badge variant="outline">{listing.academic_year}</Badge>
              {isDeadlineSoon && <Badge variant="destructive">{language === 'ar' ? 'عاجل' : 'Urgent'}</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-lg text-foreground mb-4">{t('browse.domain')}</h2>
          <p className="text-foreground">{domain}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-lg text-foreground mb-4">{t('listing.seats')}</h2>
          <p className="text-foreground">{listing.seats} {language === 'ar' ? 'مقعد' : 'places'}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-lg text-foreground mb-4">{t('listing.deadline')}</h2>
          <p className="text-foreground">{formattedDeadline}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-lg text-foreground mb-4">Wilaya</h2>
          <p className="text-foreground">{listing.university.wilaya}, {listing.university.city}</p>
        </div>
      </div>

      {/* Prerequisites */}
      {prerequisites && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-lg text-foreground mb-4">{t('listing.prerequisites')}</h2>
          <p className="text-foreground whitespace-pre-wrap">{prerequisites}</p>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" asChild>
          <a href={listing.portal_url} target="_blank" rel="noopener noreferrer">
            {t('listing.portal')} ↗
          </a>
        </Button>
        {listing.university.website_url && (
          <Button variant="outline" size="lg" asChild>
            <a href={listing.university.website_url} target="_blank" rel="noopener noreferrer">
              {language === 'ar' ? 'موقع الجامعة' : 'Site de l\'université'} ↗
            </a>
          </Button>
        )}
      </div>

      {/* Correction Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        {!showCorrectionForm ? (
          <Button
            variant="outline"
            onClick={() => setShowCorrectionForm(true)}
            className="w-full"
          >
            {t('form.suggest_update')}
          </Button>
        ) : (
          <form onSubmit={handleSubmitCorrection} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('form.message')}
              </label>
              <Textarea
                placeholder={language === 'ar' ? 'أخبرنا عن التصحيح...' : 'Décrivez la correction...'}
                value={correctionMessage}
                onChange={e => setCorrectionMessage(e.target.value)}
                required
                className="bg-background border-border"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('form.email')}
              </label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={correctionEmail}
                onChange={e => setCorrectionEmail(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || !correctionMessage.trim()}
              >
                {isSubmitting ? (language === 'ar' ? 'جاري...' : 'Envoi...') : t('form.submit')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCorrectionForm(false)
                  setCorrectionMessage('')
                  setCorrectionEmail('')
                }}
              >
                {language === 'ar' ? 'إلغاء' : 'Annuler'}
              </Button>
            </div>

            {submitSuccess && (
              <p className="text-sm text-accent font-medium">
                {language === 'ar' ? 'تم إرسال التصحيح بنجاح!' : 'Correction envoyée avec succès!'}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
