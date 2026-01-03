const Document = require('../models/Document');
const fs = require('fs').promises;
const path = require('path');

const documentService = {
  /**
   * Upload document
   */
  async uploadDocument(userId, file, documentType, visibility, userRole) {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${userId}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Set default visibility based on role
    let defaultVisibility = ['hr', 'admin']; // Default for employees
    if (userRole === 'hr') {
      defaultVisibility = ['admin']; // HR docs visible to admin by default
      if (visibility && visibility.includes('employee')) {
        defaultVisibility.push('employee');
      }
    } else if (userRole === 'admin') {
      defaultVisibility = ['hr']; // Admin docs visible to HR by default
      if (visibility && visibility.includes('employee')) {
        defaultVisibility.push('employee');
      }
    }

    // Use provided visibility or default
    const finalVisibility = visibility && Array.isArray(visibility) ? visibility : defaultVisibility;

    // Create document record
    const document = await Document.create({
      user_id: userId,
      document_type: documentType,
      file_path: `/uploads/${fileName}`,
      file_name: file.originalname,
      visibility: JSON.stringify(finalVisibility)
    });

    return document;
  },

  /**
   * Get user's documents (all documents they uploaded)
   */
  async getUserDocuments(userId, page = 1, limit = 20) {
    const result = await Document.findByUserId(userId, page, limit);
    return result;
  },

  /**
   * Get documents visible to user based on role
   */
  async getVisibleDocuments(userId, userRole, page = 1, limit = 20) {
    const result = await Document.findVisibleDocuments(userId, userRole, page, limit);
    return result;
  },

  /**
   * Get document by ID
   */
  async getDocumentById(documentId, userId, userRole) {
    const document = await Document.findById(documentId);
    
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      error.code = 'DOCUMENT_NOT_FOUND';
      throw error;
    }

    // Employees can only view their own documents
    // Admin/HR can view any document
    if (userRole === 'employee' && document.user_id !== userId) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    return document;
  },

  /**
   * Delete document
   */
  async deleteDocument(documentId, userId, userRole) {
    const document = await Document.findById(documentId);
    
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      error.code = 'DOCUMENT_NOT_FOUND';
      throw error;
    }

    // Employees can only delete their own documents
    // Admin/HR can delete any document
    if (userRole === 'employee' && document.user_id !== userId) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../', document.file_path);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete database record
    await Document.delete(documentId, document.user_id);
    
    return { message: 'Document deleted successfully' };
  }
};

module.exports = documentService;

