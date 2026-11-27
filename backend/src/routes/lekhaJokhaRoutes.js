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
router.use(authorize('developer', 'super_admin', 'admin', 'treasurer', 'can_view_lekha_jokha', 'lekha_jokha:read'));

router.get('/stats', getLekhaJokhaStats);
router.get('/public', getLekhaJokha);
router.get('/', getLekhaJokha);
router.get('/:id', getLekhaJokhaById);

router.post('/', authorize('developer', 'super_admin', 'admin', 'treasurer', 'lekha_jokha:write'), createLekhaJokha);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'treasurer', 'lekha_jokha:write'), updateLekhaJokha);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'lekha_jokha:write'), deleteLekhaJokha);

export default router;
