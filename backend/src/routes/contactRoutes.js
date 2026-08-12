import express from 'express';
import Model from '../models/Contact.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const ctrl = createCRUDController(Model, 'Contact');

router.post('/', ctrl.create);
router.use(protect);
router.get('/', authorize('super_admin', 'admin', 'editor'), ctrl.getAll);
router.get('/:id', authorize('super_admin', 'admin', 'editor'), ctrl.getOne);
router.put('/:id', authorize('super_admin', 'admin', 'editor'), ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
