import express from 'express';
import {
  getSocialInfo,
  getSocialInfoById,
  createSocialInfo,
  updateSocialInfo,
  deleteSocialInfo,
} from '../controllers/socialInfoController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getSocialInfo);
router.get('/:id', optionalAuth, getSocialInfoById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin'), createSocialInfo);
router.put('/:id', authorize('developer', 'super_admin', 'admin'), updateSocialInfo);
router.delete('/:id', authorize('developer', 'super_admin', 'admin'), deleteSocialInfo);

export default router;
