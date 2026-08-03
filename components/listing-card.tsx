'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/language-context'
import { translateFacultyName } from '@/lib/faculty-translations'
import { WILAYAS } from '@/lib/wilayas'
import {
  Calendar,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building2,
  FileText,
  MapPin,
  GraduationCap,
  BookOpen,
  Bookmark,
  Share2,
  Trophy,
  Check,
  Binary,
  HeartPulse,
  Scale,
  Languages,
  Leaf,
  TrendingUp,
  Atom,
  FlaskConical,
  Stethoscope,
  Cog,
  Compass,
  Pill,
  Dna
} from 'lucide-react'
import { FilterTooltip } from '@/components/ui/filter-tooltip'

export interface ListingCardProps {
  listing: {
    id: string
    opportunity_type?: 'master' | 'concours' | 'doctorate'
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
      is_open?: boolean
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
  viewMode?: 'grid' | 'list'
}

// Helper function to resolve study domain icon, text color, and subtle tinted background
function getDomainTheme(domainNameFr?: string, facultyNameFr?: string) {
  const text = `${domainNameFr || ''} ${facultyNameFr || ''}`.toLowerCase()

  // 1. Chemistry (Glass Flasks / Bottles / Reagents)
  if (text.includes('chimie') || text.includes('chemistry') || text.includes('الكيمياء')) {
    return {
      type: 'chemistry',
      icon: FlaskConical,
      colorClass: 'text-amber-500 dark:text-amber-400',
      bgClass: 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
    }
  }

  // 2. Math & Computer Science / AI / Cyber (Binary Matrix Pattern)
  if (text.includes('math') || text.includes('informatique') || text.includes('computer') || text.includes('cyber') || text.includes('ai') || text.includes('إعلام') || text.includes('رياضيات')) {
    return {
      type: 'math-info',
      icon: Binary,
      colorClass: 'text-sky-500 dark:text-sky-400',
      bgClass: 'bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/30 hover:border-sky-500/60',
      badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
    }
  }

  // 3. Mechanical Engineering (Gears / Cogs)
  if (text.includes('mécanique') || text.includes('mechanical') || text.includes('ميكانيكية')) {
    return {
      type: 'mechanical',
      icon: Cog,
      colorClass: 'text-slate-500 dark:text-slate-400',
      bgClass: 'bg-slate-500/5 dark:bg-slate-500/10 border-slate-500/30 hover:border-slate-500/60',
      badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300'
    }
  }

  // 4. Architecture & Civil Engineering (Compass / Drafting)
  if (text.includes('architecture') || text.includes('génie civil') || text.includes('civil') || text.includes('معمارية') || text.includes('مدنية')) {
    return {
      type: 'architecture',
      icon: Compass,
      colorClass: 'text-orange-500 dark:text-orange-400',
      bgClass: 'bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/30 hover:border-orange-500/60',
      badgeClass: 'bg-orange-500/15 text-orange-700 dark:text-orange-300'
    }
  }

  // 5. Physics / Electronics / Atoms
  if (text.includes('physique') || text.includes('électrique') || text.includes('électronique') || text.includes('فيزياء') || text.includes('كهربائية')) {
    return {
      type: 'physics',
      icon: Atom,
      colorClass: 'text-cyan-500 dark:text-cyan-400',
      bgClass: 'bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/60',
      badgeClass: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
    }
  }

  // 6. Medicine & Health & Pharmacy (Stethoscope / Pill)
  if (text.includes('méd') || text.includes('santé') || text.includes('medecine') || text.includes('pharma') || text.includes('طب') || text.includes('صيدلة')) {
    return {
      type: 'medicine',
      icon: Stethoscope,
      colorClass: 'text-rose-500 dark:text-rose-400',
      bgClass: 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60',
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
    }
  }

  // 7. Law & Legal (Scale)
  if (text.includes('droit') || text.includes('politique') || text.includes('law') || text.includes('حقوق')) {
    return {
      type: 'law',
      icon: Scale,
      colorClass: 'text-yellow-600 dark:text-yellow-400',
      bgClass: 'bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/60',
      badgeClass: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300'
    }
  }

  // 8. Biology / Life & Earth Sciences (DNA / Leaf)
  if (text.includes('nature') || text.includes('vie') || text.includes('agronomie') || text.includes('bio') || text.includes('بيولوجيا') || text.includes('أرض')) {
    return {
      type: 'biology',
      icon: Dna,
      colorClass: 'text-emerald-500 dark:text-emerald-400',
      bgClass: 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
    }
  }

  // 9. Economics & Management (Trending Chart)
  if (text.includes('écon') || text.includes('gestion') || text.includes('commerce') || text.includes('business') || text.includes('اقتصاد') || text.includes('تسيير')) {
    return {
      type: 'economics',
      icon: TrendingUp,
      colorClass: 'text-indigo-500 dark:text-indigo-400',
      bgClass: 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/60',
      badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
    }
  }

  return {
    type: 'general',
    icon: BookOpen,
    colorClass: 'text-primary',
    bgClass: 'bg-secondary/30 border-border hover:border-primary/40 hover:bg-secondary/50',
    badgeClass: 'bg-primary/10 text-primary'
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

export function ListingCard({ listing, viewMode = 'grid' }: ListingCardProps) {
  const { language } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)

  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>(() => {
    if (listing.offers.length === 1) {
      return { [listing.offers[0].id]: true }
    }
    return {}
  })

  const toggleOfferExpand = (offerId: string) => {
    setExpandedOffers(prev => ({
      ...prev,
      [offerId]: !prev[offerId]
    }))
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/listing/${listing.id}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
  }

  const university = language === 'ar' ? listing.university.name_ar || listing.university.name_fr : listing.university.name_fr

  // Compute Overall/Earliest Urgency and Deadlines for header info
  let earliestDeadlineDate: Date | null = null
  let totalSeats = 0

  listing.offers.forEach(offer => {
    totalSeats += offer.seats || 0
    if (offer.deadline && !isNaN(Date.parse(offer.deadline))) {
      const d = new Date(offer.deadline)
      if (!earliestDeadlineDate || d < earliestDeadlineDate) {
        earliestDeadlineDate = d
      }
    }
  })

  const formattedDeadline = earliestDeadlineDate 
    ? earliestDeadlineDate.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', { day: 'numeric', month: 'short' }) 
    : (language === 'ar' ? 'غير محدد' : 'Not specified')

  // Compute Urgency
  let urgency = 'normal'
  let urgencyText = ''

  const allClosed = listing.offers.every(o => o.is_open === false)
  const hasForceOpen = listing.offers.some(o => o.is_open === true)

  if (allClosed) {
    urgency = 'closed'
    urgencyText = language === 'ar' ? 'انتهى' : 'Closed'
  } else if (earliestDeadlineDate && !hasForceOpen) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineClean = new Date(earliestDeadlineDate)
    deadlineClean.setHours(0, 0, 0, 0)
    const diffTime = deadlineClean.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      urgency = 'closed'
      urgencyText = language === 'ar' ? 'انتهى' : 'Closed'
    } else if (diffDays <= 1) {
      urgency = 'critical'
      urgencyText = language === 'ar' ? 'ينتهي قريباً' : 'Closing Soon'
    } else if (diffDays <= 7) {
      urgency = 'warning'
      urgencyText = language === 'ar' ? 'ينتهي قريباً' : 'Closing Soon'
    }
  }

