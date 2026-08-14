import express from 'express';
import GramUnitMember from '../models/GramUnitMember.js';
import { asyncHandler } from '../middleware/validate.js';
import { paginateResponse } from '../utils/helpers.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/gram-unit-members with rich filtering
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.gramUnit) filter.gramUnit = req.query.gramUnit;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.representativeLevel && req.query.representativeLevel !== 'all') {
      filter.representativeLevel = req.query.representativeLevel;
    }
    if (req.query.designation) filter.designation = req.query.designation;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { designation: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      GramUnitMember.find(filter).sort({ order: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
      GramUnitMember.countDocuments(filter),
    ]);

    res.json(paginateResponse(data, total, page, limit));
  })
);

// GET /api/gram-unit-members/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const member = await GramUnitMember.findById(req.params.id).lean();
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, data: member });
  })
);

// Protected Admin routes
router.use(protect);

// POST /api/gram-unit-members
router.post(
  '/',
  authorize('super_admin', 'admin'),
  asyncHandler(async (req, res) => {
    const item = await GramUnitMember.create(req.body);
    res.status(201).json({ success: true, data: item });
  })
);

// PUT /api/gram-unit-members/:id
router.put(
  '/:id',
  authorize('super_admin', 'admin'),
  asyncHandler(async (req, res) => {
    const item = await GramUnitMember.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    Object.assign(item, req.body);
    await item.save();
    res.json({ success: true, data: item });
  })
);

// DELETE /api/gram-unit-members/:id
router.delete(
  '/:id',
  authorize('super_admin', 'admin'),
  asyncHandler(async (req, res) => {
    const item = await GramUnitMember.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    await item.deleteOne();
    res.json({ success: true, message: 'Member deleted successfully' });
  })
);

export default router;
