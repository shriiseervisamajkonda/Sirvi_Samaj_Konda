import express from 'express';
import Model from '../models/VillageInformation.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = express.Router();
const ctrl = createCRUDController(Model, 'VillageInformation');

router.get('/', asyncHandler(async (_req, res) => {
  const villages = await Model.find({ isActive: true });
  res.json({ success: true, data: villages });
}));

router.get('/:id', ctrl.getOne);

router.get('/village/:name', asyncHandler(async (req, res) => {
  const village = await Model.findOne({ village: req.params.name, isActive: true });
  if (!village) return res.status(404).json({ success: false, message: 'Village not found' });
  res.json({ success: true, data: village });
}));

router.use(protect);
router.post('/', authorize('super_admin', 'admin'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin'), ctrl.update);
router.delete('/:id', authorize('super_admin'), ctrl.remove);

export default router;
