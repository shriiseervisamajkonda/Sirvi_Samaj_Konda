import express from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createContact);
router.get('/', optionalAuth, getContacts);
router.get('/:id', optionalAuth, getContactById);

router.use(protect);
router.put('/:id', authorize('developer', 'super_admin', 'admin'), updateContact);
router.delete('/:id', authorize('developer', 'super_admin', 'admin'), deleteContact);

export default router;
