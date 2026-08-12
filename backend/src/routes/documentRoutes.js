import express from 'express';
import Model from '../models/Document.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = express.Router();
const ctrl = createCRUDController(Model, 'Document', {
  searchFields: ['title', 'description'],
});

router.get('/', optionalAuth, ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.get('/:id/download', optionalAuth, asyncHandler(async (req, res) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, data: doc });
}));

router.use(protect);
router.post('/', authorize('super_admin', 'admin', 'editor'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin', 'editor'), ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
