import express from 'express';
import { getVillageInfo, updateVillageInfo } from '../controllers/villageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getVillageInfo);
router.get('/:id', getVillageInfo);
router.post('/', protect, authorize('developer', 'super_admin', 'admin'), updateVillageInfo);
router.put('/', protect, authorize('developer', 'super_admin', 'admin'), updateVillageInfo);
router.put('/:id', protect, authorize('developer', 'super_admin', 'admin'), updateVillageInfo);

export default router;
