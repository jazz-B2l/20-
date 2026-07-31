'use client'

import { useState, useEffect } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  CheckCircle,
  Monitor,
  Tablet,
  Smartphone,
  Trash2,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

interface OppCreateWizardProps {
  isOpen: boolean
  onClose: () => void
  onPublishSuccess: () => void
}

export function OppCreateWizard({
  isOpen,
  onClose,
  onPublishSuccess
}: OppCreateWizardProps) {
  const supabase = createClient()

  // Steps indicator list
  const steps = [
    'University',
    'Academic Unit',
    'Opportunity Details',
    'Session Setup',
    'Timeline',
    'Required Documents',
    'Sources',
    'Media',
    'Preview & Publish'
  ]

  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [draftStatus, setDraftStatus] = useState('Draft saved.')

  // Fetch lists for select dropdowns
  const [universities, setUniversities] = useState<any[]>([])
  const [academicUnits, setAcademicUnits] = useState<any[]>([])
  const [domains, setDomains] = useState<any[]>([])

  // Form State
  const [form, setForm] = useState({
    university_id: '',
    academic_unit_id: '',
    opportunity_type: 'master',
    title_fr: '',
    title_ar: '',
    description_fr: '',
    description_ar: '',
    level: 'M1',
    domain_id: '',
    academic_year: '2025/2026',
    seats_available: '30',
    portal_url: '',
    deadline_date: '',
    required_docs: [
      { name_fr: 'Licence Degree / Diplôme de Licence', is_required: true },
      { name_fr: 'Transcripts of Records / Relevés de Notes', is_required: true },
      { name_fr: 'Birth Certificate / Acte de Naissance', is_required: false }
    ],
    source_url: '',
    source_type: 'official_website',
    cover_media_url: ''
  })

  // Device view modifier for Step 9 Preview
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'phone'>('desktop')

  // Load select option data
  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      // Load universities
      const { data: univs } = await supabase.from('universities').select('*').eq('workflow_status', 'published')
      setUniversities(univs || [])

      // Load domains
      const { data: doms } = await supabase.from('domains').select('*').eq('workflow_status', 'published')
      setDomains(doms || [])
    }
    loadData()
  }, [isOpen])

  // Load academic units when university is selected
  useEffect(() => {
    if (!form.university_id) {
      setAcademicUnits([])
      return
    }
    const loadUnits = async () => {
      const { data: units } = await supabase
        .from('faculties')
        .select('*')
        .eq('university_id', form.university_id)
        .eq('workflow_status', 'published')
      setAcademicUnits(units || [])
    }
    loadUnits()
  }, [form.university_id])

  // Load drafts if available
  useEffect(() => {
    if (!isOpen) return
    const savedDraft = localStorage.getItem('opp_wizard_draft')
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        setForm(parsed)
        setDraftStatus('Draft recovered from last session.')
      } catch (e) {
        console.error('Failed to parse draft', e)
      }
    }
  }, [isOpen])

  // Autosave trigger
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      localStorage.setItem('opp_wizard_draft', JSON.stringify(form))
      setDraftStatus(`Saved at ${new Date().toLocaleTimeString()}`)
    }, 1500)
    return () => clearTimeout(timer)
  }, [form, isOpen])

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      // 1. Insert Program
      const { data: program, error: progError } = await supabase
        .from('programs')
        .insert([
          {
            university_id: form.university_id,
            faculty_id: form.academic_unit_id || null,
            title_fr: form.title_fr,
            title_ar: form.title_ar || null,
            description_fr: form.description_fr || null,
            description_ar: form.description_ar || null,
            level: form.level,
            domain_id: form.domain_id || null,
            workflow_status: 'published'
          }
        ])
        .select()
        .single()

      if (progError) throw progError

      // 2. Insert Admission Window
      const { error: winError } = await supabase
        .from('admission_windows')
        .insert([
          {
            program_id: program.id,
            academic_year: form.academic_year,
            seats: parseInt(form.seats_available) || null,
            portal_url: form.portal_url || null,
            deadline: form.deadline_date || null,
            is_published: true
          }
        ])

      if (winError) throw winError

      // Clear draft on publish success
      localStorage.removeItem('opp_wizard_draft')
      onPublishSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to publish opportunity:', err)
      alert('Error during publication: ' + (err as any).message)
    } finally {
      setLoading(false)
    }
  }

  // Selected names for preview text
  const selectedUnivName = universities.find(u => u.id === form.university_id)?.name_fr || 'Unselected University'
  const selectedDomainName = domains.find(d => d.id === form.domain_id)?.name_fr || 'Unselected Domain'

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Main Panel Sliding in from Right */}
      <div className="relative w-full max-w-5xl bg-card border-l border-border shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-250 select-none">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground leading-tight">Create New Opportunity</h2>
              <p className="text-[10px] text-muted-foreground font-medium font-mono">{draftStatus}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Steps Navigation Subheader */}
        <div className="border-b border-border bg-muted/30 px-6 py-3 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold">
              {idx > 0 && <span className="text-muted-foreground/45 font-light">/</span>}
              <span
                className={
                  currentStep === idx
                    ? 'text-primary'
                    : currentStep > idx
                    ? 'text-foreground/80'
                    : 'text-muted-foreground'
                }
              >
                {idx + 1}. {step}
              </span>
            </div>
          ))}
        </div>

        {/* Step Forms Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {currentStep === 0 && (
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Select University</h3>
                <p className="text-sm text-muted-foreground mb-6">Choose the hosting institution for this degree opportunity.</p>
                <div className="space-y-3">
                  <Label htmlFor="univ_select">University</Label>
                  <select
                    id="univ_select"
                    value={form.university_id}
                    onChange={e => setForm({ ...form, university_id: e.target.value })}
                    className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                  >
                    <option value="">-- Choose University --</option>
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name_fr} ({u.wilaya})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Select Academic Unit</h3>
                <p className="text-sm text-muted-foreground mb-6">Associate the opportunity with a faculty, department, or center.</p>
                <div className="space-y-3">
                  <Label htmlFor="unit_select">Academic Unit (Optional)</Label>
                  <select
                    id="unit_select"
                    value={form.academic_unit_id}
                    onChange={e => setForm({ ...form, academic_unit_id: e.target.value })}
                    className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                    disabled={!form.university_id}
                  >
                    <option value="">-- Choose Academic Unit --</option>
                    {academicUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        [{unit.unit_type}] {unit.name_fr}
                      </option>
                    ))}
                  </select>
                  {!form.university_id && (
                    <p className="text-xs text-destructive">Please select a university in Step 1 first.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Opportunity Details</h3>
                <p className="text-sm text-muted-foreground mb-6">Input the descriptive details of the academic program.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title_fr">Program Name (French)</Label>
                  <Input
                    id="title_fr"
                    required
                    placeholder="e.g. Master en Intelligence Artificielle"
                    value={form.title_fr}
                    onChange={e => setForm({ ...form, title_fr: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_ar">Program Name (Arabic)</Label>
                  <Input
                    id="title_ar"
                    placeholder="e.g. ماستر في الذكاء الاصطناعي"
                    value={form.title_ar}
                    onChange={e => setForm({ ...form, title_ar: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <select
                    id="level"
                    value={form.level}
                    onChange={e => setForm({ ...form, level: e.target.value })}
                    className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                  >
                    <option value="M1">M1 (Master 1)</option>
                    <option value="M2">M2 (Master 2)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain_id">Academic Domain</Label>
                  <select
                    id="domain_id"
                    value={form.domain_id}
                    onChange={e => setForm({ ...form, domain_id: e.target.value })}
                    className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                  >
                    <option value="">-- Choose Domain --</option>
                    {domains.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name_fr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc_fr">Description (French)</Label>
                <Textarea
                  id="desc_fr"
                  rows={4}
                  placeholder="Provide details about objectives, curriculum, and structure..."
                  value={form.description_fr}
                  onChange={e => setForm({ ...form, description_fr: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Session Setup</h3>
                <p className="text-sm text-muted-foreground mb-6">Setup the academic session variables for the registration cycle.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="academic_year">Academic Year</Label>
                  <Input
                    id="academic_year"
                    value={form.academic_year}
                    onChange={e => setForm({ ...form, academic_year: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Seats Available</Label>
                  <Input
                    id="seats"
                    type="number"
                    value={form.seats_available}
                    onChange={e => setForm({ ...form, seats_available: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portal_url">Direct Portal Registration URL</Label>
                  <Input
                    id="portal_url"
                    type="url"
                    placeholder="https://univ-portal.dz/apply"
                    value={form.portal_url}
                    onChange={e => setForm({ ...form, portal_url: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Timeline Settings</h3>
                <p className="text-sm text-muted-foreground mb-6">Specify critical admission deadlines and milestones.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Close Date (Deadline)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={form.deadline_date}
                    onChange={e => setForm({ ...form, deadline_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Required Documents</h3>
                <p className="text-sm text-muted-foreground mb-6">Define the document checklists candidate applicants must upload.</p>
              </div>

              <div className="space-y-3">
                {form.required_docs.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-muted/40 border border-border rounded-lg">
                    <div className="flex-1 mr-4">
                      <Input
                        value={doc.name_fr}
                        onChange={e => {
                          const updated = [...form.required_docs]
                          updated[idx].name_fr = e.target.value
                          setForm({ ...form, required_docs: updated })
                        }}
                        className="bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold h-auto"
                      />
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doc.is_required}
                          onChange={e => {
                            const updated = [...form.required_docs]
                            updated[idx].is_required = e.target.checked
                            setForm({ ...form, required_docs: updated })
                          }}
                        />
                        <span>Required</span>
                      </label>

                      <button
                        onClick={() => {
                          const updated = form.required_docs.filter((_, i) => i !== idx)
                          setForm({ ...form, required_docs: updated })
                        }}
                        className="text-destructive hover:text-destructive/80 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setForm({
                      ...form,
                      required_docs: [
                        ...form.required_docs,
                        { name_fr: 'New Document Template', is_required: true }
                      ]
                    })
                  }}
                  className="w-full py-2.5 border border-dashed border-border hover:border-primary rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold hover:text-primary transition-all cursor-pointer mt-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Document Item
                </button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Sources & Verification</h3>
                <p className="text-sm text-muted-foreground mb-6">Provide official validation reference page links.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source_url">Official Source URL</Label>
                  <Input
                    id="source_url"
                    type="url"
                    placeholder="https://www.univ.dz/news/master-announcement"
                    value={form.source_url}
                    onChange={e => setForm({ ...form, source_url: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source_type">Source Category</Label>
                  <select
                    id="source_type"
                    value={form.source_type}
                    onChange={e => setForm({ ...form, source_type: e.target.value })}
                    className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                  >
                    <option value="official_website">Official Website</option>
                    <option value="official_pdf">Official PDF</option>
                    <option value="social_media">Social Media Channel</option>
                    <option value="ministry">Ministry / Government Portal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Media Assets</h3>
                <p className="text-sm text-muted-foreground mb-6">Attach mock media banner images or URLs.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cover_url">Cover Image URL (Optional)</Label>
                  <Input
                    id="cover_url"
                    type="url"
                    placeholder="https://images.unsplash.com/... or similar"
                    value={form.cover_media_url}
                    onChange={e => setForm({ ...form, cover_media_url: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex justify-between items-center shrink-0 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold">Responsive Live Preview</h3>
                  <p className="text-sm text-muted-foreground">Verify structural rendering before writing changes to the DB.</p>
                </div>

                {/* Device Viewport switchers */}
                <div className="flex border border-border rounded-lg p-0.5 bg-muted">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      previewDevice === 'tablet' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('phone')}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      previewDevice === 'phone' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="flex-1 flex justify-center bg-muted/40 p-4 overflow-y-auto rounded-lg border border-border min-h-[300px]">
                <div
                  className={`bg-card text-foreground border border-border shadow-md rounded-xl p-6 transition-all duration-200 self-start ${
                    previewDevice === 'phone'
                      ? 'w-[360px]'
                      : previewDevice === 'tablet'
                      ? 'w-[640px]'
                      : 'w-full max-w-4xl'
                  }`}
                >
                  <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {form.opportunity_type.toUpperCase()} • {form.level}
                  </span>
                  <h1 className="text-2xl font-bold mt-2 text-foreground">
                    {form.title_fr || 'Program Title (French)'}
                  </h1>
                  {form.title_ar && (
                    <h2 className="text-xl font-bold text-muted-foreground mt-1 text-right font-sans">
                      {form.title_ar}
                    </h2>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-6 border-y border-border py-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold">University</p>
                      <p className="font-bold text-foreground">{selectedUnivName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold">Domain</p>
                      <p className="font-bold text-foreground">{selectedDomainName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold">Seats Available</p>
                      <p className="font-bold text-foreground">{form.seats_available}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold">Academic Year</p>
                      <p className="font-bold text-foreground">{form.academic_year}</p>
                    </div>
                  </div>

                  {form.description_fr && (
                    <div className="mt-6">
                      <h3 className="text-sm font-bold border-b border-border pb-1">Program Details</h3>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">
                        {form.description_fr}
                      </p>
                    </div>
                  )}

                  {form.required_docs.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-bold border-b border-border pb-1">Documents Checklist</h3>
                      <ul className="mt-2 space-y-1.5">
                        {form.required_docs.map((doc, dIdx) => (
                          <li key={dIdx} className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span>{doc.name_fr}</span>
                            {doc.is_required && (
                              <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-semibold uppercase">
                                Required
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="h-16 border-t border-border bg-card px-6 flex items-center justify-between shrink-0 select-none">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="cursor-pointer"
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground select-none">
              Step {currentStep + 1} of {steps.length}
            </span>

            {currentStep === steps.length - 1 ? (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={loading || !form.university_id || !form.title_fr}
                className="cursor-pointer bg-primary text-primary-foreground font-semibold px-4 flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !form.university_id) ||
                  (currentStep === 2 && !form.title_fr)
                }
                className="cursor-pointer flex items-center gap-1.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
