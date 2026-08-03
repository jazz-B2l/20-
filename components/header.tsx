'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/theme-context'
import { useLanguage } from '@/components/language-context'

interface HeaderProps {
  language?: 'en' | 'ar'
  setLanguage?: (lang: 'en' | 'ar') => void
}

export function Header({ language: propLanguage, setLanguage: propSetLanguage }: HeaderProps = {}) {
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const { language: ctxLanguage, setLanguage: ctxSetLanguage } = useLanguage()

  const currentLanguage = propLanguage || ctxLanguage
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
  }

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    if (propSetLanguage) {
      propSetLanguage(lang)
    }
    ctxSetLanguage(lang)
  }

  if (!mounted) return null

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 select-none">
            <div className="h-10 px-3 bg-primary text-primary-foreground rounded-[12px] flex items-center justify-center font-extrabold text-lg shrink-0 transition-colors">
              20%
            </div>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              {currentLanguage === 'ar' ? 'بوابة الماجستير الجزائرية 20٪' : 'Algeria Master Portal'}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors mr-2"
              title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Language Selection Buttons */}
            <Button
              variant={currentLanguage === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleLanguageChange('en')}
              className={`w-10 h-8 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                currentLanguage === 'en'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              EN
            </Button>
            <Button
              variant={currentLanguage === 'ar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleLanguageChange('ar')}
              className={`w-10 h-8 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                currentLanguage === 'ar'
                  ? 'bg-primary text-primary-foreground shadow-sm font-sans'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary font-sans'
              }`}
            >
              AR
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
