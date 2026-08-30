import express from 'express';
import {
  getPanchSettlements,
  getPanchSettlementById,
  createPanchSettlement,
  updatePanchSettlement,
  deletePanchSettlement,
} from '../controllers/panchSettlementController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', optionalAuth, getPanchSettlements);
router.get('/', optionalAuth, getPanchSettlements);
router.get('/:id', optionalAuth, getPanchSettlementById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'panch_settlements:write'), createPanchSettlement);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'panch_settlements:write'), updatePanchSettlement);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'panch_settlements:write'), deletePanchSettlement);

export default router;
