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
import {
  Folder,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Search,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ExternalLink,
  Loader2
} from 'lucide-react'

type MediaFolder = 'all' | 'universities' | 'opportunities' | 'announcements' | 'documents' | 'general'

export function MediaLibraryTab() {
  const supabase = createClient()
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Folder navigation state
  const [currentFolder, setCurrentFolder] = useState<MediaFolder>('all')

  // Selected item detail side drawer
  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  // Upload dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    url: '',
    alt_text: '',
    media_type: 'image' as 'image' | 'pdf' | 'document',
    folder: 'general' as MediaFolder
  })

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setMediaItems(data || [])
    }
    setLoading(false)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.url) return

    setUploading(true)
    const { error } = await supabase
      .from('media')
      .insert([
        {
          storage_path: uploadForm.url,
          media_type: uploadForm.media_type,
          alt_text: uploadForm.alt_text || null,
          size_bytes: Math.floor(Math.random() * 800000) + 50000, // Simulated size
          workflow_status: 'published'
        }
      ])

    setUploading(false)
    if (!error) {
      setUploadForm({
        url: '',
        alt_text: '',
        media_type: 'image',
        folder: 'general'
      })
      setIsDialogOpen(false)
      loadMedia()
    } else {
      alert('Error saving asset: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset permanently?')) return

    const { error } = await supabase.from('media').delete().eq('id', id)
    if (!error) {
      setSelectedItem(null)
      loadMedia()
    } else {
      alert('Error deleting asset: ' + error.message)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('Asset URL copied to clipboard!')
  }

  if (loading && mediaItems.length === 0) return <div>Loading...</div>

  // Filter media based on search query and folder type
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.storage_path.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Simple folder filter logic based on name strings inside path/alt text
    if (currentFolder === 'all') return matchesSearch

    const pathLower = item.storage_path.toLowerCase()
    const altLower = (item.alt_text || '').toLowerCase()
    const folderKeyword = currentFolder.slice(0, -1) // remove plural 's'

    const matchesFolder = pathLower.includes(folderKeyword) || altLower.includes(folderKeyword) || 
                          (currentFolder === 'general' && !pathLower.includes('univ') && !pathLower.includes('opp') && !pathLower.includes('announc'))

    return matchesSearch && matchesFolder
  })

  // Folders definition
  const folders: { id: MediaFolder; label: string; count: number }[] = [
    { id: 'all', label: 'All Assets', count: mediaItems.length },
    { id: 'universities', label: 'Universities Logo/Cover', count: mediaItems.filter(m => m.storage_path.toLowerCase().includes('univ') || (m.alt_text || '').toLowerCase().includes('univ')).length },
    { id: 'opportunities', label: 'Opportunities Banner', count: mediaItems.filter(m => m.storage_path.toLowerCase().includes('opp') || (m.alt_text || '').toLowerCase().includes('opp')).length },
    { id: 'announcements', label: 'Announcements', count: mediaItems.filter(m => m.storage_path.toLowerCase().includes('announc') || (m.alt_text || '').toLowerCase().includes('announc')).length },
    { id: 'documents', label: 'Documents templates', count: mediaItems.filter(m => m.media_type === 'pdf' || m.media_type === 'document').length },
    { id: 'general', label: 'General / Others', count: mediaItems.filter(m => !m.storage_path.toLowerCase().includes('univ') && !m.storage_path.toLowerCase().includes('opp') && !m.storage_path.toLowerCase().includes('announc')).length }
  ]

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Media Library</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Upload, explore, and reference visual assets and documents.</p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="cursor-pointer">Upload Asset</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Asset to Library</DialogTitle>
                <DialogDescription>Reference a cover photo URL or template link.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="form_url">Media URL</Label>
                  <Input
                    id="form_url"
                    required
                    placeholder="https://images.unsplash.com/... or storage URL"
                    value={uploadForm.url}
                    onChange={e => setUploadForm({ ...uploadForm, url: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="form_type">Media Type</Label>
                    <select
                      id="form_type"
                      required
                      value={uploadForm.media_type}
                      onChange={e => setUploadForm({ ...uploadForm, media_type: e.target.value as any })}
                      className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                    >
                      <option value="image">Image</option>
                      <option value="pdf">PDF Document</option>
                      <option value="document">Office Doc</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_folder">Folder Destination</Label>
                    <select
                      id="form_folder"
                      required
                      value={uploadForm.folder}
                      onChange={e => setUploadForm({ ...uploadForm, folder: e.target.value as any })}
                      className="w-full bg-card text-foreground border border-border rounded-lg p-2.5 outline-none focus:border-primary font-medium text-sm"
                    >
                      <option value="general">General</option>
                      <option value="universities">Universities</option>
                      <option value="opportunities">Opportunities</option>
                      <option value="announcements">Announcements</option>
                      <option value="documents">Documents</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form_alt">Description / Alt Text</Label>
                  <Input
                    id="form_alt"
                    placeholder="Alt text or short description..."
                    value={uploadForm.alt_text}
                    onChange={e => setUploadForm({ ...uploadForm, alt_text: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full cursor-pointer" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin mr-1.5 h-4 w-4" />
                      Saving asset...
                    </>
                  ) : (
                    'Add Media'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main workspace layout: folders navigation panel + files grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Folders Navigator */}
        <div className="space-y-2 lg:border-r lg:border-border lg:pr-6">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-3">Folders</h3>
          <div className="space-y-1">
            {folders.map((folder) => {
              const isActive = currentFolder === folder.id
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setCurrentFolder(folder.id)
                    setSelectedItem(null)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isActive ? <FolderOpen className="h-4.5 w-4.5 shrink-0" /> : <Folder className="h-4.5 w-4.5 shrink-0" />}
                    <span className="truncate">{folder.label}</span>
                  </div>
                  <span className="text-xs font-mono opacity-80">{folder.count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Side: Media Assets grid & Search */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-3 max-w-sm bg-muted/40 px-3.5 py-2 border border-border rounded-xl">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            
            {/* Grid display list */}
            <div className="flex-1">
              {filteredMedia.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card">
                  <p className="text-muted-foreground text-sm">No assets found in this folder folder.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMedia.map((media) => {
                    const isImg = media.media_type === 'image'
                    return (
                      <div
                        key={media.id}
                        onClick={() => setSelectedItem(media)}
                        className={`bg-card border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all relative group flex flex-col justify-between aspect-square select-none ${
                          selectedItem?.id === media.id ? 'border-primary shadow-xs ring-2 ring-primary/20' : 'border-border'
                        }`}
                      >
                        {/* Preview */}
                        <div className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden">
                          {isImg ? (
                            <img
                              src={media.storage_path}
                              alt={media.alt_text}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250"
                            />
                          ) : (
                            <FileText className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>

                        {/* Title details bar */}
                        <div className="p-2 border-t border-border bg-card shrink-0">
                          <p className="text-[10px] font-bold text-foreground truncate">
                            {media.alt_text || media.storage_path.split('/').pop() || 'Untitled'}
                          </p>
                          <span className="text-[9px] text-muted-foreground uppercase font-mono block">
                            {media.media_type} • {Math.round(media.size_bytes / 1024)} KB
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Asset Detail sidebar panel (if item selected) */}
            {selectedItem && (
              <div className="w-full lg:w-72 bg-card border border-border rounded-xl p-5 shrink-0 flex flex-col justify-between select-none animate-in fade-in duration-150">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-bold text-sm">Asset Details</h3>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="h-32 bg-muted/30 border border-border rounded-lg overflow-hidden flex items-center justify-center">
                    {selectedItem.media_type === 'image' ? (
                      <img
                        src={selectedItem.storage_path}
                        alt={selectedItem.alt_text}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-muted-foreground font-semibold">Alt Text / Title</p>
                      <p className="font-bold text-foreground mt-0.5">{selectedItem.alt_text || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-semibold">Format Type</p>
                      <p className="font-mono text-foreground uppercase mt-0.5">{selectedItem.media_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-semibold">File Size</p>
                      <p className="font-mono text-foreground mt-0.5">{Math.round(selectedItem.size_bytes / 1024)} KB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-semibold">Created Date</p>
                      <p className="font-mono text-foreground mt-0.5">
                        {new Date(selectedItem.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyUrl(selectedItem.storage_path)}
                    className="w-full flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy URL
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(selectedItem.id)}
                    className="w-full flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Asset
                  </Button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}
