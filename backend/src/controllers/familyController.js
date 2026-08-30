import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { clearCacheByPattern } from '../middleware/cache.js';

// GET /api/families (Public & Admin with pagination, search, gotra filter)
export const getFamilies = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('families')
    .select('*, family_members(*)', { count: 'exact' });

  // Status filtering (Public sees active only)
  const isAdmin = req.user && ['developer', 'super_admin', 'admin', 'editor', 'treasurer'].includes(req.user.role);
  if (!isAdmin) {
    query = query.eq('status', 'active');
  } else if (req.query.status) {
    query = query.eq('status', req.query.status);
  }

  // Filters
  if (req.query.gotra) query = query.eq('gotra', req.query.gotra);
  if (req.query.village) query = query.ilike('village', `%${req.query.village}%`);
  if (req.query.panchayat_family_id) query = query.eq('panchayat_family_id', req.query.panchayat_family_id);

  // Search
  if (req.query.search) {
    const s = req.query.search;
    query = query.or(`head_name.ilike.%${s}%,gotra.ilike.%${s}%,head_mobile.ilike.%${s}%,panchayat_family_id.ilike.%${s}%`);
  }

  query = query.order('panchayat_family_id', { ascending: true }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  res.json({
    success: true,
    data: data || [],
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

// GET /api/families/:id (Full Family Details with all members & donation history)
export const getFamilyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [
    { data: family, error: fError },
    { data: members, error: mError },
    { data: donations, error: dError },
  ] = await Promise.all([
    supabase.from('families').select('*').eq('id', id).maybeSingle(),
    supabase.from('family_members').select('*').eq('family_id', id).order('member_number', { ascending: true }),
    supabase.from('donations').select('*').eq('family_id', id).order('financial_year', { ascending: false }),
  ]);

  if (fError || !family) {
    return res.status(404).json({ success: false, message: 'Family not found' });
  }

  res.json({
    success: true,
    data: {
      ...family,
      family_members: members || [],
      donations: donations || [],
    },
  });
});

// GET /api/families/family-id/:familyId (Lookup by Panchayat Family Number)
export const getFamilyByFamilyId = asyncHandler(async (req, res) => {
  const { familyId } = req.params;

  const { data: family, error } = await supabase
    .from('families')
    .select('*, family_members(*)')
    .eq('panchayat_family_id', String(familyId))
    .maybeSingle();

  if (error || !family) {
    return res.status(404).json({ success: false, message: 'Family number not found' });
  }

  res.json({ success: true, data: family });
});

// POST /api/families (Create Family Header + Optional Members in one step)
export const createFamily = asyncHandler(async (req, res) => {
  const {
    panchayat_family_id,
    gotra,
    head_name,
    head_mobile,
    land_area_acres,
    land_details_text,
    village = 'Konda',
    tehsil = 'Kukshi',
    district = 'Dhar',
    state = 'Madhya Pradesh',
    pin_code = '454335',
    faliya_or_ward,
    members = [],
  } = req.body;

  if (!panchayat_family_id || !gotra || !head_name) {
    return res.status(400).json({ success: false, message: 'Family number, gotra and Mukhiya name are required' });
  }

  // Insert Family Header
  const { data: family, error: fError } = await supabase
    .from('families')
    .insert({
      panchayat_family_id: String(panchayat_family_id),
      gotra,
      head_name,
      head_mobile,
      land_area_acres: Number(land_area_acres) || 0,
      land_details_text,
      village,
      tehsil,
      district,
      state,
      pin_code,
      faliya_or_ward,
      total_members: members.length > 0 ? members.length : 1,
      status: 'active',
      created_by: req.user?.id || null,
    })
    .select()
    .single();

  if (fError) {
    return res.status(400).json({ success: false, message: fError.message });
  }

  // Insert Family Members if provided
  let insertedMembers = [];
  if (members && members.length > 0) {
    const formattedMembers = members.map((m, idx) => ({
      family_id: family.id,
      member_number: m.member_number || idx + 1,
      first_name: m.first_name || m.name,
      last_name: m.last_name || gotra,
      full_name: m.full_name || `${m.first_name || m.name} ${m.relative_name || ''} ${gotra}`.trim(),
      relation_to_head: m.relation_to_head || (idx === 0 ? 'self' : 'other'),
      relative_relation_type: m.relative_relation_type || 'father',
      relative_name: m.relative_name || head_name,
      is_head: m.is_head !== undefined ? m.is_head : idx === 0,
      dob: m.dob || null,
      education: m.education || null,
      occupation: m.occupation || null,
      mobile_number: m.mobile_number || (idx === 0 ? head_mobile : null),
      gender: m.gender || 'male',
      marital_status: m.marital_status || 'married',
      blood_group: m.blood_group || 'unknown',
    }));

    const { data: memData, error: mError } = await supabase
      .from('family_members')
      .insert(formattedMembers)
      .select();

    if (!mError) insertedMembers = memData;
  }

  clearCacheByPattern('families');
  clearCacheByPattern('dashboard');

  res.status(201).json({
    success: true,
    message: 'Family census record created successfully',
    data: {
      ...family,
      family_members: insertedMembers,
    },
  });
});

// PUT /api/families/:id
export const updateFamily = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { id: _id, created_at: _ca, created_by: _cb, ...cleanBody } = req.body || {};

  const { data, error } = await supabase
    .from('families')
    .update({ ...cleanBody, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  clearCacheByPattern('families');
  clearCacheByPattern('dashboard');

  res.json({ success: true, message: 'Family updated successfully', data });
});

// DELETE /api/families/:id
export const deleteFamily = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('families').delete().eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  clearCacheByPattern('families');
  clearCacheByPattern('dashboard');

  res.json({ success: true, message: 'Family record deleted successfully' });
});
