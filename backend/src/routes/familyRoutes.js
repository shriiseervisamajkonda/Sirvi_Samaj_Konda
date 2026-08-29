import express from 'express';
import {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
} from '../controllers/familyController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getFamilies);
router.get('/:id', optionalAuth, getFamilyById);

// Admin & Staff operations
router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'families:write'), createFamily);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'families:write'), updateFamily);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'families:write'), deleteFamily);

export default router;
