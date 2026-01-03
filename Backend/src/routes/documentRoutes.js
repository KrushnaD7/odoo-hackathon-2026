const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/documentController');
const authenticate = require('../middleware/auth');
const { documentValidator } = require('../utils/validators');

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// All routes require authentication
router.use(authenticate);

router.post('/', upload.single('file'), documentValidator, documentController.uploadDocument);
router.get('/my-documents', documentController.getMyDocuments);
router.get('/:id', documentController.getDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;

