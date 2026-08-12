import express from 'express';
import Model from '../models/Event.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = express.Router();
const ctrl = createCRUDController(Model, 'Event', {
  searchFields: ['title', 'location'],
});

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  if (!req.user || !['super_admin', 'admin', 'editor'].includes(req.user.role)) {
    req.query.status = 'published';
  }
  return ctrl.getAll(req, res);
}));

router.get('/:id', ctrl.getOne);

router.post('/:id/register', optionalAuth, asyncHandler(async (req, res) => {
  const event = await Model.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  if (!event.registrationRequired) {
    return res.status(400).json({ success: false, message: 'Registration not required' });
  }
  event.registrations.push(req.body);
  await event.save();
  res.json({ success: true, message: 'Registered successfully', data: event });
}));

router.use(protect);
router.post('/', authorize('super_admin', 'admin', 'editor'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin', 'editor'), ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
