'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

interface HeaderProps {
  language?: string
  setLanguage?: (lang: string) => void
}

export function Header({ language = 'fr', setLanguage }: HeaderProps = {}) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    } else {
      setTheme('light')
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
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
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Masters Algérie</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors mr-2"
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Language Selection Buttons */}
            <Button
              variant={language === 'fr' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage?.('fr')}
              className={`w-10 h-8 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                language === 'fr'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              FR
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage?.('ar')}
              className={`w-10 h-8 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                language === 'ar'
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
