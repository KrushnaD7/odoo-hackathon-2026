import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { documentService } from '../../services/documentService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { useToast } from '../../components/ui/use-toast'
import { Upload, FileText, Download, Trash2, X, Grid, List } from 'lucide-react'
import { formatDate } from '../../utils/formatters'
import api from '../../services/api'
import { Checkbox } from '../../components/ui/checkbox'

export default function Documents() {
  const { user, isAdmin } = useAuth()
  const isHR = user?.role === 'hr'
  const isAdminRole = user?.role === 'admin'
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [uploadDialog, setUploadDialog] = useState({ 
    open: false, 
    file: null, 
    documentType: '',
    visibility: [] // Array of roles: 'employee', 'admin', 'hr'
  })
  const [viewMode, setViewMode] = useState('grid')

  // Get documents
  const { data: documentsData, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await documentService.getMyDocuments()
      // Response structure: { success: true, data: [...], pagination: {...} }
      console.log('Documents query response:', response)
      return response
    },
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, documentType, visibility }) => documentService.uploadDocument(file, documentType, visibility),
    onSuccess: (response) => {
      console.log('Upload success response:', response)
      // Invalidate and refetch documents
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setUploadDialog({ open: false, file: null, documentType: '', visibility: [] })
      toast({
        title: 'Document uploaded',
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error?.message || 'Failed to upload document',
        variant: 'destructive',
      })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: documentService.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'])
      toast({
        title: 'Document deleted',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.error?.message || 'Failed to delete document',
        variant: 'destructive',
      })
    },
  })

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'File size must be less than 10MB',
          variant: 'destructive',
        })
        return
      }
      setUploadDialog({ 
        open: true, 
        file, 
        documentType: '',
        visibility: [] // Reset visibility when opening dialog
      })
    }
  }

  const handleUpload = () => {
    if (!uploadDialog.documentType) {
      toast({
        title: 'Document type required',
        description: 'Please specify the document type',
        variant: 'destructive',
      })
      return
    }
    uploadMutation.mutate({
      file: uploadDialog.file,
      documentType: uploadDialog.documentType,
      visibility: uploadDialog.visibility,
    })
  }

  const toggleVisibility = (role) => {
    const currentVisibility = uploadDialog.visibility || []
    if (currentVisibility.includes(role)) {
      setUploadDialog({
        ...uploadDialog,
        visibility: currentVisibility.filter(r => r !== role)
      })
    } else {
      setUploadDialog({
        ...uploadDialog,
        visibility: [...currentVisibility, role]
      })
    }
  }

  const handleDownload = async (document) => {
    try {
      const response = await api.get(`/documents/${document.id}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', document.file_name)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download document',
        variant: 'destructive',
      })
    }
  }

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return <FileText className="text-primary-600" size={24} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">Manage your documents</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2" size={20} />
            Upload Document
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />

      {/* Documents List */}
      {isLoading ? (
        <div className="text-center py-12 text-foreground">Loading...</div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">Error loading documents: {error.message}</p>
          </CardContent>
        </Card>
      ) : documentsData?.data?.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentsData.data.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                      {getFileIcon(doc.file_name)}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {doc.document_type}
                    </Badge>
                  </div>
                  <h3 className="font-medium mb-2 truncate text-foreground">{doc.file_name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Uploaded {formatDate(doc.uploaded_at)}
                  </p>
                  {(doc.first_name || doc.last_name) && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Uploaded by: {doc.first_name} {doc.last_name}
                      {doc.uploader_role && (
                        <span className="ml-1 capitalize">({doc.uploader_role})</span>
                      )}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc)}
                      className="flex-1"
                    >
                      <Download className="mr-1" size={14} />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this document?')) {
                          deleteMutation.mutate(doc.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {documentsData.data.map((doc) => (
                  <div key={doc.id} className="p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          {getFileIcon(doc.file_name)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{doc.file_name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="capitalize text-xs">
                              {doc.document_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(doc.uploaded_at)}
                            </span>
                          </div>
                          {(doc.first_name || doc.last_name) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded by: {doc.first_name} {doc.last_name}
                              {doc.uploader_role && (
                                <span className="ml-1 capitalize">({doc.uploader_role})</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="mr-1" size={14} />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this document?')) {
                              deleteMutation.mutate(doc.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No documents uploaded yet</p>
            <Button
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2" size={20} />
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      {uploadDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upload Document</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadDialog({ open: false, file: null, documentType: '' })}
                >
                  <X size={20} />
                </Button>
              </div>
              <CardDescription>{uploadDialog.file?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Input
                  placeholder="e.g., Resume, Certificate, ID"
                  value={uploadDialog.documentType}
                  onChange={(e) => setUploadDialog({ ...uploadDialog, documentType: e.target.value })}
                />
              </div>
              
              {/* Visibility options for HR and Admin */}
              {(isHR || isAdminRole) && (
                <div className="space-y-2">
                  <Label>Visibility (Optional)</Label>
                  <div className="space-y-2 p-3 border border-border rounded-lg bg-card">
                    <p className="text-sm text-muted-foreground mb-2">
                      {isHR ? 'This document will be visible to Admin by default. You can also make it visible to:' : 
                       'This document will be visible to HR by default. You can also make it visible to:'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="visibility-employee"
                        checked={uploadDialog.visibility?.includes('employee') || false}
                        onCheckedChange={() => toggleVisibility('employee')}
                      />
                      <Label
                        htmlFor="visibility-employee"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Employees
                      </Label>
                    </div>
                    {isHR && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="visibility-hr"
                          checked={uploadDialog.visibility?.includes('hr') || false}
                          onCheckedChange={() => toggleVisibility('hr')}
                        />
                        <Label
                          htmlFor="visibility-hr"
                          className="text-sm font-normal cursor-pointer"
                        >
                          HR (other HR members)
                        </Label>
                      </div>
                    )}
                    {isAdminRole && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="visibility-admin"
                          checked={uploadDialog.visibility?.includes('admin') || false}
                          onCheckedChange={() => toggleVisibility('admin')}
                        />
                        <Label
                          htmlFor="visibility-admin"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Admin (other admins)
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setUploadDialog({ open: false, file: null, documentType: '', visibility: [] })}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending || !uploadDialog.documentType}
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

