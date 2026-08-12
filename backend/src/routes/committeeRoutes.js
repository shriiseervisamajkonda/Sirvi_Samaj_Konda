import express from 'express';
import Model from '../models/Committee.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const ctrl = createCRUDController(Model, 'Committee', {
  searchFields: ['name', 'designation'],
});

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.use(protect);
router.post('/', authorize('super_admin', 'admin'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin'), ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
