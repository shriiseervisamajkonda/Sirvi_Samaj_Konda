import express from 'express';
import { getDashboardStats, getPublicStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';
import { memoryCacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

router.get('/public', memoryCacheMiddleware(60), getPublicStats);
router.get('/', protect, authorize('super_admin', 'admin', 'editor'), getDashboardStats);

export default router;
