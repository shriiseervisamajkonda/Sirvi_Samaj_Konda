import express from 'express';
import {
  getCommittees,
  getCommitteeById,
  createCommittee,
  updateCommittee,
  deleteCommittee,
} from '../controllers/committeeController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getCommittees);
router.get('/:id', optionalAuth, getCommitteeById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'editor', 'treasurer', 'committees:write'), createCommittee);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'editor', 'treasurer', 'committees:write'), updateCommittee);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'editor', 'treasurer', 'committees:write'), deleteCommittee);

export default router;
