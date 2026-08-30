import express from 'express';
import {
  getGramUnitPublicDetails,
  getGramUnits,
  updateGramUnit,
  getGramUnitMembers,
  createGramUnitMember,
  updateGramUnitMember,
  deleteGramUnitMember,
} from '../controllers/gramUnitController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public/details', optionalAuth, getGramUnitPublicDetails);
router.get('/', optionalAuth, getGramUnits);
router.get('/members', optionalAuth, getGramUnitMembers);

// Protected routes
router.use(protect);
router.put('/:id', authorize('developer', 'super_admin', 'admin'), updateGramUnit);
router.post('/members', authorize('developer', 'super_admin', 'admin'), createGramUnitMember);
router.put('/members/:id', authorize('developer', 'super_admin', 'admin'), updateGramUnitMember);
router.delete('/members/:id', authorize('developer', 'super_admin', 'admin'), deleteGramUnitMember);

export default router;
