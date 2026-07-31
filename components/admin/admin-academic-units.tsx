'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Network,
  School,
  Plus,
  GitCommit,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List
} from 'lucide-react'

export function AcademicUnitsTab() {
  const supabase = createClient()
  const [units, setUnits] = useState<any[]>([])
  const [universities, setUniversities] = useState<any[]>([])
  const [selectedUnivId, setSelectedUnivId] = useState<string>('')
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Expand state for tree nodes
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    university_id: '',
    parent_unit_id: '',
    unit_type: 'faculty',
    name_fr: '',
    name_ar: '',
    name_en: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: univs } = await supabase.from('universities').select('*').order('name')
    setUniversities(univs || [])
    if (univs && univs.length > 0) {
      setSelectedUnivId(univs[0].id)
    }

    const { data: allUnits } = await supabase.from('faculties').select('*')
    setUnits(allUnits || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('faculties')
      .insert([
        {
          ...formData,
          parent_unit_id: formData.parent_unit_id || null,
          workflow_status: 'published'
        }
      ])

    if (!error) {
      setFormData({
        university_id: '',
        parent_unit_id: '',
        unit_type: 'faculty',
        name_fr: '',
        name_ar: '',
        name_en: ''
      })
      setIsDialogOpen(false)
      loadData()
    } else {
      alert('Error inserting unit: ' + error.message)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) return <div>Loading...</div>

  // Filter units for the selected university
  const filteredUnits = units.filter(u => u.university_id === selectedUnivId)

  // Build tree from filtered units
  // Roots are units with parent_unit_id === null
  const roots = filteredUnits.filter(u => !u.parent_unit_id)

  const renderTreeNode = (node: any, level: number = 0) => {
    const children = filteredUnits.filter(u => u.parent_unit_id === node.id)
    const hasChildren = children.length > 0
    const isExpanded = !!expandedNodes[node.id]

    return (
      <div key={node.id} className="select-none animate-in fade-in duration-150">
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-muted/40 rounded-lg cursor-pointer transition-colors"
          onClick={() => hasChildren && toggleExpand(node.id)}
          style={{ paddingLeft: `${Math.max(12, level * 24)}px` }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )
          ) : (
            <GitCommit className="h-4.5 w-4.5 text-muted-foreground/50 shrink-0" />
          )}

          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-4.5 w-4.5 text-primary shrink-0" />
            ) : (
              <Folder className="h-4.5 w-4.5 text-primary shrink-0" />
            )
          ) : null}

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">{node.name_fr}</span>
            {node.name_ar && (
              <span className="text-xs text-muted-foreground/80 font-sans truncate">({node.name_ar})</span>
            )}
            <Badge variant="outline" className="uppercase text-[8px] font-extrabold tracking-wider leading-none">
              {node.unit_type}
            </Badge>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5 space-y-0.5">
            {children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Potential parent units selector for form
  const potentialParents = units.filter(u => u.university_id === formData.university_id && u.unit_type !== 'department')

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Academic Units Structure</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage departments, faculties, and academic structural organization.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* List/Tree Toggler */}
          <div className="border border-border rounded-lg p-0.5 bg-muted flex items-center shrink-0">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'tree' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="cursor-pointer">Add Unit</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Academic Unit</DialogTitle>
                <DialogDescription>Define a faculty, institute, school, or department.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="form_univ">University</Label>
                  <select
                    id="form_univ"
                    required
                    value={formData.university_id}
                    onChange={e => setFormData({ ...formData, university_id: e.target.value, parent_unit_id: '' })}
                    className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                  >
                    <option value="">-- Select University --</option>
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name_fr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="form_type">Unit Type</Label>
                    <select
                      id="form_type"
                      required
                      value={formData.unit_type}
                      onChange={e => setFormData({ ...formData, unit_type: e.target.value })}
                      className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                    >
                      <option value="faculty">Faculty</option>
                      <option value="institute">Institute</option>
                      <option value="school">School</option>
                      <option value="center">Center</option>
                      <option value="department">Department</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_parent">Parent Unit (Optional)</Label>
                    <select
                      id="form_parent"
                      value={formData.parent_unit_id}
                      onChange={e => setFormData({ ...formData, parent_unit_id: e.target.value })}
                      className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                      disabled={!formData.university_id}
                    >
                      <option value="">None (Top-Level)</option>
                      {potentialParents.map(parent => (
                        <option key={parent.id} value={parent.id}>
                          [{parent.unit_type}] {parent.name_fr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name_fr">Name (French)</Label>
                    <Input
                      id="name_fr"
                      required
                      placeholder="e.g. Faculté des Sciences"
                      value={formData.name_fr}
                      onChange={e => setFormData({ ...formData, name_fr: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_ar">Name (Arabic)</Label>
                    <Input
                      id="name_ar"
                      placeholder="e.g. كلية العلوم"
                      value={formData.name_ar}
                      onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full cursor-pointer">Insert Academic Unit</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* University Picker selector */}
      <div className="flex items-center gap-3 bg-muted/40 p-4 rounded-xl border border-border max-w-sm">
        <School className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
        <select
          value={selectedUnivId}
          onChange={e => setSelectedUnivId(e.target.value)}
          className="w-full bg-transparent text-foreground font-semibold outline-none text-sm cursor-pointer"
        >
          {universities.map(u => (
            <option key={u.id} value={u.id} className="bg-popover text-foreground">
              {u.name_fr} ({u.wilaya})
            </option>
          ))}
        </select>
      </div>

      {/* Workspace Display Area */}
      {viewMode === 'tree' ? (
        /* TREE STRUCTURE PANEL */
        <div className="bg-card border border-border rounded-xl p-6 space-y-2">
          {roots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No units configured for this institution.</p>
          ) : (
            <div className="space-y-1">
              {roots.map(root => renderTreeNode(root))}
            </div>
          )}
        </div>
      ) : (
        /* STANDARD LIST VIEW TABLE */
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Unit Name (French)</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Unit Name (Arabic)</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-sm text-muted-foreground">No units found.</td>
                </tr>
              ) : (
                filteredUnits.map(unit => (
                  <tr key={unit.id} className="border-b border-border hover:bg-muted/50 last:border-none">
                    <td className="py-3 px-4 font-bold text-foreground">{unit.name_fr}</td>
                    <td className="py-3 px-4 font-sans text-muted-foreground">{unit.name_ar || '—'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="uppercase text-[9px] font-bold">
                        {unit.unit_type}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
