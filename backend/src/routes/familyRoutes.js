import express from 'express';
import {
  getFamilies, getFamily, getFamilyByFamilyId,
  createFamily, updateFamily, deleteFamily,
  getFamilyStats, syncFamilyMemberCount,
} from '../controllers/familyController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', getFamilyStats);
router.get('/family-id/:familyId', getFamilyByFamilyId);
router.get('/', optionalAuth, getFamilies);
router.get('/:id', getFamily);

router.use(protect);
router.post('/', authorize('super_admin', 'admin', 'editor'), createFamily);
router.put('/:id', authorize('super_admin', 'admin', 'editor'), updateFamily);
router.put('/:id/sync-members', authorize('super_admin', 'admin', 'editor'), syncFamilyMemberCount);
router.delete('/:id', authorize('super_admin', 'admin'), deleteFamily);

export default router;