  const getWilayaLabel = (wName: string) => {
    if (!wName) return ''
    if (language === 'ar') {
      const found = WILAYAS.find(w => w.name_fr.toLowerCase() === wName.trim().toLowerCase() || wName.toLowerCase().includes(w.name_fr.toLowerCase()))
      return found ? found.name_ar : wName
    }
    return wName
  }

  const getCityLabel = (cName: string) => {
    if (!cName) return ''
    if (language === 'ar') {
      const c = cName.trim().toLowerCase()
      if (c.includes('alger') || c.includes('bab ezzouar')) return 'باب الزوار'
      if (c.includes('oran') || c.includes('bir el djir') || c.includes('es senia') || c.includes('jamal')) return 'وهران'
      if (c.includes('constantine')) return 'قسنطينة'
      if (c.includes('blida')) return 'البليدة'
      if (c.includes('tlemcen')) return 'تلمسان'
      if (c.includes('annaba')) return 'عنابة'
      if (c.includes('setif')) return 'سطيف'
      if (c.includes('batna')) return 'باتنة'
      if (c.includes('bejaia')) return 'بجاية'
      return cName
    }
    return cName
  }

  const singleOffer = listing.offers.length === 1 ? listing.offers[0] : null
  const showHeaderApply = singleOffer !== null && singleOffer.portal_url && urgency !== 'closed'

