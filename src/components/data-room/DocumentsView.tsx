'use client'

import { useEffect, useState, useRef } from 'react'
import { useDataRoomStore, type Document, type AccessTier } from '@/store/data-room-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Eye, 
  Search, 
  MoreHorizontal,
  Loader2,
  Shield,
  File,
  FileImage,
  FileSpreadsheet,
  FileCode,
  Upload,
  Plus,
  AlertCircle,
  Check,
  Trash2
} from 'lucide-react'

export function DocumentsView() {
  const { selectedDealRoom, setSelectedDealRoom, setCurrentView, currentUser } = useDataRoomStore()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [allowedTiers, setAllowedTiers] = useState<string[]>(['TEASER'])
  
  // Upload state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    fileName: '',
    fileSize: 0,
    mimeType: '',
    accessTier: 'TEASER' as AccessTier,
    category: '',
  })

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN'

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedDealRoom || !currentUser) return
      
      try {
        // Get user's access tier from their access grants
        const accessResponse = await fetch(`/api/data-room/access-grants?userId=${currentUser.id}&dealRoomId=${selectedDealRoom.id}`)
        let userTier = 'TEASER'
        
        if (accessResponse.ok) {
          const accessData = await accessResponse.json()
          if (accessData.grant?.accessTier) {
            userTier = accessData.grant.accessTier
          }
        }
        
        // Admins can see everything
        const effectiveTier = isAdmin ? 'TRANSACTION' : userTier
        
        const response = await fetch(
          `/api/data-room/documents?dealRoomId=${selectedDealRoom.id}&userTier=${effectiveTier}&userRole=${currentUser.role}`
        )
        if (response.ok) {
          const data = await response.json()
          setDocuments(data.documents)
          setAllowedTiers(data.allowedTiers || ['TEASER'])
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDocuments()
  }, [selectedDealRoom, currentUser, isAdmin])

  const handleBack = () => {
    setSelectedDealRoom(null)
    setCurrentView('dashboard')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewDocument(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }))
    }
  }

  const handleUpload = async () => {
    if (!newDocument.title || !newDocument.fileName) {
      setUploadError('Please select a file and provide a title')
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const response = await fetch('/api/data-room/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealRoomId: selectedDealRoom?.id,
          title: newDocument.title,
          description: newDocument.description,
          fileName: newDocument.fileName,
          fileSize: newDocument.fileSize,
          mimeType: newDocument.mimeType,
          accessTier: newDocument.accessTier,
          category: newDocument.category,
          uploadedBy: currentUser?.id,
          userRole: currentUser?.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Add to documents list
      setDocuments(prev => [{
        id: data.document.id,
        dealRoomId: selectedDealRoom?.id || '',
        title: newDocument.title,
        description: newDocument.description,
        fileName: newDocument.fileName,
        fileSize: newDocument.fileSize,
        mimeType: newDocument.mimeType,
        accessTier: newDocument.accessTier,
        status: 'APPROVED',
        category: newDocument.category,
        tags: [],
        version: 1,
        hasWatermark: false,
        createdAt: new Date().toISOString(),
        uploadedBy: currentUser?.id || null,
      }, ...prev])

      setUploadSuccess(true)
      setTimeout(() => {
        setUploadDialogOpen(false)
        setUploadSuccess(false)
        setNewDocument({
          title: '',
          description: '',
          fileName: '',
          fileSize: 0,
          mimeType: '',
          accessTier: 'TEASER',
          category: '',
        })
      }, 1500)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) return
    
    try {
      await fetch(`/api/data-room/documents/${doc.id}`, { method: 'DELETE' })
      setDocuments(prev => prev.filter(d => d.id !== doc.id))
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      await fetch('/api/data-room/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DOWNLOAD',
          resource: 'DOCUMENT',
          resourceId: doc.id,
          userId: currentUser?.id,
          details: JSON.stringify({ fileName: doc.fileName }),
        }),
      })
      
      alert(`Download initiated for: ${doc.fileName}\n\nIn production, this would generate a signed S3 URL with watermarking.`)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleView = async (doc: Document) => {
    try {
      await fetch('/api/data-room/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VIEW',
          resource: 'DOCUMENT',
          resourceId: doc.id,
          userId: currentUser?.id,
          details: JSON.stringify({ fileName: doc.fileName }),
        }),
      })
      
      alert(`Viewing: ${doc.title}\n\nIn production, this would open the document in a secure viewer with watermarking.`)
    } catch (error) {
      console.error('View failed:', error)
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'TEASER': return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'QUALIFIED': return 'bg-amber-600/20 text-amber-400 border-amber-600/30'
      case 'TRANSACTION': return 'bg-red-600/20 text-red-400 border-red-600/30'
      default: return 'bg-stone-600/20 text-stone-400 border-stone-600/30'
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <FileImage className="w-5 h-5 text-blue-400" />
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-400" />
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />
    if (mimeType.includes('code') || mimeType.includes('json')) return <FileCode className="w-5 h-5 text-purple-400" />
    return <File className="w-5 h-5 text-stone-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Filter documents client-side for non-admins
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTier = tierFilter === 'all' || doc.accessTier === tierFilter
    return matchesSearch && matchesTier
  })

  // Get available tier filters based on user's access
  const availableTierFilters = isAdmin 
    ? ['all', 'TEASER', 'QUALIFIED', 'TRANSACTION']
    : ['all', ...allowedTiers]

  if (!selectedDealRoom) {
    return (
      <Card className="bg-stone-900/50 border-stone-700">
        <CardContent className="py-12 text-center">
          <p className="text-stone-400">No deal room selected</p>
          <Button onClick={handleBack} className="mt-4 bg-amber-600 hover:bg-amber-700">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="text-stone-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{selectedDealRoom.name}</h1>
            <p className="text-stone-400">{selectedDealRoom.description}</p>
          </div>
        </div>
        
        {/* Admin Upload Button */}
        {isAdmin && (
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-stone-900 border-stone-700 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-white">Upload Document</DialogTitle>
                <DialogDescription className="text-stone-400">
                  Add a new document to this deal room
                </DialogDescription>
              </DialogHeader>
              
              {uploadSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/50 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Document Uploaded</h3>
                  <p className="text-stone-400 text-sm mt-1">The document has been added successfully</p>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {uploadError && (
                    <Alert variant="destructive" className="bg-red-900/50 border-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label className="text-stone-300">Select File</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-dashed border-stone-600 text-stone-300 hover:bg-stone-800 h-20"
                    >
                      {newDocument.fileName ? (
                        <div className="flex items-center gap-2">
                          {getFileIcon(newDocument.mimeType)}
                          <span>{newDocument.fileName}</span>
                          <span className="text-xs text-stone-500">({formatFileSize(newDocument.fileSize)})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Plus className="w-5 h-5" />
                          <span>Click to select file</span>
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-stone-300">Title *</Label>
                    <Input
                      value={newDocument.title}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-stone-800 border-stone-600 text-white"
                      placeholder="Document title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-stone-300">Description</Label>
                    <Textarea
                      value={newDocument.description}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-stone-800 border-stone-600 text-white min-h-[80px]"
                      placeholder="Optional description..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-stone-300">Access Tier</Label>
                      <Select 
                        value={newDocument.accessTier} 
                        onValueChange={(v) => setNewDocument(prev => ({ ...prev, accessTier: v as AccessTier }))}
                      >
                        <SelectTrigger className="bg-stone-800 border-stone-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-800 border-stone-600">
                          <SelectItem value="TEASER">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-green-400" />
                              <span>Teaser</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="QUALIFIED">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-amber-400" />
                              <span>Qualified</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="TRANSACTION">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-red-400" />
                              <span>Transaction</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-stone-300">Category</Label>
                      <Select 
                        value={newDocument.category} 
                        onValueChange={(v) => setNewDocument(prev => ({ ...prev, category: v }))}
                      >
                        <SelectTrigger className="bg-stone-800 border-stone-600 text-white">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-800 border-stone-600">
                          <SelectItem value="Overview">Overview</SelectItem>
                          <SelectItem value="Financial">Financial</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              {!uploadSuccess && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUploadDialogOpen(false)} className="border-stone-600 text-stone-300">
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading} className="bg-amber-600 hover:bg-amber-700">
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Document'
                    )}
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Access Tier Notice for non-admins */}
      {!isAdmin && (
        <Alert className="bg-amber-900/20 border-amber-600/30">
          <Shield className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-200">
            You have <strong>{allowedTiers.join(', ')}</strong> access. 
            Documents at higher access tiers are not visible.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="bg-stone-900/50 border-stone-700">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-stone-800 border-stone-600 text-white placeholder:text-stone-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {availableTierFilters.map((tier) => (
                <Button
                  key={tier}
                  variant={tierFilter === tier ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTierFilter(tier)}
                  className={tierFilter === tier 
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'border-stone-600 text-stone-300 hover:bg-stone-800'
                  }
                >
                  {tier === 'all' ? 'All' : tier.charAt(0) + tier.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="bg-stone-900/50 border-stone-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Documents
          </CardTitle>
          <CardDescription className="text-stone-400">
            {filteredDocuments.length} document(s) {isAdmin ? 'total' : 'available to you'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-stone-600 mb-4" />
              <p className="text-stone-400">No documents found</p>
              {isAdmin && (
                <p className="text-stone-500 text-sm mt-2">Click "Upload Document" to add files</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-stone-700 hover:bg-stone-800/50">
                  <TableHead className="text-stone-400">File</TableHead>
                  <TableHead className="text-stone-400">Category</TableHead>
                  <TableHead className="text-stone-400">Access Tier</TableHead>
                  <TableHead className="text-stone-400">Size</TableHead>
                  <TableHead className="text-stone-400">Date</TableHead>
                  <TableHead className="text-stone-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="border-stone-700 hover:bg-stone-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.mimeType)}
                        <div>
                          <p className="font-medium text-white">{doc.title}</p>
                          <p className="text-xs text-stone-500">{doc.fileName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-stone-300">
                      {doc.category || 'Uncategorized'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTierBadgeColor(doc.accessTier)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {doc.accessTier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-stone-300">
                      {formatFileSize(doc.fileSize)}
                    </TableCell>
                    <TableCell className="text-stone-300">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-stone-800 border-stone-700">
                          <DropdownMenuItem 
                            onClick={() => handleView(doc)}
                            className="text-stone-300 hover:bg-stone-700 hover:text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDownload(doc)}
                            className="text-stone-300 hover:bg-stone-700 hover:text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem 
                              onClick={() => handleDelete(doc)}
                              className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
