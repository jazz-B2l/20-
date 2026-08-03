'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Apply theme to HTML document element
  const applyTheme = (targetTheme: Theme) => {
    let activeTheme: 'light' | 'dark' = 'light'

    if (targetTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      activeTheme = systemPrefersDark ? 'dark' : 'light'
    } else {
      activeTheme = targetTheme
    }

    setResolvedTheme(activeTheme)

    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Load saved theme on initial mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    const initialTheme: Theme = (saved === 'dark' || saved === 'light' || saved === 'system') ? saved : 'light'
    
    setThemeState(initialTheme)
    applyTheme(initialTheme)
    setMounted(true)
  }, [])

  // Listen to system preference changes if theme is set to 'system'
  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleSystemChange)
    return () => mediaQuery.removeEventListener('change', handleSystemChange)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
