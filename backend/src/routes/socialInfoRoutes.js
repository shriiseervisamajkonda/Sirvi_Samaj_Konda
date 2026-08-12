import express from 'express';
import Model from '../models/SocialInfo.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const ctrl = createCRUDController(Model, 'SocialInfo', {
  searchFields: ['title', 'content'],
  publicFilter: { isActive: true },
});

// Public read-only access (restricted to active records)
router.get('/public', optionalAuth, ctrl.getAll);

// Protected admin access
router.get('/', protect, authorize('super_admin', 'admin', 'editor'), ctrl.getAll);
router.get('/:id', protect, authorize('super_admin', 'admin', 'editor'), ctrl.getOne);
router.post('/', protect, authorize('super_admin', 'admin', 'editor'), ctrl.create);
router.put('/:id', protect, authorize('super_admin', 'admin'), ctrl.update);
router.delete('/:id', protect, authorize('super_admin', 'admin'), ctrl.remove);

export default router;
