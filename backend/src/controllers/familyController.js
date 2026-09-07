import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { clearCacheByPattern } from '../middleware/cache.js';
import { normalizePayload } from './baseSupabaseController.js';

// GET /api/families (Public & Admin with pagination, search, gotra filter, natural numeric sorting)
export const getFamilies = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit) || 12));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('families')
    .select('*, family_members(*)');

  // Status filtering (Public sees active only)
  const isAdmin = req.user && ['developer', 'super_admin', 'admin', 'editor', 'treasurer'].includes(req.user.role);
  if (!isAdmin) {
    query = query.eq('status', 'active');
  } else if (req.query.status && req.query.status !== 'all') {
    query = query.eq('status', req.query.status);
  }

  // Filters
  if (req.query.gotra && req.query.gotra !== 'all') query = query.eq('gotra', req.query.gotra);
  if (req.query.village && req.query.village !== 'all') query = query.ilike('village', `%${req.query.village}%`);
  if (req.query.panchayat_family_id) query = query.eq('panchayat_family_id', req.query.panchayat_family_id);

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  let allFamilies = data || [];

  // Comprehensive entire-table search across all columns, address, and family member details
  if (req.query.search) {
    const s = String(req.query.search).trim().toLowerCase();
    const cleanDigits = s.replace(/\D/g, '');

    allFamilies = allFamilies.filter((fam) => {
      // 1. Family ID / S.No.
      if (String(fam.panchayat_family_id || '').toLowerCase().includes(s)) return true;
      // 2. Head of Family Name
      if (String(fam.head_name || '').toLowerCase().includes(s)) return true;
      // 3. Gotra / Surname
      if (String(fam.gotra || '').toLowerCase().includes(s)) return true;
      // 4. Head Mobile Number
      if (cleanDigits && String(fam.head_mobile || '').replace(/\D/g, '').includes(cleanDigits)) return true;
      if (String(fam.head_mobile || '').toLowerCase().includes(s)) return true;
      // 5. Village / District / Tehsil / State / Pincode
      if (String(fam.village || '').toLowerCase().includes(s)) return true;
      if (String(fam.district || '').toLowerCase().includes(s)) return true;
      if (String(fam.tehsil || '').toLowerCase().includes(s)) return true;
      if (String(fam.pin_code || '').includes(s)) return true;
      // 6. Land Area
      if (String(fam.land_area_acres || '').includes(s)) return true;
      if (String(fam.land_details_text || '').toLowerCase().includes(s)) return true;
      // 7. Status (Hindi & English)
      const statusHindi = fam.status === 'inactive' ? 'निष्क्रिय inactive' : 'सक्रिय active';
      if (statusHindi.toLowerCase().includes(s)) return true;
      // 8. Total members
      if (`${fam.total_members || 0} सदस्य members`.toLowerCase().includes(s)) return true;
      // 9. Notes / Address / Faliya / Ward / House Number
      if (String(fam.faliya_or_ward || '').toLowerCase().includes(s)) return true;
      if (String(fam.house_number || '').toLowerCase().includes(s)) return true;
      if (String(fam.notes || '').toLowerCase().includes(s)) return true;

      // 10. Family members search (children, spouse, parents, etc.)
      if (Array.isArray(fam.family_members)) {
        const memberMatch = fam.family_members.some((m) => {
          if (String(m.full_name || '').toLowerCase().includes(s)) return true;
          if (String(m.first_name || '').toLowerCase().includes(s)) return true;
          if (String(m.last_name || '').toLowerCase().includes(s)) return true;
          if (String(m.relative_name || '').toLowerCase().includes(s)) return true;
          if (String(m.occupation || '').toLowerCase().includes(s)) return true;
          if (String(m.education || '').toLowerCase().includes(s)) return true;
          if (cleanDigits && String(m.mobile_number || '').replace(/\D/g, '').includes(cleanDigits)) return true;
          return false;
        });
        if (memberMatch) return true;
      }

      return false;
    });
  }

  // Natural numeric and multi-field sorting
  const sortBy = req.query.sortBy || 'panchayat_family_id';
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
  const isAsc = sortOrder === 'asc';

  allFamilies.sort((a, b) => {
    if (sortBy === 'panchayat_family_id' || sortBy === 'familyId' || sortBy === 'id') {
      const numA = parseInt(a.panchayat_family_id, 10);
      const numB = parseInt(b.panchayat_family_id, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return isAsc ? numA - numB : numB - numA;
      }
      return isAsc
        ? String(a.panchayat_family_id || '').localeCompare(String(b.panchayat_family_id || ''), undefined, { numeric: true, sensitivity: 'base' })
        : String(b.panchayat_family_id || '').localeCompare(String(a.panchayat_family_id || ''), undefined, { numeric: true, sensitivity: 'base' });
    }

    if (sortBy === 'headOfFamily' || sortBy === 'head_name') {
      const aVal = a.head_name || '';
      const bVal = b.head_name || '';
      return isAsc
        ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
        : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
    }

    if (sortBy === 'surname' || sortBy === 'gotra') {
      const aVal = a.gotra || '';
      const bVal = b.gotra || '';
      return isAsc
        ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
        : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
    }

    if (sortBy === 'mobileNumber' || sortBy === 'head_mobile') {
      const aVal = a.head_mobile || '';
      const bVal = b.head_mobile || '';
      return isAsc
        ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
        : String(bVal).localeCompare(String(aVal), undefined, { numeric: true });
    }

    if (sortBy === 'memberCount' || sortBy === 'numberOfMembers' || sortBy === 'total_members') {
      const countA = Number(a.total_members ?? (Array.isArray(a.family_members) ? a.family_members.length : 0));
      const countB = Number(b.total_members ?? (Array.isArray(b.family_members) ? b.family_members.length : 0));
      return isAsc ? countA - countB : countB - countA;
    }

    if (sortBy === 'agriculturalLandArea' || sortBy === 'land_area_acres') {
      const landA = Number(a.land_area_acres || 0);
      const landB = Number(b.land_area_acres || 0);
      return isAsc ? landA - landB : landB - landA;
    }

    if (sortBy === 'status') {
      const aVal = a.status || 'active';
      const bVal = b.status || 'active';
      return isAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }

    if (sortBy === 'village') {
      const aVal = a.village || '';
      const bVal = b.village || '';
      return isAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }

    // Default fallback: natural numeric on panchayat_family_id
    const defNumA = parseInt(a.panchayat_family_id, 10);
    const defNumB = parseInt(b.panchayat_family_id, 10);
    if (!isNaN(defNumA) && !isNaN(defNumB)) {
      return isAsc ? defNumA - defNumB : defNumB - defNumA;
    }
    return isAsc
      ? String(a.panchayat_family_id || '').localeCompare(String(b.panchayat_family_id || ''), undefined, { numeric: true })
      : String(b.panchayat_family_id || '').localeCompare(String(a.panchayat_family_id || ''), undefined, { numeric: true });
  });

  const total = allFamilies.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedFamilies = allFamilies.slice(offset, offset + limit);

  res.json({
    success: true,
    data: paginatedFamilies,
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

    if (mError) {
      // Rollback family header creation if member insert fails
      await supabase.from('families').delete().eq('id', family.id);
      return res.status(400).json({
        success: false,
        message: `सदस्य विवरण सुरक्षित करने में त्रुटि: ${mError.message}`,
      });
    }
    insertedMembers = memData || [];
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
  const safeBody = normalizePayload('families', req.body || {});

  const { data, error } = await supabase
    .from('families')
    .update({ ...safeBody, updated_at: new Date().toISOString() })
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

// GET /api/families/stats
export const getFamilyStats = asyncHandler(async (req, res) => {
  const [{ count: totalFamilies }, { count: totalMembers }] = await Promise.all([
    supabase.from('families').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('family_members').select('*', { count: 'exact', head: true }).eq('life_status', 'active'),
  ]);

  res.json({
    success: true,
    data: {
      totalFamilies: totalFamilies || 0,
      totalMembers: totalMembers || 0,
    },
  });
});

