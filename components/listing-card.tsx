'use client'

import { useState } from 'react'
import { useLanguage } from './language-context'
import {
  Calendar,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building2,
  FileText,
  CheckCircle2,
  Info,
  Globe,
  MapPin,
  GraduationCap,
  BookOpen
} from 'lucide-react'

interface ListingCardProps {
  listing: {
    id: string
    university: {
      id?: string
      name_fr: string
      name_ar: string
      city: string
      wilaya: string
      logo_url: string | null
      website_url?: string | null
    }
    offers: Array<{
      id: string
      specialty_fr: string
      specialty_ar: string
      level: string
      seats: number
      deadline: string
      portal_url: string
      master_programs?: string | null
      required_documents?: string | null
      notes?: string | null
      faculty_name?: string | null
      unit_type?: string | null
      prerequisites_fr?: string | null
      prerequisites_ar?: string | null
      domain: {
        id: string
        name_fr: string
        name_ar: string
      }
    }>
  }
}

// Extract acronym/initials from university name (e.g. USTO, USTHB, UMC)
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

export function ListingCard({ listing }: ListingCardProps) {
  const { language } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const university = language === 'ar' ? listing.university.name_ar || listing.university.name_fr : listing.university.name_fr

  // Compute Overall/Earliest Urgency and Deadlines for the header info
  let earliestDeadlineDate: Date | null = null
  let totalSeats = 0
  let earliestDeadlineStr = ''

  listing.offers.forEach(offer => {
    totalSeats += offer.seats || 0
    if (offer.deadline && !isNaN(Date.parse(offer.deadline))) {
      const d = new Date(offer.deadline)
      if (!earliestDeadlineDate || d < earliestDeadlineDate) {
        earliestDeadlineDate = d
        earliestDeadlineStr = offer.deadline
      }
    }
  })

  const hasDeadline = earliestDeadlineDate !== null
  const formattedDeadline = earliestDeadlineDate 
    ? earliestDeadlineDate.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : (language === 'ar' ? 'غير محدد' : 'Non spécifié')

  // Compute Urgency of the overall group based on the earliest active deadline
  let urgency = 'normal'
  let urgencyText = ''
  if (earliestDeadlineDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineClean = new Date(earliestDeadlineDate)
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

  // Unified domain and level descriptions
  const uniqueLevels = Array.from(new Set(listing.offers.map(o => o.level)))
  const levelBadgeText = uniqueLevels.join(' / ')

  const uniqueDomains = Array.from(new Set(listing.offers.map(o => language === 'ar' ? o.domain.name_ar : o.domain.name_fr)))
  const domainBadgeText = uniqueDomains.length === 1 
    ? uniqueDomains[0] 
    : (language === 'ar' ? 'مجالات متعددة' : 'Domaines multiples')

  const uniqueFaculties = Array.from(new Set(listing.offers.map(o => o.faculty_name).filter(Boolean)))
  const facultiesText = uniqueFaculties.join(' • ')

  const toggleExpand = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button.action-btn')) return
    setIsExpanded(!isExpanded)
  }

  // Primary apply button is shown in header only if there is exactly 1 offer
  const singleOffer = listing.offers.length === 1 ? listing.offers[0] : null
  const showHeaderApply = singleOffer !== null && singleOffer.portal_url && urgency !== 'closed'

  return (
    <div 
      onClick={toggleExpand}
      className={`bg-card border border-y-border border-r-border border-l-4 border-l-primary transition-all duration-200 ease-in-out rounded-2xl p-5 select-none relative group cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
        isExpanded 
          ? 'shadow-md ring-1 ring-primary/20 border-y-primary border-r-primary' 
          : 'hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        
        {/* Main Header Info with Logo */}
        <div className="space-y-3 flex-1 min-w-0 text-foreground">
          
          <div className="flex items-start gap-3.5">
            {/* University Logo / Monogram Fallback Badge */}
            {listing.university.logo_url ? (
              <img
                src={listing.university.logo_url}
                alt={university}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-contain border border-border bg-white p-1.5 shrink-0 shadow-xs animate-in fade-in duration-255"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary shrink-0 shadow-xs group-hover:border-primary/40 group-hover:bg-primary/5 transition-all select-none">
                <span className="text-sm md:text-base font-extrabold tracking-wide uppercase">
                  {getUniversityInitials(university)}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold bg-secondary border border-border text-muted-foreground px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {levelBadgeText}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground bg-secondary border border-border px-2.5 py-0.5 rounded-md truncate max-w-[220px]">
                  {domainBadgeText}
                </span>
                
                {listing.offers.length > 1 && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                    {listing.offers.length} {language === 'ar' ? 'عروض / كليات' : 'offres disponibles'}
                  </span>
                )}
                
                {/* Urgency Badge */}
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
                <h3 className="text-base md:text-lg font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {university}
                </h3>
                <p className="text-xs text-muted-foreground font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
                  {facultiesText && (
                    <span className="text-foreground font-bold">{facultiesText}</span>
                  )}
                  <span className="text-border select-none">|</span>
                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="italic">{listing.university.city}, {listing.university.wilaya}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Summary */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs text-muted-foreground">
            {totalSeats > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong className="text-foreground">{totalSeats}</strong> {language === 'ar' ? 'مقعد متاح' : `place${totalSeats !== 1 ? 's' : ''}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {language === 'ar' ? 'أقرب موعد:' : 'Earliest deadline:'} <strong className="text-foreground">{formattedDeadline}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Status-Aware CTA */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 border-t border-border md:border-t-0 md:pt-0">
          
          {showHeaderApply && singleOffer && (
            <a
              href={singleOffer.portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>{language === 'ar' ? 'تقديم الآن' : 'Postuler sur le portail'}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="action-btn p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              title={isExpanded ? 'Réduire' : 'Développer'}
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

        </div>

      </div>

      {/* Expanded Details List per Faculty */}
      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-border space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {listing.offers.map((offer, index) => {
            const offerNotes = language === 'ar' ? offer.prerequisites_ar || offer.notes : offer.notes || offer.prerequisites_fr
            const hasOfferDeadline = offer.deadline && !isNaN(Date.parse(offer.deadline))
            const offerDeadlineDate = hasOfferDeadline ? new Date(offer.deadline) : null
            const formattedOfferDeadline = offerDeadlineDate 
              ? offerDeadlineDate.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
              : (language === 'ar' ? 'غير محدد' : 'Non spécifié')
            
            let offerUrgency = 'normal'
            if (offerDeadlineDate) {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const dClean = new Date(offerDeadlineDate)
              dClean.setHours(0, 0, 0, 0)
              const diffDays = Math.ceil((dClean.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              if (diffDays < 0) {
                offerUrgency = 'closed'
              }
            }

            return (
              <div key={offer.id} className={`${index > 0 ? 'border-t border-border/60 pt-5 mt-5' : ''} space-y-3`}>
                
                {/* Faculty / Unit Header Box */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-secondary/20 dark:bg-secondary/10 p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bold text-xs md:text-sm text-foreground">
                      {language === 'ar' ? 'الكلية / المعهد:' : 'Faculté / Institut :'} {offer.faculty_name || 'Général'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {offer.seats > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span><strong>{offer.seats}</strong> places</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{language === 'ar' ? 'الموعد:' : 'Deadline:'} <strong>{formattedOfferDeadline}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Details list for this faculty */}
                <div className="divide-y divide-border/40 text-sm pl-1 pr-1">
                  
                  {/* Master Programs */}
                  {offer.master_programs && (
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                      <span className="w-full sm:w-44 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 shrink-0 select-none">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        {language === 'ar' ? 'البرامج المتاحة' : 'Masters Ouverts'}
                      </span>
                      <span className="text-xs md:text-sm text-foreground whitespace-pre-wrap leading-relaxed font-semibold">{offer.master_programs}</span>
                    </div>
                  )}

                  {/* Required Documents */}
                  {offer.required_documents && (
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                      <span className="w-full sm:w-44 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 shrink-0 select-none">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        {language === 'ar' ? 'الملف المطلوب' : 'Documents Requis'}
                      </span>
                      <span className="text-xs md:text-sm text-foreground whitespace-pre-wrap leading-relaxed font-semibold">{offer.required_documents}</span>
                    </div>
                  )}

                  {/* Notes / Prerequisites */}
                  {offerNotes && (
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                      <span className="w-full sm:w-44 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 shrink-0 select-none">
                        <Info className="h-3.5 w-3.5 text-primary" />
                        {language === 'ar' ? 'إرشادات هامّة' : 'Consignes'}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-medium">{offerNotes}</span>
                    </div>
                  )}
                </div>

                {/* Apply Button / Action Links for this Faculty */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {offer.portal_url && (
                    offerUrgency === 'closed' ? (
                      <a
                        href={offer.portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border border-border bg-secondary text-muted-foreground hover:text-foreground text-xs font-bold py-1.5 px-3.5 rounded-lg transition-all"
                      >
                        <span>{language === 'ar' ? 'البوابة (مغلق)' : 'Portail (inscriptions closes)'}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <a
                        href={offer.portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold py-1.5 px-3.5 rounded-lg shadow-xs"
                      >
                        <span>{language === 'ar' ? 'رابط التسجيل للمعهد' : 'Postuler pour cette faculté'}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )
                  )}
                </div>

              </div>
            )
          })}

          {/* Global University Website Button */}
          {listing.university.website_url && (
            <div className="pt-2 border-t border-border flex justify-end">
              <a
                href={listing.university.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-card border border-border hover:border-primary text-muted-foreground hover:text-foreground hover:bg-secondary text-xs font-bold py-2 px-4 rounded-xl transition-all cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>{language === 'ar' ? 'الموقع الرسمي للجامعة' : 'Site de l\'université'}</span>
              </a>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
