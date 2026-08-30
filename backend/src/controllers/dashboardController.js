import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

// GET /api/dashboard
export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    { count: totalFamilies },
    { count: totalMembers },
    { count: maleCount },
    { count: femaleCount },
    { count: bloodDonorCount },
    { count: eventCount },
    { count: newsCount },
    { data: donations },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from('families').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('family_members').select('*', { count: 'exact', head: true }).eq('life_status', 'active'),
    supabase.from('family_members').select('*', { count: 'exact', head: true }).eq('life_status', 'active').eq('gender', 'male'),
    supabase.from('family_members').select('*', { count: 'exact', head: true }).eq('life_status', 'active').eq('gender', 'female'),
    supabase.from('blood_donors').select('*', { count: 'exact', head: true }).eq('is_available', true),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('donations').select('amount').eq('payment_status', 'confirmed'),
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(8),
  ]);

  const totalDonationAmount = (donations || []).reduce((sum, d) => sum + Number(d.amount || 0), 0);

  res.json({
    success: true,
    data: {
      stats: {
        totalFamilies: totalFamilies || 0,
        totalMembers: totalMembers || 0,
        maleCount: maleCount || 0,
        femaleCount: femaleCount || 0,
        bloodDonorCount: bloodDonorCount || 0,
        eventCount: eventCount || 0,
        newsCount: newsCount || 0,
        totalDonations: totalDonationAmount,
        totalDonationRecords: donations?.length || 0,
      },
      recentActivities: recentLogs || [],
    },
  });
});

// GET /api/dashboard/public
export const getPublicStats = asyncHandler(async (_req, res) => {
  const [
    { count: totalFamilies },
    { count: totalMembers },
    { count: bloodDonorCount },
    { count: eventCount },
    { count: newsCount },
  ] = await Promise.all([
    supabase.from('families').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('family_members').select('*', { count: 'exact', head: true }).eq('life_status', 'active'),
    supabase.from('blood_donors').select('*', { count: 'exact', head: true }).eq('is_available', true),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('news').select('*', { count: 'exact', head: true }).eq('status', 'published'),
  ]);

  res.json({
    success: true,
    data: {
      totalFamilies: totalFamilies || 0,
      totalMembers: totalMembers || 0,
      bloodDonorCount: bloodDonorCount || 0,
      eventCount: eventCount || 0,
      newsCount: newsCount || 0,
    },
  });
});
