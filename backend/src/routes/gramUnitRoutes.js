import express from 'express';
import GramUnit from '../models/GramUnit.js';
import { createCRUDController } from '../controllers/baseController.js';
import { getPublicGramUnitDetails } from '../controllers/gramUnitController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const ctrl = createCRUDController(GramUnit, 'GramUnit', {
  searchFields: ['unitName', 'village', 'tehsil', 'district'],
});

// Public endpoints
router.get('/public/details', getPublicGramUnitDetails);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Protected Admin endpoints
router.use(protect);
router.post('/', authorize('super_admin', 'admin'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin'), ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
