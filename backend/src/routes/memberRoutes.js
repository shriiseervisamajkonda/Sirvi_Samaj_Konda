import express from 'express';
import FamilyMember from '../models/FamilyMember.js';
import Family from '../models/Family.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';
import { paginateResponse, escapeRegex } from '../utils/helpers.js';

const router = express.Router();

const { getOne, create, update, remove } = createCRUDController(FamilyMember, 'Member', {
  populate: [{ path: 'family', select: 'familyId headOfFamily surname' }],
  searchFields: ['firstName', 'lastName', 'occupation', 'education'],
});

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const filter = req.user && ['super_admin', 'admin', 'editor'].includes(req.user.role)
    ? {}
    : { status: 'active' };

  if (req.query.search) {
    const escapedSearch = escapeRegex(req.query.search);
    filter.$or = [
      { firstName: { $regex: escapedSearch, $options: 'i' } },
      { lastName: { $regex: escapedSearch, $options: 'i' } },
      { occupation: { $regex: escapedSearch, $options: 'i' } },
    ];
  }
  if (req.query.gender) filter.gender = req.query.gender;
  if (req.query.education) filter.education = { $regex: escapeRegex(req.query.education), $options: 'i' };
  if (req.query.occupation) filter.occupation = { $regex: escapeRegex(req.query.occupation), $options: 'i' };
  if (req.query.village) filter.village = req.query.village;
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;

  const [data, total] = await Promise.all([
    FamilyMember.find(filter)
      .populate('family', 'familyId headOfFamily surname')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    FamilyMember.countDocuments(filter),
  ]);

  res.json(paginateResponse(data, total, page, limit));
}));

router.get('/:id', getOne);

router.use(protect);
router.post('/', authorize('super_admin', 'admin', 'editor'), asyncHandler(async (req, res, next) => {
  await create(req, res, next);
  if (req.body.family) {
    const count = await FamilyMember.countDocuments({ family: req.body.family, status: 'active' });
    await Family.findByIdAndUpdate(req.body.family, { numberOfMembers: count });
  }
}));
router.put('/:id', authorize('super_admin', 'admin', 'editor'), update);
router.delete('/:id', authorize('super_admin', 'admin'), remove);

export default router;