  const isConcoursType = listing.opportunity_type === 'concours' || listing.offers.some(o => o.unit_type === 'school' || o.level === 'Concours')

  return (
    <div 
      id={`opportunity-${listing.id}`}
      className={`bg-card border border-border transition-all duration-200 rounded-2xl p-4 shadow-2xs relative group ${
        isExpanded 
          ? 'ring-1 ring-primary/40 border-primary' 
          : 'hover:border-primary/40 hover:shadow-xs'
      } ${isConcoursType ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-primary'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Main Info Header: Logo + Title + Location */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Logo / Monogram */}
          {listing.university.logo_url ? (
            <img
              src={listing.university.logo_url}
              alt={university}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain border border-border bg-white p-1.5 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary shrink-0 select-none shadow-xs">
              <span className="text-sm sm:text-base font-black tracking-wide uppercase">
                {getUniversityInitials(university)}
              </span>
            </div>
          )}

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Badge */}
              {urgency === 'closed' ? (
                <span className="text-[9px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded uppercase">
                  {language === 'ar' ? 'مغلق' : 'Closed'}
                </span>
              ) : (
                <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded uppercase">
                  {language === 'ar' ? 'مفتوح' : 'Open'}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-foreground truncate leading-snug">
              {university}
            </h3>

            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span>
                {language === 'ar'
                  ? `${getCityLabel(listing.university.city)}، ${getWilayaLabel(listing.university.wilaya)}`
                  : `${listing.university.city}, ${listing.university.wilaya}`}
              </span>
            </p>
          </div>
        </div>

        {/* Metrics & Separate Expand Action Bar */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0 shrink-0 text-xs">
          
          <div className="flex items-center gap-3 text-muted-foreground font-semibold text-[11px]">
            {totalSeats > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <strong className="text-foreground">{totalSeats}</strong>
              </span>
            )}
            {earliestDeadlineDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDeadline}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Bookmark Icon */}
            <button
              type="button"
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
              }`}
              title={isBookmarked ? 'Saved' : 'Save'}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Separate Expand Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{isExpanded ? (language === 'ar' ? 'إخفاء' : 'Close') : (language === 'ar' ? 'التفاصيل' : 'Details')}</span>
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

        </div>

      </div>

      {/* Expanded Accordion Offers Feed */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>{language === 'ar' ? 'التخصصات والبرامج المتاحة' : 'Available Programs & Specialty Portals'}</span>
            </h4>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {listing.offers.length} {language === 'ar' ? 'برنامج' : 'programs'}
            </span>
          </div>

          <div className="space-y-2.5">
            {listing.offers.map((offer) => {
              const isOfferExpanded = listing.offers.length === 1 ? expandedOffers[offer.id] !== false : expandedOffers[offer.id] === true
              const offerUrgency = offer.is_open === false ? 'closed' : 'open'
              const domainTheme = getDomainTheme(offer.domain?.name_fr, offer.faculty_name)
              const DomainIconComp = domainTheme.icon

              return (
                <div
                  key={offer.id}
                  onClick={() => toggleOfferExpand(offer.id)}
                  className={`border rounded-xl p-3 transition-all cursor-pointer select-none relative overflow-hidden ${
                    offerUrgency === 'closed'
                      ? 'bg-destructive/5 border-destructive/20'
                      : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/25 hover:border-emerald-500/50 shadow-2xs'
                  }`}
                >
                  {/* Full Card Binary Matrix Overlay ONLY for Mathematics & Computer Science */}
                  {domainTheme.type === 'math-info' ? (
                    <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.14] pointer-events-none select-none font-mono text-[9px] leading-[11px] tracking-[0.2em] text-emerald-600 dark:text-emerald-400 overflow-hidden break-all p-1 z-0">
                      11011101100000010010001011101011011110010000100001110101010000101101011111000010000000001101011000010010010010101000100100011001001110110100110101110011001011000100100011111000001110110011100111000010000100011000100110011000100000010100110101110010100001100000000001011011110110000000110000111011010001011111111001110001100010100001001000111000000001101110110000001001000101110101101111001000010000111010101000010110101111100001000000000110101100001001001001010100010010001100100111011010011010111001100101100010010001111100000111011001110011100001000010001100010011001100010000001010011010111001010000110000000000101101111011000000011000011101101000101111111100111000110001010000100100011100000000110111011000000100100010111010110111100100001000011101010100001011010111110000100000000011010110000100100100101010001001000110010011101101001101011100110010110001001000111110000011101100111001110000100001000110001001100110001000000101001101011100101000011000000000010110111101100000001100001110110100010111111110011100011000101000010010001110000000
                    </div>
                  ) : (
                    /* Subtle Background Watermark Icon for Chemistry (FlaskConical), Physics (Atom), Medicine (Stethoscope), Mechanical (Cog), etc. */
                    <DomainIconComp className="absolute -right-2 -bottom-2 h-16 w-16 opacity-10 dark:opacity-20 pointer-events-none stroke-1 z-0" />
                  )}

                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <DomainIconComp className={`h-3.5 w-3.5 ${domainTheme.colorClass} shrink-0`} />
                          <span>{language === 'ar' ? 'الكلية / المعهد:' : 'Faculty / Institute:'} {translateFacultyName(offer.faculty_name || 'General', language)}</span>
                        </span>
                        {offer.is_open === false ? (
                          <span className="text-[9px] font-bold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                            {language === 'ar' ? 'مغلق' : 'Closed'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                            {language === 'ar' ? 'مفتوح' : 'Open'}
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs sm:text-sm font-extrabold text-foreground">
                        {language === 'ar' ? (offer.specialty_ar || offer.specialty_fr) : (offer.specialty_fr || offer.specialty_ar)}
                      </h5>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {offer.portal_url && offer.is_open !== false && (
                        <a
                          href={offer.portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold py-1 px-2.5 rounded-lg shadow-2xs transition-all cursor-pointer"
                        >
                          <span>{language === 'ar' ? 'البوابة' : 'Portal'}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleOfferExpand(offer.id)
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                      >
                        {isOfferExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {isOfferExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-border/40 space-y-2 text-xs">
                      {offer.deadline && (
                        <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{language === 'ar' ? 'آخر موعد:' : 'Deadline:'} <strong className="text-foreground">{offer.deadline}</strong></span>
                        </div>
                      )}
                      {offer.master_programs && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {language === 'ar' ? 'البرامج المتاحة:' : 'Offered Master Programs:'}
                          </span>
                          <p className="text-xs text-foreground bg-muted/40 p-2 rounded-lg leading-relaxed whitespace-pre-wrap">
                            {offer.master_programs}
                          </p>
                        </div>
                      )}
                      {offer.required_documents && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {language === 'ar' ? 'الوثائق والملف المطلوب:' : 'Required Documents:'}
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {offer.required_documents}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
