'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Portal Header & Footer
    'site.title': '20%',
    'site.subtitle': 'Algerian Master Degrees Portal',
    'nav.browse': 'Browse Masters',
    'nav.admin': 'Admin Panel',
    'nav.home': 'Home',
    'home.welcome': 'Welcome to the 20% Mobility Portal',
    'home.subtitle': 'Explore available master degree programs across Algerian universities',

    // Academic Opportunities Explorer
    'explorer.hero_title': "Explore the 20% of what you don't know",
    'explorer.hero_subtitle': 'Discover 20% Master quotas, Concours, and academic opportunities across Algerian universities.',

    // Public Browse Page
    'browse.title': 'Browse Master Degrees',
    'browse.filter': 'Filter by:',
    'browse.wilaya': 'Wilaya / Region',
    'browse.domain': 'Study Domain',
    'browse.level': 'Degree Level',
    'browse.status': 'Status',
    'browse.all_domains': 'All Study Domains',
    'browse.all_wilayas': 'All Regions / Wilayas',
    'browse.search_placeholder': 'Search university, specialty, or program...',
    'browse.reset_filters': 'Reset All Filters',
    'browse.available_programs': 'Available Programs',
    'browse.universities_count': 'Universities',

    // Listing Cards
    'listing.specialty': 'Specialty',
    'listing.university': 'University',
    'listing.seats': 'Available Seats',
    'listing.deadline': 'Application Deadline',
    'listing.prerequisites': 'Prerequisites',
    'listing.portal': 'Access Portal',
    'listing.apply_now': 'Apply on Portal',
    'listing.required_documents': 'Required Documents',
    'listing.instructions': 'Important Instructions',
    'listing.faculty': 'Faculty / Institute',
    'listing.website': 'Official University Website',

    // Admin Sidebar & Navigation
    'admin.dashboard': 'Dashboard',
    'admin.universities': 'Universities & Colleges',
    'admin.suggested_updates': 'Suggested Updates',
    'admin.team': 'Team & Access',
    'admin.settings': 'Settings & Config',
    'admin.master_units': '20% Master Units',
    'admin.community': 'Community',
    'admin.administration': 'Administration',

    // Admin Topbar
    'admin.search': 'Search...',
    'admin.create': 'Create',
    'admin.create_opportunity': 'Opportunity',
    'admin.my_settings': 'My Settings',
    'admin.sign_out': 'Sign Out',

    // Admin Settings Page
    'settings.title': 'Admin Panel Settings',
    'settings.subtitle': 'Manage your account preferences, theme, study domains, and platform filter configurations.',
    'settings.tab_general': 'General & Security',
    'settings.tab_domains': 'Study Domains',
    'settings.tab_filters': 'Filters System',
    
    // Theme & Security Settings
    'settings.theme_title': 'Appearance & Dark Mode',
    'settings.theme_desc': 'Choose your preferred interface theme for the portal and administration panel.',
    'settings.light_mode': 'Light Mode',
    'settings.dark_mode': 'Dark Mode',
    'settings.system_mode': 'System Default',
    'settings.language_title': 'Language Settings',
    'settings.language_desc': 'Select your preferred portal and admin display language.',
    'settings.security_title': 'Security & Password Reset',
    'settings.security_desc': 'Update your admin account security credentials.',
    'settings.new_password': 'New Password',
    'settings.confirm_password': 'Confirm New Password',
    'settings.update_password_btn': 'Update Password',
    'settings.password_success': 'Your password has been updated successfully!',
    
    // Study Domains & Filters System
    'settings.add_domain': 'Add Study Domain',
    'settings.domain_name_en': 'English Name',
    'settings.domain_name_ar': 'Arabic Name',
    'settings.domain_slug': 'Slug Identifier',
    'settings.domain_status': 'Workflow Status',
    'settings.add_filter': 'New Filter',
    'settings.filter_name_en': 'Filter Name (English)',
    'settings.filter_name_ar': 'Filter Name (Arabic)',
    'settings.filter_category': 'Category',
    'settings.filter_value': 'Filter Code / Value',
    'settings.filter_order': 'Display Order',
    'settings.filter_active': 'Filter Active',
    'settings.save_changes': 'Save Changes',
    'settings.cancel': 'Cancel',

    // General Form Actions & Messages
    'form.suggest_update': 'Report a Correction',
    'form.message': 'Your Message',
    'form.email': 'Your Email (Optional)',
    'form.submit': 'Submit',
    'form.thanks': 'Thank you for your feedback!',
  },
  ar: {
    // Portal Header & Footer
    'site.title': '20%',
    'site.subtitle': 'بوابة الماجستيرات الجزائرية',
    'nav.browse': 'استعرض الماجستير',
    'nav.admin': 'لوحة التحكم',
    'nav.home': 'الرئيسية',
    'home.welcome': 'مرحباً بك في بوابة كوتا 20٪',
    'home.subtitle': 'استكشف برامج الماجستير المتاحة عبر الجامعات الجزائرية للتبادل الطلابي',

    // Academic Opportunities Explorer
    'explorer.hero_title': 'استكشف الـ 20٪ من الفرص التي لم تكن تعرفها',
    'explorer.hero_subtitle': 'اكتشف عروض الماجستير كوتا 20٪، والمسابقات، والفرص الأكاديمية عبر الجامعات الجزائرية.',

    // Public Browse Page
    'browse.title': 'تصفح عروض الماجستير',
    'browse.filter': 'تصفية حسب:',
    'browse.wilaya': 'الولاية / المنطقة',
    'browse.domain': 'المجال الدراسي',
    'browse.level': 'المستوى الدراسي',
    'browse.status': 'حالة التسجيل',
    'browse.all_domains': 'جميع المجالات الدراسية',
    'browse.all_wilayas': 'جميع الولايات',
    'browse.search_placeholder': 'ابحث عن جامعة، تخصص، أو برنامج...',
    'browse.reset_filters': 'إعادة ضبط التصفية',
    'browse.available_programs': 'البرامج المتاحة',
    'browse.universities_count': 'الجامعات',

    // Listing Cards
    'listing.specialty': 'التخصص',
    'listing.university': 'الجامعة',
    'nav.language': 'اللغة',

    // Hero Section
    'hero.title': 'بوابة ماجستير 20٪ بالجزائر',
    'hero.subtitle': 'استكشف واكتشف جميع مسابقات الماجستير للنسبة المتبقية (20٪) المفتوحة للطلبة في مختلف الجامعات الجزائرية.',
    'hero.search_placeholder': 'ابحث عن تخصص، كلية، مدينة، أو جامعة...',
    'hero.stat_universities': 'جامعة مسجلة',
    'hero.stat_offers': 'عرض ماجستير متاح',
    'hero.stat_wilayas': 'ولاية مغطاة',

    // Filter Bar & Controls
    'filter.wilaya': 'الولاية',
    'filter.all_wilayas': 'جميع الولايات (58)',
    'filter.domain': 'المجال الدراسي',
    'filter.all_domains': 'جميع المجالات',
    'filter.university': 'الجامعة',
    'filter.all_universities': 'جميع الجامعات',
    'filter.status': 'حالة التسجيل',
    'filter.all_statuses': 'جميع الحالات',
    'filter.status_open': 'مفتوح للتسجيل',
    'filter.status_closed': 'مغلق',
    'filter.reset': 'إعادة ضبط الفلاتر',
    'filter.search': 'بحث التخصصات...',
    'filter.no_results': 'لم يتم العثور على أي نتائج تطابق البحث.',

    // Listing Cards
    'card.open': 'مفتوح',
    'card.closed': 'مغلق',
    'card.deadline': 'آخر موعد:',
    'card.seats': 'مقعد متاح',
    'card.apply': 'رابط بوابة التسجيل الرسمية',
    'card.faculty': 'الكلية / المعهد:',
    'card.documents': 'الوثائق المطلوبة:',
    'card.programs': 'برامج الماجستير المتاحة:',
    'card.notes': 'ملاحظات هامة:',
    'card.no_link': 'لم يتم إضافة رابط تسجيل رسمي بعد.',

    // Admin Sidebar & Sections
    'admin.dashboard': 'لوحة القيادة',
    'admin.universities': 'الجامعات والكليات',
    'admin.listings': 'عروض ماجستير 20٪',
    'admin.filters': 'نظام الفلاتر والمجالات',
    'admin.suggestions': 'ملاحظات واقتراحات الطلبة',
    'admin.settings': 'إعدادات النظام والأمان',
    'admin.my_settings': 'إعداداتي الشخصية',
    'admin.sign_out': 'تسجيل الخروج',
    'admin.search': 'بحث سريع...',
    'admin.create': 'إنشاء جديد',
    'admin.create_opportunity': 'إضافة عرض جديد',

    // Admin Settings Page
    'settings.title': 'إعدادات النظام والأمان',
    'settings.subtitle': 'إدارة المظهر، اللغة، كلمة المرور، والمجالات الدراسية والنظام.',
    'settings.tab_general': 'العام والأمان',
    'settings.tab_domains': 'المجالات الدراسية',
    'settings.tab_filters': 'نظام الفلاتر',
    'settings.theme_title': 'المظهر والمظهر البصري',
    'settings.theme_desc': 'تخصيص وضع الألوان المفضل لديك.',
    'settings.light_mode': 'المظهر الفاتح',
    'settings.dark_mode': 'المظهر الداكن',
    'settings.system_mode': 'تلقائي (حسب النظام)',
    'settings.language_title': 'إعدادات اللغة',
    'settings.language_desc': 'اختر لغة عرض المنصة ولواحق الواجهة.',
    'settings.security_title': 'الأمان وإعادة ضبط كلمة المرور',
    'settings.security_desc': 'تحديث بيانات الأمان وكلمة المرور الخاصة بحساب الإدارة.',
    'settings.new_password': 'كلمة المرور الجديدة',
    'settings.confirm_password': 'تأكيد كلمة المرور الجديدة',
    'settings.update_password_btn': 'تحديث كلمة المرور',
    'settings.password_success': 'تم تحديث كلمة المرور الخاصة بك بنجاح!',

    // Study Domains & Filters System
    'settings.add_domain': 'إضافة مجال دراسي جديد',
    'settings.domain_name_en': 'الاسم بالإنجليزية',
    'settings.domain_name_ar': 'الاسم بالعربية',
    'settings.domain_slug': 'المعرف المختصر (Slug)',
    'settings.domain_status': 'حالة النشر',
    'settings.add_filter': 'إضافة فلتر جديد',
    'settings.filter_name_en': 'اسم الفلتر (إنجليزية)',
    'settings.filter_name_ar': 'اسم الفلتر (عربية)',
    'settings.filter_category': 'الفئة',
    'settings.filter_value': 'رمز الفلتر / القيمة',
    'settings.filter_order': 'ترتيب العرض',
    'settings.filter_active': 'الفلتر مفعّل',
    'settings.save_changes': 'حفظ التغييرات',
    'settings.cancel': 'إلغاء',

    // General Form Actions & Messages
    'form.suggest_update': 'الإبلاغ عن تصحيح أو إضافة',
    'form.message': 'رسالتك والتفاصيل',
    'form.email': 'بريدك الإلكتروني (اختياري)',
    'form.submit': 'إرسال الطلب',
    'form.thanks': 'شكراً جزيلاً على ملاحظاتك القيمّة!',
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('language') as string | null
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLanguage(saved as Language)
    } else {
      setLanguage('en')
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
    return translations[language]?.[key] || translations['en']?.[key] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL: language === 'ar',
  }

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
