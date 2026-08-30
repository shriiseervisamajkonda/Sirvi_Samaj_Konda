import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

const formatOccupation = (occ) => {
  const o = (occ || '').toLowerCase().trim();
  const map = {
    agriculture: 'कृषि (Agriculture)',
    shopkeeper: 'दुकान / व्यापार (Shopkeeper)',
    business: 'व्यवसाय / उद्योग (Business)',
    tailoring: 'सिलाई / टेलरिंग (Tailoring)',
    private_job: 'निजी सेवा (Private Job)',
    government_job: 'सरकारी सेवा (Government Job)',
    teacher: 'शिक्षक (Teacher)',
    private_teacher: 'निजी शिक्षक (Private Teacher)',
    contractor: 'ठेकेदार / निर्माण (Contractor)',
    doctor: 'चिकित्सक (Doctor)',
    advocate: 'अधिवक्ता / वकील (Advocate)',
    lic_agent: 'बीमा सलाहकार (LIC / Insurance)',
    bank_job: 'बैंक सेवा (Banking)',
    artisan: 'कारीगर / शिल्पकार (Artisan)',
    painter: 'पेंटर (Painter)',
    parlour: 'ब्यूटी पार्लर (Beauty Parlour)',
    labour: 'श्रम / सेवा (Labour / Service)',
    site_work: 'साइट वर्क (Site Work)',
  };
  return map[o] || occ;
};

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
    .not('occupation', 'in', '(homemaker,student,गृहणी,घरकाम,विद्यार्थी,none,None)')
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
    businessName: `${m.full_name || m.first_name} — ${formatOccupation(m.occupation)}`,
    ownerName: m.full_name || `${m.first_name} ${m.last_name || ''}`.trim(),
    category: formatOccupation(m.occupation),
    phone: m.mobile_number,
    address: `${m.families?.village || 'Konda'}, MP`,
    city: m.families?.village || 'Konda',
    description: `${m.full_name} (${formatOccupation(m.occupation)}), Sirvi Samaj Konda`,
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
  const occValue = category || occupation || 'व्यापार (Business)';

  if (!targetMemberId) {
    return res.status(400).json({ success: false, message: 'सदस्य आईडी आवश्यक है (memberId is required)' });
  }

  const { data, error } = await supabase
    .from('family_members')
    .update({ occupation: occValue, updated_at: new Date().toISOString() })
    .eq('id', targetMemberId)
    .select()
    .single();

  if (error || !data) {
    return res.status(400).json({ success: false, message: error ? error.message : 'Member not found' });
  }

  res.status(201).json({ success: true, message: 'Business record created successfully', data });
});

// PUT /api/businesses/:id
export const updateBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category, occupation } = req.body;
  const occValue = category || occupation;

  if (!occValue) {
    return res.status(400).json({ success: false, message: 'Category or occupation is required' });
  }

  const { data, error } = await supabase
    .from('family_members')
    .update({ occupation: occValue, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Business record not found' });

  res.json({ success: true, message: 'Business updated successfully', data });
});

// DELETE /api/businesses/:id
export const deleteBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('family_members')
    .update({ occupation: null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Business record not found' });

  res.json({ success: true, message: 'Business removed successfully' });
});
