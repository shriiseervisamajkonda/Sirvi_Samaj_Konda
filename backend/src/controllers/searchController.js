import Family from '../models/Family.js';
import FamilyMember from '../models/FamilyMember.js';
import Business from '../models/Business.js';
import BloodDonor from '../models/BloodDonor.js';
import News from '../models/News.js';
import Event from '../models/Event.js';
import { asyncHandler } from '../middleware/validate.js';
import { escapeRegex } from '../utils/helpers.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const q = req.query.q;
  if (!q || q.length < 2) {
    return res.json({ success: true, data: { families: [], members: [], businesses: [], news: [], events: [] } });
  }

  const escapedQ = escapeRegex(q);
  const regex = { $regex: escapedQ, $options: 'i' };
  const limit = 5;

  const [families, members, businesses, news, events] = await Promise.all([
    Family.find({ status: 'active', $or: [{ headOfFamily: regex }, { surname: regex }, { familyId: regex }] }).limit(limit),
    FamilyMember.find({ status: 'active', $or: [{ firstName: regex }, { lastName: regex }, { occupation: regex }] }).limit(limit),
    Business.find({ status: 'active', $or: [{ businessName: regex }, { owner: regex }, { category: regex }] }).limit(limit),
    News.find({ status: 'published', $or: [{ title: regex }, { content: regex }] }).limit(limit),
    Event.find({ status: 'published', title: regex }).limit(limit),
  ]);

  res.json({ success: true, data: { families, members, businesses, news, events } });
});

export const searchBloodDonors = asyncHandler(async (req, res) => {
  const filter = { status: 'active' };
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
  if (req.query.village) filter.village = req.query.village;
  if (req.query.availability) filter.availability = req.query.availability;

  const donors = await BloodDonor.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: donors });
});
