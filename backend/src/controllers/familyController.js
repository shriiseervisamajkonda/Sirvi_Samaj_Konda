import Family from '../models/Family.js';
import FamilyMember from '../models/FamilyMember.js';
import { asyncHandler } from '../middleware/validate.js';
import { createCRUDController } from './baseController.js';
import { generateFamilyQR, generateFamilyId } from '../utils/qrCode.js';
import { logActivity, paginateResponse, escapeRegex } from '../utils/helpers.js';

const base = createCRUDController(Family, 'Family', {
  populate: [{ path: 'familyTree', select: 'firstName lastName photo gender age' }],
  searchFields: ['headOfFamily', 'surname', 'familyId', 'village'],
  publicFilter: { status: 'active' },
  beforeCreate: async (data) => {
    if (!data.familyId) {
      data.familyId = await generateFamilyId(data.surname);
    }
    return data;
  },
  afterCreate: async (family) => {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    family.qrCode = await generateFamilyQR(family.familyId, baseUrl);
    await family.save();
  },
});

export const getFamilies = asyncHandler(async (req, res) => {
  const isAdmin = req.user && ['super_admin', 'admin', 'editor'].includes(req.user.role);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const filter = isAdmin ? {} : { status: 'active' };

  if (req.query.search) {
    const escapedSearch = escapeRegex(req.query.search);
    filter.$or = [
      { headOfFamily: { $regex: escapedSearch, $options: 'i' } },
      { surname: { $regex: escapedSearch, $options: 'i' } },
      { familyId: { $regex: escapedSearch, $options: 'i' } },
    ];
  }
  if (req.query.surname) filter.surname = req.query.surname;
  if (req.query.village) filter.village = req.query.village;

  const [data, total] = await Promise.all([
    Family.find(filter)
      .populate('familyTree', 'firstName lastName photo gender age')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Family.countDocuments(filter),
  ]);

  res.json(paginateResponse(data, total, page, limit));
});

export const getFamily = base.getOne;

export const getFamilyByFamilyId = asyncHandler(async (req, res) => {
  const family = await Family.findOne({ familyId: req.params.familyId })
    .populate('familyTree');
  if (!family) {
    return res.status(404).json({ success: false, message: 'Family not found' });
  }
  res.json({ success: true, data: family });
});

export const createFamily = asyncHandler(async (req, res) => {
  const data = { ...req.body, createdBy: req.user._id };
  if (!data.familyId) {
    data.familyId = await generateFamilyId(data.surname);
  }
  const family = await Family.create(data);
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  family.qrCode = await generateFamilyQR(family.familyId, baseUrl);
  await family.save();
  await logActivity(req.user._id, 'create', 'families', family._id, {}, req);
  res.status(201).json({ success: true, data: family });
});

export const updateFamily = asyncHandler(async (req, res) => {
  const family = await Family.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!family) {
    return res.status(404).json({ success: false, message: 'Family not found' });
  }
  await logActivity(req.user._id, 'update', 'families', family._id, {}, req);
  res.json({ success: true, data: family });
});

export const deleteFamily = base.remove;

export const getFamilyStats = asyncHandler(async (_req, res) => {
  const [total, bySurname] = await Promise.all([
    Family.countDocuments({ status: 'active' }),
    Family.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$surname', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);
  res.json({ success: true, data: { total, bySurname } });
});

export const syncFamilyMemberCount = asyncHandler(async (req, res) => {
  const family = await Family.findById(req.params.id);
  if (!family) {
    return res.status(404).json({ success: false, message: 'Family not found' });
  }
  const count = await FamilyMember.countDocuments({ family: family._id, status: 'active' });
  family.numberOfMembers = count;
  await family.save();
  res.json({ success: true, data: family });
});
