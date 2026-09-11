import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

// GET /api/students
export const getStudents = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('family_members')
    .select('*, families(id, panchayat_family_id, head_name, gotra, village)', { count: 'exact' })
    .or('occupation.ilike.%student%,occupation.ilike.%विद्यार्थी%,occupation.ilike.%study%,occupation.ilike.%अध्ययन%,occupation.ilike.%School%,occupation.ilike.%College%,education.not.is.null')
    .order('created_at', { ascending: false });

  if (req.query.search) {
    const s = req.query.search;
    query = query.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,full_name.ilike.%${s}%,education.ilike.%${s}%,occupation.ilike.%${s}%`);
  }

  if (req.query.sortBy) {
    const asc = req.query.sortOrder === 'asc';
    if (req.query.sortBy === 'name') query = query.order('first_name', { ascending: asc });
    else if (req.query.sortBy === 'course') query = query.order('education', { ascending: asc });
    else query = query.order('created_at', { ascending: asc });
  }

  query = query.range(offset, offset + limit - 1);

  let { data, count, error } = await query;

  // Fallback: if no records with specific occupation filter, query general members with education
  if (!error && (!data || data.length === 0) && !req.query.search) {
    const fallbackQuery = await supabase
      .from('family_members')
      .select('*, families(id, panchayat_family_id, head_name, gotra, village)', { count: 'exact' })
      .not('education', 'is', null)
      .neq('education', '')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fallbackQuery.data && fallbackQuery.data.length > 0) {
      data = fallbackQuery.data;
      count = fallbackQuery.count;
    }
  }

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const formatted = (data || []).map((m) => {
    const gotra = m.last_name || m.families?.gotra || '';
    const isHigherEdu = m.education?.includes('B.') || m.education?.includes('M.') || m.education?.includes('Tech') || m.education?.includes('MBBS') || m.education?.includes('Degree') || m.education?.includes('College');
    return {
      id: m.id,
      _id: m.id,
      member: {
        id: m.id,
        _id: m.id,
        firstName: m.first_name,
        lastName: m.last_name,
        fullName: m.full_name,
        photo: m.photo_url,
      },
      studentName: m.full_name || `${m.first_name} ${m.last_name || ''}`.trim(),
      course: m.education || 'अध्ययनरत विद्यार्थी',
      collegeName: isHigherEdu ? 'उच्च शिक्षा / कॉलेज' : 'विद्यालयीन शिक्षा (School)',
      currentYear: m.education || 'नियमित',
      status: m.life_status === 'deceased' ? 'inactive' : 'active',
      village: m.families?.village || 'कोणदा',
      gotra: gotra,
      panchayat_family_id: m.families?.panchayat_family_id || '',
      head_name: m.families?.head_name || '',
      mobile_number: m.mobile_number || '',
      gender: m.gender || 'male',
      photo: m.photo_url,
      createdAt: m.created_at,
    };
  });

  const total = count || formatted.length || 0;
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

// GET /api/students/:id
export const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('family_members')
    .select('*, families(panchayat_family_id, head_name, gotra, village)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ success: false, message: 'Student record not found' });
  }

  res.json({
    success: true,
    data: {
      id: data.id,
      _id: data.id,
      studentName: data.full_name,
      course: data.education,
      member: data,
    },
  });
});

// POST /api/students (Update or assign education to a member)
export const createStudent = asyncHandler(async (req, res) => {
  const { memberId, member, course, education } = req.body;
  const targetMemberId = memberId || member || req.body.id;
  const eduValue = course || education || 'विद्यार्थी';

  if (!targetMemberId) {
    return res.status(400).json({ success: false, message: 'सदस्य आईडी आवश्यक है (memberId is required)' });
  }

  const { data, error } = await supabase
    .from('family_members')
    .update({ education: eduValue, updated_at: new Date().toISOString() })
    .eq('id', targetMemberId)
    .select()
    .single();

  if (error || !data) {
    return res.status(400).json({ success: false, message: error ? error.message : 'Member not found' });
  }

  res.status(201).json({ success: true, message: 'Student record created successfully', data });
});

// PUT /api/students/:id
export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { course, education } = req.body;
  const eduValue = course || education;

  if (!eduValue) {
    return res.status(400).json({ success: false, message: 'Course or education details required' });
  }

  const { data, error } = await supabase
    .from('family_members')
    .update({ education: eduValue, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Student record not found' });

  res.json({ success: true, message: 'Student record updated', data });
});

// DELETE /api/students/:id
export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('family_members')
    .update({ education: null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Student record not found' });

  res.json({ success: true, message: 'Student record removed successfully' });
});
