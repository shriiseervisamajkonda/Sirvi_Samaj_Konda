import express from 'express';
import Model from '../models/Settings.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  let settings = await Model.findOne();
  if (!settings) {
    settings = await Model.create({});
  }
  res.json({ success: true, data: settings });
}));

router.use(protect);
router.put('/', authorize('super_admin', 'admin'), asyncHandler(async (req, res) => {
  let settings = await Model.findOne();
  if (!settings) {
    settings = await Model.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }
  res.json({ success: true, data: settings });
}));

export default router;
