import express from 'express';
import Model from '../models/News.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = express.Router();
const ctrl = createCRUDController(Model, 'News', {
  searchFields: ['title', 'content'],
});

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  if (!req.user || !['super_admin', 'admin', 'editor'].includes(req.user.role)) {
    req.query.status = 'published';
  }
  return ctrl.getAll(req, res);
}));

router.get('/:id', ctrl.getOne);
router.use(protect);
router.post('/', authorize('super_admin', 'admin', 'editor'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin', 'editor'), ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
