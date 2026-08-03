'use client'

import { useLanguage } from '@/components/language-context'
import {
  Clock,
  TrendingUp,
  Sparkles,
  Megaphone,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Building2,
  Calendar,
  BookOpen
} from 'lucide-react'

interface SidebarWidgetsProps {
  closingSoonItems?: any[]
  recentlyAddedItems?: any[]
  onSelectCategory?: (category: string) => void
  onSelectDomain?: (domainName: string) => void
}

export function SidebarWidgets({
  closingSoonItems = [],
  recentlyAddedItems = [],
  onSelectCategory,
  onSelectDomain
}: SidebarWidgetsProps) {
  const { t, language } = useLanguage()
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight

  const popularDomains = [
    { name_en: 'AI & Data Science', name_ar: 'الذكاء الاصطناعي وعلوم البيانات', tag: 'ai' },
    { name_en: 'Medicine & Pharmacy', name_ar: 'الطب والصيدلة', tag: 'medicine' },
    { name_en: 'Cybersecurity & Networks', name_ar: 'الأمن السيبراني والشبكات', tag: 'cybersecurity' },
    { name_en: 'Mechanical Engineering', name_ar: 'الهندسة الميكانيكية', tag: 'mechanical' },
    { name_en: 'Business & Management', name_ar: 'إدارة الأعمال والتسيير', tag: 'business' },
    { name_en: 'Architecture & Civil Eng.', name_ar: 'الهندسة المعمارية والمدنية', tag: 'architecture' },
  ]

  const announcements = [
    {
      id: '1',
      title_en: 'USTO Master 20% Applications Extended',
      title_ar: 'تمديد آجال التسجيل بجامعة وهران للعلوم والتكنولوجيا (USTO)',
      badge_en: 'Extended',
      badge_ar: 'تم التمديد',
      date: '2026-08-01'
    },
    {
      id: '2',
      title_en: 'National Higher Schools Concours Portal Live',
      title_ar: 'افتتاح بوابة مسابقات المدارس العليا الوطنية 2026',
      badge_en: 'New Concours',
      badge_ar: 'مسابقة جديدة',
      date: '2026-07-29'
    },
    {
      id: '3',
      title_en: 'USTHB Faculty of Chemistry Official Results',
      title_ar: 'صدور النتائج الأولية لكلية الكيمياء - جامعة هواري بومدين',
      badge_en: 'Results',
      badge_ar: 'نتائج أولية',
      date: '2026-07-25'
    }
  ]

  return (
    <aside className="space-y-6 w-full">
      {/* Widget 1: Closing Soon (ending within 7 days) */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3.5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>{t('explorer.sidebar_closing_soon')}</span>
          </h3>
          {onSelectCategory && (
            <button
              onClick={() => onSelectCategory('closing_soon')}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'ar' ? 'عرض الكل' : 'View All'}</span>
              <ArrowIcon className="h-3 w-3" />
            </button>
          )}
        </div>

        {closingSoonItems.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            {language === 'ar' ? 'لا توجد عروض تنتهي هذا الأسبوع.' : 'No opportunities ending this week.'}
          </p>
        ) : (
          <div className="space-y-3 divide-y divide-border/40">
            {closingSoonItems.slice(0, 4).map((item, idx) => (
              <div key={item.id || idx} className="pt-2.5 first:pt-0 space-y-1">
                <p className="text-xs font-bold text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer">
                  {language === 'ar' ? (item.specialty_ar || item.specialty_fr) : (item.specialty_fr || item.specialty_ar)}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="truncate max-w-[140px]">
                    {item.university?.name_fr || item.university?.name_ar}
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {item.deadline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget 2: Popular Searches / Trending Domains */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3.5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>{t('explorer.sidebar_trending')}</span>
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {popularDomains.map((dom) => {
            const label = language === 'ar' ? dom.name_ar : dom.name_en
            return (
              <button
                key={dom.tag}
                onClick={() => onSelectDomain?.(dom.name_en)}
                className="text-xs font-medium bg-muted/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border/60 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-foreground"
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Widget 3: Recently Added */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3.5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span>{t('explorer.sidebar_recent')}</span>
          </h3>
        </div>

        {recentlyAddedItems.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            {language === 'ar' ? 'لا توجد عروض مضافة حديثاً.' : 'No recent items.'}
          </p>
        ) : (
          <div className="space-y-3 divide-y divide-border/40">
            {recentlyAddedItems.slice(0, 3).map((item, idx) => (
              <div key={item.id || idx} className="pt-2.5 first:pt-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {item.type === 'concours' ? (language === 'ar' ? 'مسابقة' : 'Concours') : (language === 'ar' ? 'ماجستير 20٪' : 'Master 20%')}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{item.deadline || '2026'}</span>
                </div>
                <p className="text-xs font-bold text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer">
                  {language === 'ar' ? (item.specialty_ar || item.specialty_fr) : (item.specialty_fr || item.specialty_ar)}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {item.university?.name_fr || item.university?.name_ar}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget 4: Platform Announcements */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3.5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-blue-500" />
            <span>{t('explorer.sidebar_announcements')}</span>
          </h3>
        </div>

        <div className="space-y-3 divide-y divide-border/40">
          {announcements.map((ann) => (
            <div key={ann.id} className="pt-2.5 first:pt-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {language === 'ar' ? ann.badge_ar : ann.badge_en}
                </span>
                <span className="text-[10px] text-muted-foreground">{ann.date}</span>
              </div>
              <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                {language === 'ar' ? ann.title_ar : ann.title_en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
