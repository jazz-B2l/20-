'use client'

import { useState, useMemo, useEffect } from 'react'
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
import {
  Info,
  HelpCircle,
  RotateCcw,
  Search as SearchIcon,
  BookOpen,
  MapPin,
  Calendar,
  Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Listing {
  id: string
  specialty_fr: string
  specialty_ar: string
  level: string
  seats: number
  deadline: string
  portal_url: string
  is_published: boolean
  master_programs?: string | null
  required_documents?: string | null
  notes?: string | null
  faculty_name?: string | null
  unit_type?: string | null
  prerequisites_fr?: string | null
  prerequisites_ar?: string | null
  university: {
    id?: string
    name_fr: string
    name_ar: string
    city: string
    wilaya: string
    logo_url: string | null
    website_url?: string | null
  }
  domain: {
    id: string
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

// Stats count-up animation component
function CountUp({ end, duration = 800 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    if (end === 0) return
    const totalMiliseconds = duration
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 10)
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime))
      if (start >= end) {
        clearInterval(timer)
        setCount(end)
      } else {
        setCount(start)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [end, duration])

  return <>{count}</>
}

// Skeleton card placeholder with shimmer effect
function ListingSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden space-y-4">
      {/* Shimmer gradient overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-border/25 to-transparent animate-[shimmer_1.6s_infinite]" />
      
      <div className="flex items-start gap-4">
        {/* Logo slot */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary border border-border shrink-0" />
        
        {/* Text rows */}
        <div className="flex-1 space-y-2.5">
          <div className="flex gap-2">
            <div className="h-4 w-12 bg-secondary rounded-md" />
            <div className="h-4 w-24 bg-secondary rounded-md" />
          </div>
          <div className="h-6 w-3/4 bg-secondary rounded-lg" />
          <div className="h-4 w-1/2 bg-secondary rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function BrowseClient({
  initialListings,
  domains,
  wilayas,
}: {
  initialListings: Listing[]
  domains: Domain[]
  wilayas: { id: number; name_fr: string; name_ar: string }[]
}) {
  const { t, language } = useLanguage()
  const [search, setSearch] = useState('')
  const [selectedWilaya, setSelectedWilaya] = useState<string>('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [showInfo, setShowInfo] = useState(false)
  const [sortBy, setSortBy] = useState<'deadline' | 'seats' | 'recent'>('deadline')
  const [isLoading, setIsLoading] = useState(false)

  // Trigger simulated loading effect when filters swap
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 380)
    return () => clearTimeout(timer)
  }, [search, selectedWilaya, selectedDomain])

  const filteredListings = useMemo(() => {
    return initialListings.filter(listing => {
      const searchTerm = search.toLowerCase()
      const nameField = language === 'ar' ? 'specialty_ar' : 'specialty_fr'
      const universityNameField = language === 'ar' ? 'name_ar' : 'name_fr'
      const domainNameField = language === 'ar' ? 'name_ar' : 'name_fr'
      
      const matchesSearch =
        (listing[nameField] && listing[nameField].toLowerCase().includes(searchTerm)) ||
        (listing.university[universityNameField] && listing.university[universityNameField].toLowerCase().includes(searchTerm)) ||
        (listing.domain[domainNameField] && listing.domain[domainNameField].toLowerCase().includes(searchTerm)) ||
        (listing.university.wilaya && listing.university.wilaya.toLowerCase().includes(searchTerm))

      const matchesWilaya = !selectedWilaya || listing.university.wilaya === selectedWilaya
      const matchesDomain = !selectedDomain || listing.domain.id === selectedDomain

      return matchesSearch && matchesWilaya && matchesDomain
    })
  }, [initialListings, search, selectedWilaya, selectedDomain, language])

  // Group filtered individual listings by university name/id
  const groupedListings = useMemo(() => {
    const groups: { [key: string]: Listing[] } = {}
    filteredListings.forEach(offer => {
      const key = offer.university.id || offer.university.name_fr
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(offer)
    })
    
    return Object.values(groups).map(offersUnderUni => {
      const first = offersUnderUni[0]
      return {
        id: first.university.id || first.id,
        university: first.university,
        offers: offersUnderUni
      }
    })
  }, [filteredListings])

  // Sorting memo on grouped listings
  const sortedGroupedListings = useMemo(() => {
    const list = [...groupedListings]
    if (sortBy === 'deadline') {
      return list.sort((a, b) => {
        const getEarliestDeadline = (g: typeof a) => {
          const deadlines = g.offers
            .map(o => o.deadline)
            .filter(d => d && !isNaN(Date.parse(d)))
            .map(d => new Date(d).getTime())
          return deadlines.length > 0 ? Math.min(...deadlines) : Infinity
        }
        return getEarliestDeadline(a) - getEarliestDeadline(b)
      })
    }
    if (sortBy === 'seats') {
      return list.sort((a, b) => {
        const totalSeats = (g: typeof a) => g.offers.reduce((sum, o) => sum + (o.seats || 0), 0)
        return totalSeats(b) - totalSeats(a)
      })
    }
    // 'recent' sorting
    return list.reverse()
  }, [groupedListings, sortBy])

  const handleReset = () => {
    setSearch('')
    setSelectedWilaya('')
    setSelectedDomain('')
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={language}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="space-y-6 max-w-5xl mx-auto px-2 select-none text-foreground"
      >
        
        {/* Eye-brow Heading & Compact Description */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wide">
              {language === 'ar' ? 'بوابة 20٪' : '20% — Portail des Masters'}
            </span>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              {language === 'ar' ? 'معرفة المزيد' : 'En savoir plus'}
            </button>
          </div>
          
          <p className="text-foreground text-base md:text-lg leading-relaxed max-w-2xl font-bold">
            {language === 'ar' 
              ? 'تصفح وقدم في برامج الماستر المتاحة ضمن كوتا التبادل الحركي بين الجامعات الجزائرية.'
              : 'Explorez et postulez aux masters ouverts sous le quota de mobilité inter-universitaire en Algérie.'}
          </p>

          {/* Live Stats Strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                <CountUp end={new Set(initialListings.map(l => l.university.name_fr)).size} />
              </span>
              <span>{language === 'ar' ? 'جامعة' : 'universités'}</span>
            </div>
            <span className="text-border select-none font-normal">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                <CountUp end={initialListings.length} />
              </span>
              <span>{language === 'ar' ? 'برنامج مفتوح' : 'programmes disponibles'}</span>
            </div>
            <span className="text-border select-none font-normal">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                <CountUp end={58} />
              </span>
              <span>{language === 'ar' ? 'ولاية' : 'wilayas'}</span>
            </div>
          </div>

          {showInfo && (
            <div className="bg-secondary/40 border border-border rounded-xl p-4 text-xs md:text-sm text-muted-foreground space-y-2 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Info className="h-4 w-4" />
                <span>{language === 'ar' ? 'حول كوتا 20٪' : 'À propos du quota de 20%'}</span>
              </div>
              <p className="leading-relaxed">
                {language === 'ar'
                  ? 'تنص اللوائح الوزارية على تخصيص نسبة 20٪ من المقاعد المتاحة في برامج الماستر للطلبة المتخرجين من مؤسسات جامعية أخرى لتسهيل التبادل والحركية الطلابية.'
                  : 'Conformément aux directives ministérielles, un quota de 20% des places pédagogiques ouvertes en Master est réservé aux candidats diplômés d\'autres établissements d\'enseignement supérieur.'}
              </p>
            </div>
          )}
        </div>

        {/* Elevated Search and Filter Card */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-shadow duration-300 space-y-5">
          
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'ar' ? 'ابحث عن جامعة أو تخصص...' : 'Rechercher une université, spécialité...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-secondary/30 border-border pl-10 pr-4 py-2.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/35 focus-visible:border-primary outline-none transition-all"
            />
          </div>

          {/* Filters Grid */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Wilaya Filter Dropdown */}
              <div className="w-full sm:w-auto min-w-[220px]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{t('browse.wilaya')}</span>
                </label>
                <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
                  <SelectTrigger className="bg-secondary/30 border-border rounded-xl text-xs font-bold text-foreground h-9">
                    <SelectValue placeholder={language === 'ar' ? 'الكل' : 'Toutes'} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl text-foreground">
                    <SelectItem value="" className="text-xs font-semibold">{language === 'ar' ? 'كل الولايات' : 'Toutes les wilayas'}</SelectItem>
                    {wilayas.map(wilaya => {
                      const numStr = wilaya.id.toString().padStart(2, '0')
                      return (
                        <SelectItem key={wilaya.name_fr} value={wilaya.name_fr} className="text-xs font-semibold">
                          {language === 'ar' ? `${numStr} - ${wilaya.name_ar}` : `${numStr} - ${wilaya.name_fr}`}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              {(search || selectedWilaya || selectedDomain) && (
                <button
                  onClick={handleReset}
                  className="h-9 px-3 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-xl flex items-center gap-1 cursor-pointer transition-all ml-auto mt-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {language === 'ar' ? 'إعادة ضبط' : 'Réinitialiser'}
                </button>
              )}

            </div>

            {/* Horizontal Scrollable Domains Filter Chips */}
            <div className="relative pt-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>{t('browse.domain')}</span>
              </label>
              
              <div className="relative flex items-center">
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2.5 w-full pr-8">
                  <button
                    onClick={() => setSelectedDomain('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer border shrink-0 ${
                      selectedDomain === ''
                        ? 'bg-primary border-primary text-primary-foreground shadow-xs scale-[1.03]'
                        : 'bg-secondary/30 border-border text-muted-foreground hover:border-border/80 hover:bg-secondary/60'
                    }`}
                  >
                    {language === 'ar' ? 'كل المجالات' : 'Tous les domaines'}
                  </button>
                  {domains.map(dom => (
                    <button
                      key={dom.id}
                      onClick={() => setSelectedDomain(dom.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer border shrink-0 ${
                        selectedDomain === dom.id
                          ? 'bg-primary border-primary text-primary-foreground shadow-xs scale-[1.03]'
                          : 'bg-secondary/30 border-border text-muted-foreground hover:border-border/80 hover:bg-secondary/60'
                      }`}
                    >
                      {language === 'ar' ? dom.name_ar : dom.name_fr}
                    </button>
                  ))}
                </div>
                {/* Horizontal Fade Edging overlay */}
                <div className="absolute right-0 top-0 bottom-2.5 w-10 pointer-events-none bg-gradient-to-l from-card to-transparent" />
              </div>
            </div>

          </div>

        </div>

        {/* Results View */}
        <div className="space-y-4 pt-2">
          
          {/* Results Count & Sort Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 text-muted-foreground">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              {filteredListings.length} {language === 'ar' ? 'برامج مطابقة' : `offre${filteredListings.length !== 1 ? 's' : ''} disponible${filteredListings.length !== 1 ? 's' : ''}`} ({groupedListings.length} {language === 'ar' ? 'جامعة' : `université${groupedListings.length !== 1 ? 's' : ''}`})
            </h2>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                {language === 'ar' ? 'ترتيب حسب:' : 'Trier par :'}
              </span>
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="bg-card border-border rounded-xl text-xs font-bold text-foreground h-8 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl text-foreground">
                  <SelectItem value="deadline" className="text-xs font-semibold">
                    {language === 'ar' ? 'تاريخ انتهاء التسجيل' : 'Date limite (Deadline)'}
                  </SelectItem>
                  <SelectItem value="seats" className="text-xs font-semibold">
                    {language === 'ar' ? 'المقاعد المتاحة' : 'Places disponibles'}
                  </SelectItem>
                  <SelectItem value="recent" className="text-xs font-semibold">
                    {language === 'ar' ? 'المضافة حديثاً' : 'Récemment ajouté'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            // Shimmer Skeletal Loading list
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <ListingSkeleton key={i} />
              ))}
            </div>
          ) : sortedGroupedListings.length > 0 ? (
            // Staggered Entrance Listings Cards (Grouped by University)
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.04
                  }
                }
              }}
              className="grid gap-4"
            >
              {sortedGroupedListings.map(groupedListing => (
                <motion.div
                  key={groupedListing.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
                  }}
                >
                  <ListingCard listing={groupedListing} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // Enhanced Interactive Empty State
            <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto text-muted-foreground">
                <SearchIcon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {language === 'ar' ? 'لا توجد نتائج مطابقة' : 'Aucun programme disponible'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                {language === 'ar'
                  ? 'لم نعثر على أي برامج مطابقة لخيارات التصفية الحالية. يمكنك إزالة بعض فلاتر البحث أدناه.'
                  : 'Aucun master ne correspond à vos critères de recherche actuels. Essayez de réinitialiser ou d\'ajuster vos filtres.'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {selectedDomain && (
                  <button
                    onClick={() => setSelectedDomain('')}
                    className="px-3 py-1.5 bg-secondary border border-border text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 rounded-xl transition-all flex items-center gap-1 cursor-pointer select-none"
                  >
                    {language === 'ar' ? 'إزالة تصفية المجال' : 'Retirer le filtre Domaine'}
                  </button>
                )}
                {selectedWilaya && (
                  <button
                    onClick={() => setSelectedWilaya('')}
                    className="px-3 py-1.5 bg-secondary border border-border text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 rounded-xl transition-all flex items-center gap-1 cursor-pointer select-none"
                  >
                    {language === 'ar' ? 'إزالة تصفية الولاية' : 'Retirer le filtre Wilaya'}
                  </button>
                )}
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="px-3 py-1.5 bg-secondary border border-border text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 rounded-xl transition-all flex items-center gap-1 cursor-pointer select-none"
                  >
                    {language === 'ar' ? 'إزالة نص البحث' : 'Retirer la recherche textuelle'}
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  {language === 'ar' ? 'إعادة ضبط كل التصفية' : 'Tout réinitialiser'}
                </button>
              </div>
            </div>
          )}
        </div>

      </motion.div>
    </AnimatePresence>
  )
}
