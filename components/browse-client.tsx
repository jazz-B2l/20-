'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useLanguage } from './language-context'
import { ListingCard } from './listing-card'
import { SidebarWidgets } from './sidebar-widgets'
import { FilterTooltip } from '@/components/ui/filter-tooltip'
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
  Users,
  Scale,
  Languages,
  Binary,
  HeartPulse,
  Leaf,
  TrendingUp,
  Atom,
  Check,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Sparkles,
  Trophy,
  GraduationCap,
  Flame,
  Star,
  Clock,
  Filter,
  X
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
  is_open?: boolean
  faculty_name?: string | null
  unit_type?: string | null
  prerequisites_fr?: string | null
  prerequisites_ar?: string | null
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
function CountUp({ end, duration = 600 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    if (end === 0) { setCount(0); return }
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
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-border/25 to-transparent animate-[shimmer_1.6s_infinite]" />
      
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary border border-border shrink-0" />
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

// Icon mapping helper for domain filters
function getDomainIcon(nameFr: string) {
  const normalized = nameFr.toLowerCase()
  if (normalized.includes('droit') || normalized.includes('politique')) return Scale
  if (normalized.includes('lettre') || normalized.includes('langue')) return Languages
  if (normalized.includes('math') || normalized.includes('informatique')) return Binary
  if (normalized.includes('méd') || normalized.includes('santé') || normalized.includes('medecine')) return HeartPulse
  if (normalized.includes('nature') || normalized.includes('vie') || normalized.includes('dnas')) return Leaf
  if (normalized.includes('écon') || normalized.includes('gestion') || normalized.includes('bus')) return TrendingUp
  if (normalized.includes('techno') || normalized.includes('sciences et tech')) return Atom
  if (normalized.includes('humaine') || normalized.includes('sociale')) return Users
  return BookOpen
}

export type OpportunityType = 'all' | 'master' | 'concours' | 'doctorate'

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

  // Explorer active tab: 'master' | 'concours' | 'doctorate'
  const [activeType, setActiveType] = useState<OpportunityType>('master')

  // Search & Filter State
  const [search, setSearch] = useState('')
  const [selectedWilaya, setSelectedWilaya] = useState<string>('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [activeChip, setActiveChip] = useState<string>('')
  const [showInfo, setShowInfo] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'popularity' | 'alphabetical'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)

  // Custom Dropdown Domain Filter Search
  const [isDomainOpen, setIsDomainOpen] = useState(false)
  const [domainSearchQuery, setDomainSearchQuery] = useState('')
  const domainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (domainRef.current && !domainRef.current.contains(event.target as Node)) {
        setIsDomainOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Trigger simulated smooth loading transition on tab or filter change
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 280)
    return () => clearTimeout(timer)
  }, [activeType, search, selectedWilaya, selectedDomain, selectedStatus, activeChip, sortBy])

  // Filter listings based on active Opportunity Type, Search Term, Wilaya, Domain, and Status
  const filteredListings = useMemo(() => {
    return initialListings.filter(listing => {
      // 1. Opportunity Type Filter
      if (activeType === 'master') {
        const isMaster = !listing.opportunity_type || listing.opportunity_type === 'master'
        if (!isMaster) return false
      } else if (activeType === 'concours') {
        const isConcours = listing.opportunity_type === 'concours' || listing.level === 'Concours' || listing.unit_type === 'school'
        if (!isConcours) return false
      }

      // 2. Search Term Filter
      const searchTerm = search.toLowerCase().trim()
      if (searchTerm) {
        const nameField = language === 'ar' ? 'specialty_ar' : 'specialty_fr'
        const universityNameField = language === 'ar' ? 'name_ar' : 'name_fr'
        const domainNameField = language === 'ar' ? 'name_ar' : 'name_fr'
        
        const matchesSearch =
          (listing[nameField] && listing[nameField].toLowerCase().includes(searchTerm)) ||
          (listing.university[universityNameField] && listing.university[universityNameField].toLowerCase().includes(searchTerm)) ||
          (listing.domain[domainNameField] && listing.domain[domainNameField].toLowerCase().includes(searchTerm)) ||
          (listing.university.wilaya && listing.university.wilaya.toLowerCase().includes(searchTerm)) ||
          (listing.faculty_name && listing.faculty_name.toLowerCase().includes(searchTerm))

        if (!matchesSearch) return false
      }

      // 3. Wilaya Filter
      if (selectedWilaya && listing.university.wilaya !== selectedWilaya) {
        return false
      }

      // 4. Domain Filter
      if (selectedDomain && listing.domain.id !== selectedDomain) {
        return false
      }

      // 5. Status Filter
      if (selectedStatus === 'open' && listing.is_open === false) return false
      if (selectedStatus === 'closed' && listing.is_open !== false) return false

      // 6. Quick Chips Filter
      if (activeChip === 'closing_soon') {
        if (!listing.deadline) return false
        const d = new Date(listing.deadline)
        const diffDays = Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays < 0 || diffDays > 7) return false
      } else if (activeChip === 'recently_added') {
        // filter published or recent
      }

      return true
    })
  }, [initialListings, activeType, search, selectedWilaya, selectedDomain, selectedStatus, activeChip, language])

  // Group filtered individual listings by university
  const groupedListings = useMemo(() => {
    const groups: { [key: string]: Listing[] } = {}
    filteredListings.forEach(offer => {
      const key = offer.university.id || offer.university.name_fr
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(offer)
    })
    
    return Object.values(groups).map((offersUnderUni, index) => {
      const first = offersUnderUni[0]
      const uniKey = first.university.id || first.university.name_fr || `group-${index}`
      return {
        id: `uni-card-${uniKey}`,
        opportunity_type: first.opportunity_type,
        university: first.university,
        offers: offersUnderUni
      }
    })
  }, [filteredListings])

  // Sort Grouped Listings
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
    if (sortBy === 'popularity') {
      return list.sort((a, b) => b.offers.length - a.offers.length)
    }
    if (sortBy === 'alphabetical') {
      return list.sort((a, b) => {
        const nameA = language === 'ar' ? a.university.name_ar : a.university.name_fr
        const nameB = language === 'ar' ? b.university.name_ar : b.university.name_fr
        return nameA.localeCompare(nameB)
      })
    }
    // 'newest' default
    return list.reverse()
  }, [groupedListings, sortBy, language])

  // Reset Filters
  const handleReset = () => {
    setSearch('')
    setSelectedWilaya('')
    setSelectedDomain('')
    setSelectedStatus('all')
    setActiveChip('')
  }

  const isFiltersActive = !!(search || selectedWilaya || selectedDomain || selectedStatus !== 'all' || activeChip)

  // Dynamic Search Placeholder
  const getSearchPlaceholder = () => {
    if (activeType === 'master') return t('explorer.search_masters')
    if (activeType === 'concours') return t('explorer.search_concours')
    return t('explorer.search_all')
  }

  // Dynamic Statistics Calculations
  const stats = useMemo(() => {
    const unisCount = new Set(filteredListings.map(l => l.university.name_fr)).size
    const programsCount = filteredListings.length
    const openCount = filteredListings.filter(l => l.is_open !== false).length
    const wilayasCount = new Set(filteredListings.map(l => l.university.wilaya)).size

    return { unisCount, programsCount, openCount, wilayasCount }
  }, [filteredListings])

  // Closing soon items for sidebar widget
  const closingSoonItems = useMemo(() => {
    return initialListings.filter(l => {
      if (!l.deadline) return false
      const d = new Date(l.deadline)
      const diffDays = Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 7
    })
  }, [initialListings])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={language}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="space-y-8 max-w-7xl mx-auto px-2 select-none text-foreground"
      >
        {/* ========================================================================= */}
        {/* HERO SECTION & OPPORTUNITY TYPE SWITCHER                                  */}
        {/* ========================================================================= */}
        <div className="space-y-6 text-center md:text-left rtl:md:text-right max-w-3xl">
          
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {language === 'ar' ? (
                <>
                  استكشف الـ{' '}
                  <img src="/logo.png" alt="20%" className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 inline-flex align-middle mx-2 shrink-0 object-contain" />{' '}
                  من الفرص التي لم تكن تعرفها
                </>
              ) : (
                <>
                  Explore the{' '}
                  <img src="/logo.png" alt="20%" className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 inline-flex align-middle mx-2 shrink-0 object-contain" />{' '}
                  of what you don't know
                </>
              )}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed">
              {t('explorer.hero_subtitle')}
            </p>
          </div>

          {/* Opportunity Type Segmented Switcher Control */}
          <div className="inline-flex items-center gap-1 bg-muted p-1.5 rounded-2xl border border-border overflow-x-auto max-w-full shadow-2xs">
            <button
              onClick={() => setActiveType('master')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeType === 'master'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              <span>{t('explorer.tab_masters')}</span>
            </button>

            <button
              onClick={() => setActiveType('concours')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeType === 'concours'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>{t('explorer.tab_concours')}</span>
            </button>

            <button
              disabled
              className="px-3.5 py-2 text-xs font-bold rounded-xl text-muted-foreground/50 opacity-60 flex items-center gap-1.5 whitespace-nowrap cursor-not-allowed"
            >
              <span>{t('explorer.tab_doctorate')}</span>
            </button>
          </div>

          {/* Animated Statistics Cards */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs font-bold text-muted-foreground">
            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="text-sm font-extrabold text-primary">
                <CountUp end={stats.unisCount} />
              </span>
              <span>{activeType === 'concours' ? (language === 'ar' ? 'مدرسة عليا' : 'higher schools') : (language === 'ar' ? 'مؤسسة' : 'institutions')}</span>
            </div>

            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="text-sm font-extrabold text-primary">
                <CountUp end={stats.programsCount} />
              </span>
              <span>{activeType === 'concours' ? (language === 'ar' ? 'مسابقة رسمية' : 'competitions') : (language === 'ar' ? 'برنامج متاح' : 'programs')}</span>
            </div>

            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                <CountUp end={stats.openCount} />
              </span>
              <span>{language === 'ar' ? 'مفتوح حالياً' : 'open registrations'}</span>
            </div>

            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="text-sm font-extrabold text-primary">
                <CountUp end={stats.wilayasCount} />
              </span>
              <span>{language === 'ar' ? 'ولاية' : 'wilayas'}</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ELEVATED SEARCH & FILTER BAR                                             */}
        {/* ========================================================================= */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-4">
          
          {/* Dynamic Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={getSearchPlaceholder()}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-secondary/30 border-border pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/35 focus-visible:border-primary outline-none transition-all"
            />
          </div>

          {/* Filters Grid */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            
            {/* Wilaya Filter Dropdown */}
            <div className="w-full sm:w-auto min-w-[200px]">
              <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
                <SelectTrigger className="bg-secondary/30 border-border rounded-xl text-xs font-bold text-foreground h-9">
                  <SelectValue placeholder={t('filter.all_wilayas')} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl text-foreground">
                  <SelectItem value="" className="text-xs font-semibold">{t('filter.all_wilayas')}</SelectItem>
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

            {/* Domain Filter Dropdown */}
            <div className="w-full sm:w-auto min-w-[240px] relative" ref={domainRef}>
              <button
                type="button"
                onClick={() => setIsDomainOpen(!isDomainOpen)}
                className="w-full bg-secondary/30 hover:bg-secondary/40 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground flex items-center justify-between transition-all duration-150 cursor-pointer h-9 shadow-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {(() => {
                    if (!selectedDomain) {
                      return (
                        <>
                          <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{t('filter.all_domains')}</span>
                        </>
                      )
                    }
                    const activeDom = domains.find(d => d.id === selectedDomain)
                    if (!activeDom) {
                      return (
                        <>
                          <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{t('filter.all_domains')}</span>
                        </>
                      )
                    }
                    const IconComp = getDomainIcon(activeDom.name_fr)
                    return (
                      <>
                        <IconComp className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{language === 'ar' ? activeDom.name_ar : activeDom.name_fr}</span>
                      </>
                    )
                  })()}
                </div>
                {isDomainOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-1.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-1.5" />}
              </button>

              <AnimatePresence>
                {isDomainOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.12 }}
                    className="absolute z-50 left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[300px]"
                  >
                    <div className="p-2 border-b border-border/80 flex items-center gap-2 bg-muted/20 shrink-0">
                      <SearchIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'ابحث عن مجال...' : 'Search domain...'}
                        value={domainSearchQuery}
                        onChange={(e) => setDomainSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground py-1 font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="overflow-y-auto py-1 divide-y divide-border/20">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDomain('')
                          setIsDomainOpen(false)
                        }}
                        className={`w-full text-left rtl:text-right px-3 py-2 text-xs flex items-center justify-between transition-colors hover:bg-secondary/40 cursor-pointer ${
                          !selectedDomain ? 'text-primary bg-primary/5 font-bold' : 'text-foreground'
                        }`}
                      >
                        <span>{t('filter.all_domains')}</span>
                        {!selectedDomain && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </button>

                      {domains
                        .filter(dom => 
                          dom.name_fr.toLowerCase().includes(domainSearchQuery.toLowerCase()) ||
                          (dom.name_ar && dom.name_ar.includes(domainSearchQuery))
                        )
                        .map(dom => {
                          const IconComp = getDomainIcon(dom.name_fr)
                          const isSelected = selectedDomain === dom.id
                          return (
                            <button
                              key={dom.id}
                              type="button"
                              onClick={() => {
                                setSelectedDomain(dom.id)
                                setIsDomainOpen(false)
                              }}
                              className={`w-full text-left rtl:text-right px-3 py-2 text-xs flex items-center justify-between transition-colors hover:bg-secondary/40 cursor-pointer ${
                                isSelected ? 'text-primary bg-primary/5 font-semibold' : 'text-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <IconComp className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="truncate">{language === 'ar' ? dom.name_ar : dom.name_fr}</span>
                              </div>
                              {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                            </button>
                          )
                        })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-auto min-w-[160px]">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-secondary/30 border-border rounded-xl text-xs font-bold text-foreground h-9">
                  <SelectValue placeholder={t('filter.all_statuses')} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl text-foreground">
                  <SelectItem value="all" className="text-xs font-semibold">{t('filter.all_statuses')}</SelectItem>
                  <SelectItem value="open" className="text-xs font-semibold">{t('filter.status_open')}</SelectItem>
                  <SelectItem value="closed" className="text-xs font-semibold">{t('filter.status_closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters Action */}
            {isFiltersActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-9 px-3 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                <span>{t('filter.reset')}</span>
              </Button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RESULTS TOOLBAR & FEED WITH DESKTOP SIDEBAR                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          
          {/* Main Feed Column */}
          <div className="space-y-5">
            
            {/* Toolbar: Counter, Sort, View Toggle */}
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-foreground">{sortedGroupedListings.length}</span>
                <span className="text-muted-foreground">{t('explorer.results_found')}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground hidden sm:inline">{t('explorer.sort_by')}:</span>
                  <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="bg-card border-border rounded-xl text-xs font-bold text-foreground h-8 px-2.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl text-foreground">
                      <SelectItem value="newest" className="text-xs font-semibold">{t('explorer.sort_newest')}</SelectItem>
                      <SelectItem value="deadline" className="text-xs font-semibold">{t('explorer.sort_deadline')}</SelectItem>
                      <SelectItem value="popularity" className="text-xs font-semibold">{t('explorer.sort_popularity')}</SelectItem>
                      <SelectItem value="alphabetical" className="text-xs font-semibold">{t('explorer.sort_alphabetical')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      viewMode === 'grid' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      viewMode === 'list' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Cards Feed */}
            {isLoading ? (
              <div className="space-y-4">
                <ListingSkeleton />
                <ListingSkeleton />
                <ListingSkeleton />
              </div>
            ) : sortedGroupedListings.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-xs">
                <SearchIcon className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-foreground">{t('filter.no_results')}</h3>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'جرب البحث بكلمات مختلفة أو إزالة الفلاتر المحددة.' : 'Try adjusting your search query or reset active filters.'}
                  </p>
                </div>
                {isFiltersActive && (
                  <Button onClick={handleReset} variant="outline" size="sm" className="font-bold gap-1.5 cursor-pointer">
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{t('filter.reset')}</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'xl:grid-cols-2 items-start' : 'grid-cols-1'} gap-4`}>
                {sortedGroupedListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Right Sidebar Widgets */}
          <div className="hidden lg:block space-y-6">
            <SidebarWidgets
              closingSoonItems={closingSoonItems}
              recentlyAddedItems={initialListings.slice(0, 3)}
              onSelectCategory={(cat) => setActiveChip(cat)}
              onSelectDomain={(domName) => {
                const found = domains.find(d => d.name_fr.toLowerCase().includes(domName.toLowerCase()))
                if (found) setSelectedDomain(found.id)
              }}
            />
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}
