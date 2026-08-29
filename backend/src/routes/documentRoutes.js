import express from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/documentController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getDocuments);
router.get('/:id', optionalAuth, getDocumentById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'documents:write'), createDocument);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'documents:write'), updateDocument);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'documents:write'), deleteDocument);

export default router;
