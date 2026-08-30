import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

// GET /api/businesses
export const getBusinesses = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('family_members')
    .select('*, families(panchayat_family_id, head_name, gotra, village, faliya_or_ward, house_number, tehsil, district)', { count: 'exact' })
    .not('occupation', 'is', null)
    .neq('occupation', '')
    .order('created_at', { ascending: false });

  if (req.query.search) {
    const s = req.query.search;
    query = query.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,full_name.ilike.%${s}%,occupation.ilike.%${s}%`);
  }

  if (req.query.category && req.query.category !== 'all') {
    query = query.ilike('occupation', `%${req.query.category}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const formatted = (data || []).map((m) => ({
    id: m.id,
    _id: m.id,
    member: {
      id: m.id,
      _id: m.id,
      firstName: m.first_name,
      lastName: m.last_name,
      fullName: m.full_name,
      phone: m.mobile_number,
      photo: m.photo_url,
    },
    businessName: `${m.full_name || m.first_name} — ${m.occupation}`,
    ownerName: m.full_name || `${m.first_name} ${m.last_name || ''}`.trim(),
    category: m.occupation,
    phone: m.mobile_number,
    address: m.families?.address || `${m.families?.village || 'Konda'}, MP`,
    city: m.families?.village || 'Konda',
    description: `${m.full_name} (${m.occupation}), Sirvi Samaj Konda`,
    isVerified: true,
    createdAt: m.created_at,
  }));

  const total = count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  res.json({
    success: true,
    data: formatted,
    pagination: {
      total,
      page,
      limit,
      pages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

// GET /api/businesses/:id
export const getBusinessById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('family_members')
    .select('*, families(panchayat_family_id, head_name, gotra, village, faliya_or_ward, house_number, tehsil, district)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ success: false, message: 'Business record not found' });
  }

  res.json({
    success: true,
    data: {
      id: data.id,
      _id: data.id,
      businessName: `${data.full_name} — ${data.occupation}`,
      ownerName: data.full_name,
      category: data.occupation,
      phone: data.mobile_number,
      address: `${data.families?.village || 'Konda'}, MP`,
      member: data,
    },
  });
});

// POST /api/businesses
export const createBusiness = asyncHandler(async (req, res) => {
  const { memberId, member, category, occupation } = req.body;
  const targetMemberId = memberId || member || req.body.id;
  const occValue = category || occupation || 'Business';

  if (targetMemberId) {
    const { data, error } = await supabase
      .from('family_members')
      .update({ occupation: occValue, updated_at: new Date().toISOString() })
      .eq('id', targetMemberId)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, message: 'Business record created', data });
  }

  res.status(201).json({ success: true, message: 'Business created', data: req.body });
});

// PUT /api/businesses/:id
export const updateBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category, occupation } = req.body;
  const occValue = category || occupation;

  if (occValue) {
    const { data, error } = await supabase
      .from('family_members')
      .update({ occupation: occValue, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true, message: 'Business updated', data });
  }

  res.json({ success: true, message: 'Updated', data: req.body });
});

// DELETE /api/businesses/:id
export const deleteBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await supabase
    .from('family_members')
    .update({ occupation: null, updated_at: new Date().toISOString() })
    .eq('id', id);

  res.json({ success: true, message: 'Business removed' });
});
