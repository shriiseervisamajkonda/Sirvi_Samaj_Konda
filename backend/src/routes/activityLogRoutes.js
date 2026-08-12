import express from 'express';
import Model from '../models/ActivityLog.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';
import { paginateResponse } from '../utils/helpers.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin', 'admin'));

router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.module) filter.module = req.query.module;

  const [data, total] = await Promise.all([
    Model.find(filter).populate('user', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Model.countDocuments(filter),
  ]);

  res.json(paginateResponse(data, total, page, limit));
}));

export default router;
