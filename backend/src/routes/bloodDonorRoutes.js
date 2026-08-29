import express from 'express';
import {
  getBloodDonors,
  getBloodDonorById,
  createBloodDonor,
  updateBloodDonor,
  deleteBloodDonor,
} from '../controllers/bloodDonorController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getBloodDonors);
router.get('/:id', optionalAuth, getBloodDonorById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'blood_donors:write'), createBloodDonor);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'blood_donors:write'), updateBloodDonor);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'blood_donors:write'), deleteBloodDonor);

export default router;
