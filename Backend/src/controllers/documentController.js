const documentService = require('../services/documentService');

const documentController = {
  /**
   * Upload document
   */
  async uploadDocument(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No file uploaded',
            code: 'NO_FILE'
          }
        });
      }

      const { document_type, visibility } = req.body;
      let visibilityArray = null;
      
      // Parse visibility if provided
      if (visibility) {
        try {
          visibilityArray = Array.isArray(visibility) ? visibility : JSON.parse(visibility);
        } catch (e) {
          visibilityArray = null;
        }
      }

      const document = await documentService.uploadDocument(
        userId,
        file,
        document_type,
        visibilityArray,
        userRole
      );

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get my documents (visible documents based on role)
   */
  async getMyDocuments(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;

      // Get documents visible to this user based on their role
      const result = await documentService.getVisibleDocuments(userId, userRole, page, limit);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get document by ID
   */
  async getDocument(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const document = await documentService.getDocumentById(
        id,
        userId,
        userRole
      );

      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete document
   */
  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      await documentService.deleteDocument(id, userId, userRole);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = documentController;

