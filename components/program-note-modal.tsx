'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/language-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  StickyNote,
  X,
  Send,
  CheckCircle2,
  Building2,
  GraduationCap,
  Sparkles,
  AlertCircle,
  FileEdit,
  Calendar,
  BookOpen,
  MessageSquare
} from 'lucide-react'

export interface ProgramNoteTarget {
  id: string
  title: string
  universityName: string
  facultyName?: string
  level?: string
}

interface ProgramNoteModalProps {
  isOpen: boolean
  onClose: () => void
  program: ProgramNoteTarget | null
}

export function ProgramNoteModal({ isOpen, onClose, program }: ProgramNoteModalProps) {
  const { t, language } = useLanguage()
  const [noteType, setNoteType] = useState<string>('general')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen || !program) return null

  const noteCategories = [
    { id: 'general', label: t('note.type_general'), icon: MessageSquare },
    { id: 'correction', label: t('note.type_correction'), icon: FileEdit },
    { id: 'deadline', label: t('note.type_deadline'), icon: Calendar },
    { id: 'prerequisite', label: t('note.type_prerequisite'), icon: BookOpen }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setErrorMessage(language === 'ar' ? 'الرجاء إدخال تفاصيل الملاحظة.' : 'Please enter your note details.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    const notePayload = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'note-' + Date.now(),
      listing_id: program.id,
      program_title: program.title,
      university_name: program.universityName,
      faculty_name: program.facultyName || null,
      message: message.trim(),
      note_type: noteType,
      contact_email: email.trim() || null,
      verification_status: 'pending',
      created_at: new Date().toISOString()
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('suggested_updates').insert([
        {
          listing_id: program.id,
          message: `[${noteType.toUpperCase()}] ${message.trim()} (Program: ${program.title} - ${program.universityName})`,
          contact_email: email.trim() || null
        }
      ])

      if (error) {
        console.warn('Supabase insert note notice:', error)
      }
    } catch (err) {
      console.warn('Supabase fallback executed locally:', err)
    }

    // Always store local copy in localStorage queue so it displays immediately in Admin
    try {
      const existingRaw = localStorage.getItem('suggested_updates_local')
      const existing = existingRaw ? JSON.parse(existingRaw) : []
      localStorage.setItem('suggested_updates_local', JSON.stringify([notePayload, ...existing]))
    } catch (e) {
      console.error('LocalStorage write error:', e)
    }

    setIsSubmitting(false)
    setSubmitSuccess(true)

    setTimeout(() => {
      setSubmitSuccess(false)
      setMessage('')
      setEmail('')
      setNoteType('general')
      onClose()
    }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200">
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 border-b border-border relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <StickyNote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground leading-tight">
                {t('note.modal_title')}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {t('note.modal_subtitle')}
              </p>
            </div>
          </div>
        </div>

        {submitSuccess ? (
          <div className="p-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-foreground">
              {language === 'ar' ? 'تم إرسال ملاحظتك بنجاح!' : 'Note Submitted Successfully!'}
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t('note.success_msg')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Target Program Context Card */}
            <div className="bg-muted/40 border border-border/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{t('note.program_label')}</span>
                </span>
                {program.level && (
                  <Badge variant="outline" className="text-[9px] font-mono font-bold uppercase">
                    {program.level}
                  </Badge>
                )}
              </div>

              <h4 className="font-extrabold text-sm text-foreground leading-snug">
                {program.title}
              </h4>

              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                <span>
                  {program.universityName}
                  {program.facultyName ? ` • ${program.facultyName}` : ''}
                </span>
              </p>
            </div>

            {/* Note Category Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                {t('note.type_label')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {noteCategories.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = noteType === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNoteType(cat.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Note Text Field */}
            <div className="space-y-1.5">
              <Label htmlFor="note-message" className="text-xs font-bold text-foreground">
                {t('note.message_label')} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="note-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('note.message_placeholder')}
                className="text-xs rounded-xl border-border bg-background resize-none focus-visible:ring-primary"
              />
            </div>

            {/* Optional Email Contact */}
            <div className="space-y-1.5">
              <Label htmlFor="note-email" className="text-xs font-bold text-foreground">
                {t('note.email_label')}
              </Label>
              <Input
                id="note-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('note.email_placeholder')}
                className="text-xs rounded-xl border-border bg-background focus-visible:ring-primary"
              />
            </div>

            {errorMessage && (
              <div className="text-xs font-semibold text-destructive flex items-center gap-1.5 bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Buttons Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Submitting...') : t('note.send_btn')}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
