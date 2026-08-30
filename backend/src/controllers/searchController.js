import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

// GET /api/search
export const globalSearch = asyncHandler(async (req, res) => {
  const rawQ = req.query.q || req.query.search || '';
  // Sanitize search term to prevent PostgREST delimiter/filter injection
  const q = rawQ.replace(/[%_(),.'"\\*]/g, '').trim().slice(0, 100);

  if (!q || q.length < 2) {
    return res.json({
      success: true,
      data: { families: [], members: [], news: [], events: [] },
    });
  }

  const [
    { data: families },
    { data: members },
    { data: news },
    { data: events },
  ] = await Promise.all([
    supabase
      .from('families')
      .select('id, panchayat_family_id, head_name, gotra, head_mobile, village')
      .or(`head_name.ilike.%${q}%,gotra.ilike.%${q}%,panchayat_family_id.ilike.%${q}%`)
      .limit(5),
    supabase
      .from('family_members')
      .select('id, full_name, relative_name, occupation, education, mobile_number, family_id')
      .or(`full_name.ilike.%${q}%,occupation.ilike.%${q}%,education.ilike.%${q}%`)
      .limit(5),
    supabase
      .from('news')
      .select('id, title, category, published_at')
      .ilike('title', `%${q}%`)
      .eq('status', 'published')
      .limit(5),
    supabase
      .from('events')
      .select('id, title, event_type, start_date, location')
      .ilike('title', `%${q}%`)
      .limit(5),
  ]);

  res.json({
    success: true,
    data: {
      families: families || [],
      members: members || [],
      news: news || [],
      events: events || [],
    },
  });
});
