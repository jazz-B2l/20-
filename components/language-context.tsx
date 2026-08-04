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

    // Academic Opportunities Explorer & Filter Tabs
    'explorer.hero_title': "Explore the 20% of what you don't know",
    'explorer.hero_subtitle': 'Discover 20% Master quotas, Concours, and academic opportunities across Algerian universities.',
    'explorer.tab_all': 'All Opportunities',
    'explorer.tab_masters': 'Master 20% Quotas',
    'explorer.tab_concours': 'Concours & Schools',
    'explorer.tab_doctorate': 'Doctorate (Soon)',
    'explorer.sort_by': 'Sort by',
    'explorer.sort_newest': 'Recently Published',
    'explorer.sort_deadline': 'Closest Deadline',
    'explorer.sort_popularity': 'Most Popular',
    'explorer.sort_alphabetical': 'Alphabetical (A-Z)',
    'explorer.results_found': 'opportunities found',
    'explorer.sidebar_closing_soon': 'Closing Soon (≤ 7 Days)',
    'explorer.sidebar_trending': 'Trending Study Domains',
    'explorer.sidebar_recent': 'Recently Added',
    'explorer.sidebar_announcements': 'Official Announcements',
    'explorer.search_masters': 'Search Master 20% by university, specialty...',
    'explorer.all': 'All',

    // Filter Bar Translations
    'filter.all_wilayas': 'All Regions / Wilayas (58)',
    'filter.all_domains': 'All Study Domains',
    'filter.all_statuses': 'All Statuses',
    'filter.status_open': 'Open Registrations',
    'filter.status_closed': 'Closed',
    'filter.status_closing_soon': 'Closing Soon',
    'filter.reset': 'Reset Filters',
    'filter.no_results': 'No opportunities match your current filters.',

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

    // Program Student Note Modal
    'note.btn': 'Note / Suggestion',
    'note.modal_title': 'Submit Student Note / Suggestion',
    'note.modal_subtitle': 'Share your note, feedback, or update suggestion about this program with the platform administration.',
    'note.program_label': 'Selected Program',
    'note.university_label': 'University & Faculty',
    'note.type_label': 'Note Category',
    'note.type_general': 'General Student Note',
    'note.type_correction': 'Data Correction',
    'note.type_deadline': 'Deadline Update',
    'note.type_prerequisite': 'Prerequisites Info',
    'note.message_label': 'Your Note / Details',
    'note.message_placeholder': 'Write your notes or suggestions about this program here...',
    'note.email_label': 'Your Contact Email (Optional)',
    'note.email_placeholder': 'student@univ.dz',
    'note.send_btn': 'Submit Note',
    'note.success_msg': 'Your note has been submitted successfully to the admin queue!',
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

    // Academic Opportunities Explorer & Filter Tabs
    'explorer.hero_title': 'استكشف الـ 20٪ من الفرص التي لم تكن تعرفها',
    'explorer.hero_subtitle': 'اكتشف عروض الماجستير كوتا 20٪، والمسابقات، والفرص الأكاديمية عبر الجامعات الجزائرية.',
    'explorer.tab_all': 'جميع الفرص',
    'explorer.tab_masters': 'ماجستير 20٪',
    'explorer.tab_concours': 'المسابقات والمدارس العليا',
    'explorer.tab_doctorate': 'الدكتوراه (قريباً)',
    'explorer.sort_by': 'ترتيب حسب',
    'explorer.sort_newest': 'الأحدث نشراً',
    'explorer.sort_deadline': 'الأقرب موعداً',
    'explorer.sort_popularity': 'الأكثر شعبية',
    'explorer.sort_alphabetical': 'أبجدياً (أ-ي)',
    'explorer.results_found': 'عرض متاح',
    'explorer.sidebar_closing_soon': 'تنتهي قريباً (خلال أسبوع)',
    'explorer.sidebar_trending': 'المجالات الأكثر تصفحاً',
    'explorer.sidebar_recent': 'أضيفت مؤخراً',
    'explorer.sidebar_announcements': 'إعلانات رسمية',
    'explorer.search_masters': 'ابحث عن ماجستير 20٪ باسم الجامعة أو التخصص...',
    'explorer.all': 'الكل',

    // Filter Bar Translations
    'filter.all_wilayas': 'جميع الولايات والجهات (58)',
    'filter.all_domains': 'جميع المجالات الدراسية',
    'filter.all_statuses': 'جميع الحالات',
    'filter.status_open': 'مفتوح للتسجيل',
    'filter.status_closed': 'مغلق',
    'filter.status_closing_soon': 'ينتهي قريباً',
    'filter.reset': 'إعادة ضبط الفلاتر',
    'filter.no_results': 'لم يتم العثور على أي نتائج تطابق التصفية.',

    // Public Browse Page
    'browse.title': 'تصفح عروض الماجستير',
    'browse.filter': 'تصفية حسب:',
    'browse.wilaya': 'الولاية / المنطقة',
    'browse.domain': 'المجال الدراسي',
    'browse.level': 'المستوى الدراسي',
    'browse.status': 'حالة التسجيل',
    'browse.all_domains': 'جميع المجالات الدراسية',
    'browse.all_wilayas': 'جميع الولايات والجهات',
    'browse.search_placeholder': 'ابحث باسم الجامعة، التخصص، أو الكلية...',
    'browse.reset_filters': 'إعادة ضبط التصفية',
    'browse.available_programs': 'البرامج والتخصصات المتاحة',
    'browse.universities_count': 'الجامعات والمؤسسات',

    // Listing Cards
    'listing.specialty': 'التخصص الدراسي',
    'listing.university': 'الجامعة / المؤسسة',
    'listing.seats': 'المقاعد المتاحة',
    'listing.deadline': 'آخر أجل للتسجيل',
    'listing.prerequisites': 'شروط الترشح والملاحظات',
    'listing.portal': 'بوابة التسجيل',
    'listing.apply_now': 'التسجيل عبر المنصة',
    'listing.required_documents': 'الوثائق المطلوبة',
    'listing.instructions': 'تعليمات هامة',
    'listing.faculty': 'الكلية / المعهد',
    'listing.website': 'الموقع الرسمي للجامعة',

    // Admin Sidebar & Navigation
    'admin.dashboard': 'لوحة القيادة',
    'admin.universities': 'الجامعات والكليات',
    'admin.suggested_updates': 'الملاحظات والتحديثات المقترحة',
    'admin.team': 'الفريق والأذونات',
    'admin.settings': 'الإعدادات والنظام',
    'admin.master_units': 'وحدات الماجستير 20٪',
    'admin.community': 'المجتمع والطلاب',
    'admin.administration': 'الإدارة الفنية',

    // Admin Topbar
    'admin.search': 'بحث سريع...',
    'admin.create': 'إنشاء',
    'admin.create_opportunity': 'عرض جديد',
    'admin.my_settings': 'إعداداتي',
    'admin.sign_out': 'تسجيل الخروج',

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

    // Program Student Note Modal
    'note.btn': 'إضافة ملاحظة / اقتراح',
    'note.modal_title': 'إرسال ملاحظة أو اقتراح على البرنامج',
    'note.modal_subtitle': 'شارِك ملاحظاتك، تصحيحاتك، أو اقتراحاتك حول هذا البرنامج الدراسي مع إدارة المنصة.',
    'note.program_label': 'البرنامج المحدد',
    'note.university_label': 'الجامعة والكلية',
    'note.type_label': 'نوع الملاحظة',
    'note.type_general': 'ملاحظة عامة من طالب',
    'note.type_correction': 'تصحيح معلومات',
    'note.type_deadline': 'تحديث الآجال والتاريخ',
    'note.type_prerequisite': 'تحديث الشروط والملف',
    'note.message_label': 'تفاصيل الملاحظة / الاقتراح',
    'note.message_placeholder': 'اكتب ملاحظاتك أو واقتراحاتك حول هذا البرنامج هنا...',
    'note.email_label': 'البريد الإلكتروني للتواصل (اختياري)',
    'note.email_placeholder': 'student@univ.dz',
    'note.send_btn': 'إرسال الملاحظة',
    'note.success_msg': 'تم إرسال ملاحظتك بنجاح إلى قائمة المراجعة للإدارة!',
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
    if (!key) return ''
    let cleanKey = key.trim().replace(/^:/, '')
    if (cleanKey === 'expbrer.tab _ masters' || cleanKey === 'explorer.tab _ masters') cleanKey = 'explorer.tab_masters'
    if (cleanKey === 'explorer.tab_eoneours' || cleanKey === 'explorer.tab_concours 2') cleanKey = 'explorer.tab_concours'
    if (cleanKey === 'closing_soon') cleanKey = 'filter.status_closing_soon'
    if (cleanKey === 'all') cleanKey = 'explorer.all'

    const directTranslation = translations[language]?.[cleanKey] || translations['en']?.[cleanKey]
    if (directTranslation) return directTranslation

    // Smart typo & partial key fallback mapping
    const lower = cleanKey.toLowerCase()
    if (lower.includes('doctorate')) return translations[language]?.['explorer.tab_doctorate'] || (language === 'ar' ? 'الدكتوراه' : 'Doctorate')
    if (lower.includes('eoneour') || lower.includes('concour')) return translations[language]?.['explorer.tab_concours'] || (language === 'ar' ? 'المسابقات والمدارس العليا' : 'Concours & Schools')
    if (lower.includes('master')) return translations[language]?.['explorer.tab_masters'] || (language === 'ar' ? 'ماجستير 20٪' : 'Master 20% Quotas')
    if (lower.includes('sort')) return translations[language]?.['explorer.sort_by'] || (language === 'ar' ? 'ترتيب حسب' : 'Sort by')
    if (lower.includes('trending')) return translations[language]?.['explorer.sidebar_trending'] || (language === 'ar' ? 'المجالات الأكثر تصفحاً' : 'Trending Study Domains')
    if (lower.includes('closing')) return translations[language]?.['explorer.sidebar_closing_soon'] || (language === 'ar' ? 'تنتهي قريباً' : 'Closing Soon')

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
