'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Search,
  Sparkles,
  School,
  Megaphone,
  Settings,
  History,
  Trash2,
  FileText,
  UserPlus
} from 'lucide-react'
import { AdminView } from './admin-sidebar'

import { useLanguage } from '@/components/language-context'

interface CommandItem {
  title: string
  subtitle?: string
  shortcut?: string[]
  icon: React.ComponentType<{ className?: string }>
  action: () => void
}

interface CommandSection {
  heading: string
  items: CommandItem[]
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onViewChange: (view: AdminView) => void
  onOpenWizard: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  onViewChange,
  onOpenWizard
}: CommandPaletteProps) {
  const { language } = useLanguage()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Register Cmd/Ctrl + K toggle listener
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSearch('')
      setSelectedIndex(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sections: CommandSection[] = [
    {
      heading: language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions',
      items: [
        {
          title: language === 'ar' ? 'إنشاء عرض ماجستير' : 'Create Opportunity',
          subtitle: language === 'ar' ? 'إطلاق معالج إنشاء عروض الماجستير' : 'Launch the multi-step opportunity builder wizard',
          shortcut: ['N'],
          icon: Sparkles,
          action: () => {
            onClose()
            onOpenWizard()
          }
        },
        {
          title: language === 'ar' ? 'إضافة جامعة جديدة' : 'Create University',
          subtitle: language === 'ar' ? 'إضافة مؤسسة تعليم عالي جديدة إلى المنصة' : 'Add a new educational institution to the system',
          icon: School,
          action: () => {
            onClose()
            onViewChange('universities')
          }
        }
      ]
    },
    {
      heading: language === 'ar' ? 'التنقل' : 'Navigation',
      items: [
        {
          title: language === 'ar' ? 'الانتقال إلى الجامعات' : 'Go to Universities',
          subtitle: language === 'ar' ? 'إدارة مؤسسات التعليم العالي والكليات' : 'Manage educational institutions and faculties',
          icon: School,
          action: () => {
            onClose()
            onViewChange('universities')
          }
        },
        {
          title: language === 'ar' ? 'فتح الإعدادات' : 'Open Settings',
          subtitle: language === 'ar' ? 'تكوين مظهر المنصة واللغات وإعادة ضبط كلمة المرور والفلاتر' : 'Configure site details, languages, backups, and security',
          shortcut: ['Ctrl', 'S'],
          icon: Settings,
          action: () => {
            onClose()
            onViewChange('settings')
          }
        }
      ]
    }
  ]

  // Filter commands by search
  const filteredSections = sections
    .map(section => {
      const items = section.items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()))
      )
      return { ...section, items }
    })
    .filter(section => section.items.length > 0)

  // Flattened items to support keyboard navigation indices
  const flattenedItems = filteredSections.flatMap(section => section.items)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % Math.max(1, flattenedItems.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + flattenedItems.length) % Math.max(1, flattenedItems.length))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (flattenedItems[selectedIndex]) {
          flattenedItems[selectedIndex].action()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, flattenedItems, onClose])

  if (!isOpen) return null

  // Calculate overall flattened index during map
  let currentFlattenedIndex = 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Main Panel Box */}
      <div className="relative w-full max-w-lg bg-popover text-popover-foreground border border-border shadow-2xl rounded-lg overflow-hidden flex flex-col max-h-[450px]">
        {/* Search header input */}
        <div className="flex items-center gap-3 px-4 border-b border-border h-12 shrink-0">
          <Search className="h-4.5 w-4.5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground w-full"
          />
          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border font-medium select-none">
            ESC
          </span>
        </div>

        {/* Scrollable commands list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto py-2.5 px-2"
        >
          {filteredSections.length > 0 ? (
            filteredSections.map((section, sIdx) => (
              <div key={sIdx} className="mb-4 last:mb-0">
                <h4 className="px-3 py-1 text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase select-none">
                  {section.heading}
                </h4>
                <div className="space-y-0.5 mt-1">
                  {section.items.map((item, iIdx) => {
                    const Icon = item.icon
                    const isSelected = currentFlattenedIndex === selectedIndex
                    const flatIdx = currentFlattenedIndex
                    currentFlattenedIndex++ // Increment for the next mapping

                    return (
                      <button
                        key={iIdx}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(flatIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors cursor-pointer select-none ${
                          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{item.title}</p>
                          {item.subtitle && (
                            <p className={`text-xs truncate ${isSelected ? 'text-primary/70' : 'text-muted-foreground'}`}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        {item.shortcut && (
                          <div className="flex items-center gap-0.5 ml-3">
                            {item.shortcut.map((key, kIdx) => (
                              <kbd
                                key={kIdx}
                                className="h-5 px-1 bg-muted border border-border rounded font-mono text-[9px] text-muted-foreground flex items-center justify-center select-none"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No commands or pages match your search.</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="h-9 border-t border-border bg-muted/50 px-4 flex items-center gap-4 text-[10px] text-muted-foreground shrink-0 select-none font-medium">
          <span className="flex items-center gap-1">
            <kbd className="bg-popover border border-border px-1.5 py-0.5 rounded font-mono text-[9px]">↵</kbd>
            to select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-popover border border-border px-1 px-0.5 rounded font-mono text-[9px]">↑</kbd>
            <kbd className="bg-popover border border-border px-1 px-0.5 rounded font-mono text-[9px]">↓</kbd>
            to navigate
          </span>
        </div>
      </div>
    </div>
  )
}
