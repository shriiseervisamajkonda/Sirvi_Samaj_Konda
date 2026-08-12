import express from 'express';
import Model from '../models/BloodDonor.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const ctrl = createCRUDController(Model, 'BloodDonor', {
  populate: [{ path: 'member', select: 'firstName lastName photo' }],
  searchFields: ['name', 'bloodGroup', 'village'],
  publicFilter: { status: 'active' },
});

router.get('/', optionalAuth, ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.use(protect);
router.post('/', authorize('super_admin', 'admin', 'editor', 'member'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin', 'editor'), ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
