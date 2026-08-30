import express from 'express';
import {
  getLekhaJokha,
  getLekhaJokhaById,
  getLekhaJokhaStats,
  createLekhaJokha,
  updateLekhaJokha,
  deleteLekhaJokha,
} from '../controllers/lekhaJokhaController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', optionalAuth, getLekhaJokhaStats);
router.get('/', optionalAuth, getLekhaJokha);
router.get('/:id', optionalAuth, getLekhaJokhaById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'treasurer', 'lekha_jokha:write'), createLekhaJokha);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'treasurer', 'lekha_jokha:write'), updateLekhaJokha);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'lekha_jokha:write'), deleteLekhaJokha);

export default router;
