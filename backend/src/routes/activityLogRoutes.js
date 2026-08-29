import express from 'express';
import { getActivityLogs, getActivityLogById } from '../controllers/activityLogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('developer', 'super_admin', 'admin'), getActivityLogs);
router.get('/:id', authorize('developer', 'super_admin', 'admin'), getActivityLogById);

export default router;
