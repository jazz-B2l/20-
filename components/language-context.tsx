'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'fr' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, Record<string, string>> = {
  fr: {
    'site.title': '20%',
    'site.subtitle': 'Portail des Masters Algériens',
    'nav.browse': 'Parcourir',
    'nav.admin': 'Admin',
    'nav.home': 'Accueil',
    'home.welcome': 'Bienvenue sur le Portail 20%',
    'home.subtitle': 'Découvrez les programmes de master disponibles dans les universités algériennes',
    'browse.title': 'Parcourir les Masters',
    'browse.filter': 'Filtrer par:',
    'browse.wilaya': 'Wilaya',
    'browse.domain': 'Domaine',
    'browse.level': 'Niveau',
    'browse.status': 'Statut',
    'listing.specialty': 'Spécialité',
    'listing.university': 'Université',
    'listing.seats': 'Places disponibles',
    'listing.deadline': 'Délai d\'inscription',
    'listing.prerequisites': 'Prérequis',
    'listing.portal': 'Accéder au portail',
    'form.suggest_update': 'Signaler une correction',
    'form.message': 'Votre message',
    'form.email': 'Votre email (optionnel)',
    'form.submit': 'Envoyer',
    'form.thanks': 'Merci pour votre retour!',
  },
  ar: {
    'site.title': '20%',
    'site.subtitle': 'بوابة الماجستيرات الجزائرية',
    'nav.browse': 'استعرض',
    'nav.admin': 'إدارة',
    'nav.home': 'الرئيسية',
    'home.welcome': 'مرحبا بك في بوابة 20%',
    'home.subtitle': 'استكشف برامج الماجستير المتاحة في الجامعات الجزائرية',
    'browse.title': 'استعرض الماجستيرات',
    'browse.filter': 'تصفية حسب:',
    'browse.wilaya': 'الولاية',
    'browse.domain': 'المجال',
    'browse.level': 'المستوى',
    'browse.status': 'الحالة',
    'listing.specialty': 'التخصص',
    'listing.university': 'الجامعة',
    'listing.seats': 'المقاعد المتاحة',
    'listing.deadline': 'آخر موعد للتسجيل',
    'listing.prerequisites': 'المتطلبات',
    'listing.portal': 'الدخول إلى البوابة',
    'form.suggest_update': 'الإبلاغ عن تصحيح',
    'form.message': 'رسالتك',
    'form.email': 'بريدك الإلكتروني (اختياري)',
    'form.submit': 'إرسال',
    'form.thanks': 'شكرا على ملاحظاتك!',
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'fr' || saved === 'ar')) {
      setLanguage(saved)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language)
      document.documentElement.lang = language
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    }
  }, [language, mounted])

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL: language === 'ar',
  }

  if (!mounted) return <>{children}</>

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
