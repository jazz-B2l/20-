'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from './language-context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  Users,
  ExternalLink,
  ArrowLeft,
  ShieldAlert,
  Building2,
  FileText,
  CheckCircle2,
  Info,
  Globe,
  School,
  StickyNote,
  Zap
} from 'lucide-react'
import { ProgramNoteModal } from '@/components/program-note-modal'

interface ListingDetailProps {
  listing: {
    id: string
    specialty_fr: string
    specialty_ar: string
    level: string
    seats: number
    deadline: string
    portal_url: string
    prerequisites_fr?: string | null
    prerequisites_ar?: string | null
    master_programs?: string | null
    required_documents?: string | null
    notes?: string | null
    is_open?: boolean
    faculty_name?: string | null
    unit_type?: string | null
    last_verified_at?: string | null
    academic_year?: string | null
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

function getUniversityInitials(name: string): string {
  if (!name) return 'UNIV'
  const clean = name.trim()
  if (clean === clean.toUpperCase() && clean.length <= 5) {
    return clean
  }
  const words = clean.split(/[\s\-']+/).filter(w => {
    const l = w.toLowerCase()
    return l !== 'de' && l !== 'des' && l !== 'et' && l !== 'la' && l !== 'd' && l !== 'l' && w.length > 1
  })
  if (words.length > 0) {
    const initials = words.map(w => w[0].toUpperCase()).join('')
    if (initials.length > 1) return initials.slice(0, 5)
  }
  return clean.slice(0, 3).toUpperCase()
}

export function ListingDetail({ listing }: ListingDetailProps) {
  const { language, t } = useLanguage()
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [correctionMessage, setCorrectionMessage] = useState('')
  const [correctionEmail, setCorrectionEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)

  const specialty = language === 'ar' ? listing.specialty_ar || listing.specialty_fr : listing.specialty_fr
  const university = language === 'ar' ? listing.university.name_ar || listing.university.name_fr : listing.university.name_fr
  const domain = language === 'ar' ? listing.domain.name_ar : listing.domain.name_fr
  const notes = language === 'ar' ? listing.prerequisites_ar || listing.notes : listing.notes || listing.prerequisites_fr

  const hasDeadline = listing.deadline && !isNaN(Date.parse(listing.deadline))
  const deadlineDate = hasDeadline ? new Date(listing.deadline) : null
  const formattedDeadline = deadlineDate 
    ? deadlineDate.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : (language === 'ar' ? 'غير محدد' : 'Non spécifié')

  // Compute Urgency
  let urgency = 'normal'
  let urgencyText = ''
  if (listing.is_open === false) {
    urgency = 'closed'
    urgencyText = language === 'ar' ? 'انتهى التسجيل' : 'Inscriptions closes'
  } else if (deadlineDate && listing.is_open !== true) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineClean = new Date(deadlineDate)
    deadlineClean.setHours(0, 0, 0, 0)
    const diffTime = deadlineClean.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      urgency = 'closed'
      urgencyText = language === 'ar' ? 'انتهى التسجيل' : 'Inscriptions closes'
    } else if (diffDays <= 1) {
      urgency = 'critical'
      urgencyText = language === 'ar' ? 'ينتهي اليوم/غداً' : 'Clôture aujourd\'hui/demain'
    } else if (diffDays <= 7) {
      urgency = 'warning'
      urgencyText = language === 'ar' ? 'ينتهي قريباً' : 'Clôture proche (≤ 7j)'
    }
  }

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
    <div className="space-y-6 max-w-3xl mx-auto px-2 animate-in fade-in duration-200 select-none text-foreground">
      
      {/* Back button */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-card border border-transparent hover:border-border"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{language === 'ar' ? 'العودة للاستعراض' : 'Retour à l\'accueil'}</span>
      </Link>

      {/* Primary Card Header */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
        
        <div className="flex items-start gap-4">
          {listing.university.logo_url ? (
            <img
              src={listing.university.logo_url}
              alt={university}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-contain border border-border bg-white p-1.5 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary font-bold shrink-0 shadow-xs">
              <span className="text-sm md:text-base font-extrabold uppercase select-none tracking-wide">
                {getUniversityInitials(university)}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold bg-secondary border border-border text-muted-foreground px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                {listing.level}
              </span>
              {listing.academic_year && (
                <span className="text-[10px] font-bold bg-secondary border border-border text-muted-foreground px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {listing.academic_year}
                </span>
              )}
              
              {/* Urgency status badges */}
              {urgency === 'critical' && (
                <span className="text-[10px] font-bold bg-[#B91C1C]/10 text-[#B91C1C] px-2.5 py-0.5 rounded-md uppercase animate-badge-pulse">
                  {urgencyText}
                </span>
              )}
              {urgency === 'warning' && (
                <span className="text-[10px] font-bold bg-[#B45309]/10 text-[#B45309] px-2.5 py-0.5 rounded-md uppercase animate-badge-pulse">
                  {urgencyText}
                </span>
              )}
              {urgency === 'closed' && (
                <span className="text-[10px] font-bold bg-[#B91C1C]/10 text-[#B91C1C] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#B91C1C]/20 shadow-2xs">
                  {urgencyText}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{specialty}</h1>
              <p className="text-sm md:text-base font-semibold text-muted-foreground mt-1">{university}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Grid of Key Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('browse.domain')}
          </span>
          <p className="text-sm font-bold text-foreground">{domain}</p>
        </div>

        {listing.seats > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('listing.seats')}
            </span>
            <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{listing.seats} {language === 'ar' ? 'مقاعد متوفرة' : 'places disponibles'}</span>
            </p>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('listing.deadline')}
          </span>
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDeadline}</span>
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Localisation / Wilaya
          </span>
          <p className="text-sm font-bold text-foreground">
            {listing.university.wilaya}, {listing.university.city}
          </p>
        </div>

      </div>

      {/* Faculty / Unit Details */}
      {listing.faculty_name && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            <span>{language === 'ar' ? 'الكلية / المعهد' : 'Faculté / Institut Rattaché'}</span>
          </div>
          <p className="text-base font-bold text-foreground">{listing.faculty_name}</p>
        </div>
      )}

      {/* Master Programs List */}
      {listing.master_programs && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
            <FileText className="h-4 w-4 text-primary" />
            <span>{language === 'ar' ? 'برامج الماجستير المتاحة (كوتا 20٪)' : 'Programmes de Master Ouverts (Quota 20%)'}</span>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {listing.master_programs}
          </p>
        </div>
      )}

      {/* Required Documents */}
      {listing.required_documents && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>{language === 'ar' ? 'الملف المطلوب والمستندات' : 'Dossier & Documents Requis'}</span>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {listing.required_documents}
          </p>
        </div>
      )}

