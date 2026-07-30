'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface HeaderProps {
  language?: string
  setLanguage?: (lang: string) => void
}

export function Header({ language = 'fr', setLanguage }: HeaderProps = {}) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center text-accent-foreground font-bold text-sm">
              20
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-foreground">20%</div>
              <div className="text-xs text-muted-foreground">Portail des Masters</div>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Accueil
            </Link>
            <Link href="/browse" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Parcourir
            </Link>
            <Link href="/admin" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Admin
            </Link>

            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <Button
                variant={language === 'fr' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage?.('fr')}
                className="w-12"
              >
                FR
              </Button>
              <Button
                variant={language === 'ar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage?.('ar')}
                className="w-12"
              >
                AR
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
