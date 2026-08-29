import express from 'express';
import { getDashboardStats, getPublicStats } from '../controllers/dashboardController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', optionalAuth, getPublicStats);
router.get('/', protect, authorize('developer', 'super_admin', 'admin', 'editor', 'treasurer'), getDashboardStats);

export default router;