      {/* Notes / Instructions */}
      {notes && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Info className="h-4 w-4 text-primary" />
            <span>{language === 'ar' ? 'ملاحظات وتعليمات هامة' : 'Consignes & Remarques'}</span>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {notes}
          </p>
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {listing.portal_url && (
          urgency === 'closed' ? (
            <a
              href={listing.portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 text-sm font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer select-none"
            >
              <span>{language === 'ar' ? 'البوابة (التسجيل منتهي)' : 'Portail (inscriptions closes)'}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <a
              href={listing.portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-bold py-2.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>{t('listing.portal')}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )
        )}
        {listing.university.website_url && (
          <a
            href={listing.university.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground text-sm font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer"
          >
            <Globe className="h-4 w-4" />
            <span>{language === 'ar' ? 'موقع الجامعة' : 'Site de l\'université'}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <button
          type="button"
          onClick={() => setIsNoteModalOpen(true)}
          className="inline-flex items-center justify-center bg-amber-500/15 dark:bg-amber-400/20 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-orange-500/40 hover:border-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.2)] hover:shadow-[0_0_12px_rgba(249,115,22,0.35)] text-sm font-extrabold py-2.5 px-6 rounded-xl transition-all duration-200 cursor-pointer transform active:scale-95 select-none"
        >
          <span>{t('note.btn')}</span>
        </button>
      </div>

      {/* Community Suggestion / Correction Form */}
      <div className="bg-secondary/40 border border-border rounded-xl p-5 shadow-xs">
        {!showCorrectionForm ? (
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="w-full py-2.5 px-4 bg-amber-500/15 dark:bg-amber-400/20 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-orange-500/40 hover:border-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.2)] hover:shadow-[0_0_12px_rgba(249,115,22,0.35)] rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer transform active:scale-95 select-none"
          >
            <span>{t('note.modal_title')}</span>
          </button>
        ) : (
          <form onSubmit={handleSubmitCorrection} className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4" />
              <span>{t('form.suggest_update')}</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground">
                {t('form.message')}
              </label>
              <Textarea
                placeholder={language === 'ar' ? 'أخبرنا عن الخطأ أو المعلومات الجديدة بالتفصيل...' : 'Décrivez en détails le changement ou l\'erreur constatée...'}
                value={correctionMessage}
                onChange={e => setCorrectionMessage(e.target.value)}
                required
                className="bg-card border-border text-sm rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/25 text-foreground placeholder:text-muted-foreground"
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground">
                {t('form.email')}
              </label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={correctionEmail}
                onChange={e => setCorrectionEmail(e.target.value)}
                className="bg-card border-border text-sm rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/25 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                disabled={isSubmitting || !correctionMessage.trim()}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl h-9 cursor-pointer"
              >
                {isSubmitting ? (language === 'ar' ? 'جاري الإرسال...' : 'Envoi...') : t('form.submit')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCorrectionForm(false)
                  setCorrectionMessage('')
                  setCorrectionEmail('')
                }}
                className="text-xs font-bold rounded-xl h-9 cursor-pointer border-border hover:bg-card text-muted-foreground"
              >
                {language === 'ar' ? 'إلغاء' : 'Annuler'}
              </Button>
            </div>

            {submitSuccess && (
              <p className="text-xs text-primary font-bold bg-primary/10 p-2.5 rounded-lg">
                {t('form.thanks')}
              </p>
            )}
          </form>
        )}
      </div>

      <ProgramNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        program={{
          id: listing.id,
          title: specialty,
          universityName: university,
          facultyName: listing.faculty_name || undefined,
          level: listing.level
        }}
      />

    </div>
  )
}
