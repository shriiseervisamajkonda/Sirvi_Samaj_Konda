import express from 'express';
import Model from '../models/MarriageProfile.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = express.Router();
const ctrl = createCRUDController(Model, 'MarriageProfile', {
  searchFields: ['name', 'education', 'occupation'],
});

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const isAdmin = req.user && ['super_admin', 'admin', 'editor'].includes(req.user.role);
  const filter = isAdmin ? {} : { approvalStatus: 'approved', isPublic: true };
  req.query.status = undefined;
  req._marriageFilter = filter;
  return ctrl.getAll(req, res);
}));

router.get('/:id', ctrl.getOne);
router.use(protect);
router.post('/', authorize('super_admin', 'admin', 'editor', 'member'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin', 'editor', 'member'), ctrl.update);

router.put('/:id/approve', authorize('super_admin', 'admin'), asyncHandler(async (req, res) => {
  const profile = await Model.findByIdAndUpdate(
    req.params.id,
    {
      approvalStatus: req.body.status || 'approved',
      isPublic: req.body.status === 'approved',
      approvedBy: req.user._id,
      approvedAt: new Date(),
    },
    { new: true }
  );
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
  res.json({ success: true, data: profile });
}));

router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
