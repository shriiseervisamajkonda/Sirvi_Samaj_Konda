import express from 'express';
import {
  getBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from '../controllers/businessController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getBusinesses);
router.get('/:id', optionalAuth, getBusinessById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin'), createBusiness);
router.put('/:id', authorize('developer', 'super_admin', 'admin'), updateBusiness);
router.delete('/:id', authorize('developer', 'super_admin', 'admin'), deleteBusiness);

export default router;
