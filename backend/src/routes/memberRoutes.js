import express from 'express';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getMembers);
router.get('/:id', optionalAuth, getMemberById);

// Admin & Staff operations
router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'members:write'), createMember);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'members:write'), updateMember);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'members:write'), deleteMember);

export default router;
