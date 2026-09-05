import express from 'express';
import {
  getMarriageProfiles,
  getMarriageProfileById,
  createMarriageProfile,
  updateMarriageProfile,
  approveMarriageProfile,
  deleteMarriageProfile,
} from '../controllers/marriageController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getMarriageProfiles);
router.get('/:id', optionalAuth, getMarriageProfileById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'editor', 'member'), createMarriageProfile);
router.put('/:id/approve', authorize('developer', 'super_admin', 'admin'), approveMarriageProfile);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'editor', 'member'), updateMarriageProfile);
router.delete('/:id', authorize('developer', 'super_admin', 'admin'), deleteMarriageProfile);

export default router;
