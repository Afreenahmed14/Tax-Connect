
const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const documentController = require('../controllers/document.controller');
const upload = require('../middleware/upload.middleware');

router.use(auth);

// List and upload documents
router.get('/', documentController.getDocuments);
router.get('/:id/download', documentController.downloadDocument);
router.post(
  '/upload',
  upload.single('file'),
  documentController.uploadDocumentFile
);

// Document CRUD
router.get('/:id', documentController.getDocumentById);
router.post('/', documentController.createDocument);
router.patch('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
