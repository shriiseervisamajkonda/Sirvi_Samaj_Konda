import express from 'express';
import User from '../models/User.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = express.Router();
const { getAll, getOne, update, remove } = createCRUDController(User, 'User', {
  searchFields: ['name', 'email'],
});

router.use(protect);
router.use(authorize('super_admin', 'admin'));

router.get('/', getAll);
router.get('/:id', getOne);

router.put('/:id', update);

router.put('/:id/role', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  );
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
}));

router.delete('/:id', remove);

export default router;
