import Family from '../models/Family.js';
import FamilyMember from '../models/FamilyMember.js';
import Student from '../models/Student.js';
import Business from '../models/Business.js';
import BloodDonor from '../models/BloodDonor.js';
import Event from '../models/Event.js';
import News from '../models/News.js';
import Donation from '../models/Donation.js';
import ActivityLog from '../models/ActivityLog.js';
import { asyncHandler } from '../middleware/validate.js';

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    totalFamilies,
    totalMembers,
    maleCount,
    femaleCount,
    studentCount,
    businessCount,
    bloodDonorCount,
    eventCount,
    newsCount,
    donationStats,
    recentActivities,
  ] = await Promise.all([
    Family.countDocuments({ status: 'active' }),
    FamilyMember.countDocuments({ status: 'active' }),
    FamilyMember.countDocuments({ status: 'active', gender: 'male' }),
    FamilyMember.countDocuments({ status: 'active', gender: 'female' }),
    Student.countDocuments({ status: 'active' }),
    Business.countDocuments({ status: 'active' }),
    BloodDonor.countDocuments({ status: 'active' }),
    Event.countDocuments(),
    News.countDocuments({ status: 'published' }),
    Donation.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    ActivityLog.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
  ]);

  const childrenCount = await FamilyMember.countDocuments({
    status: 'active',
    age: { $lt: 18 },
  });

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyGrowth = await FamilyMember.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const donationsByMonth = await Donation.aggregate([
    { $match: { status: 'confirmed', createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalFamilies,
        totalMembers,
        male: maleCount,
        female: femaleCount,
        children: childrenCount,
        students: studentCount,
        businesses: businessCount,
        bloodDonors: bloodDonorCount,
        events: eventCount,
        news: newsCount,
        donations: donationStats[0]?.total || 0,
        donationCount: donationStats[0]?.count || 0,
      },
      monthlyGrowth,
      donationsByMonth,
      recentActivities,
    },
  });
});

export const getPublicStats = asyncHandler(async (_req, res) => {
  const [families, members, events, businesses] = await Promise.all([
    Family.countDocuments({ status: 'active' }),
    FamilyMember.countDocuments({ status: 'active' }),
    Event.countDocuments({ status: 'published', eventType: 'upcoming' }),
    Business.countDocuments({ status: 'active' }),
  ]);

  res.json({
    success: true,
    data: { families, members, events, businesses },
  });
});
