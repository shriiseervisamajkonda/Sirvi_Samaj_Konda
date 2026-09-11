import express from 'express';
import {
  getLekhaJokha,
  getLekhaJokhaById,
  getLekhaJokhaStats,
  createLekhaJokha,
  updateLekhaJokha,
  deleteLekhaJokha,
} from '../controllers/lekhaJokhaController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('developer', 'super_admin', 'admin', 'treasurer'));

router.get('/stats', getLekhaJokhaStats);
router.get('/public', getLekhaJokha);
router.get('/', getLekhaJokha);
router.get('/:id', getLekhaJokhaById);

router.post('/', createLekhaJokha);
router.put('/:id', updateLekhaJokha);
router.delete('/:id', deleteLekhaJokha);

export default router;
