import api from './api'

export const documentService = {
  uploadDocument: async (file, documentType, visibility = null) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', documentType)
    if (visibility && Array.isArray(visibility) && visibility.length > 0) {
      formData.append('visibility', JSON.stringify(visibility))
    }
    
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getMyDocuments: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    
    const response = await api.get(`/documents/my-documents?${params.toString()}`)
    return response.data
  },

  getDocument: async (documentId) => {
    const response = await api.get(`/documents/${documentId}`)
    return response.data
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`)
    return response.data
  },
}

