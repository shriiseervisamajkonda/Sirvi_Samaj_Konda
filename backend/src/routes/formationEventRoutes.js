import express from 'express';
import FormationEvent from '../models/FormationEvent.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const ctrl = createCRUDController(FormationEvent, 'FormationEvent', {
  searchFields: ['title', 'supervisor', 'location'],
});

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.use(protect);
router.post('/', authorize('super_admin', 'admin'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin'), ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
