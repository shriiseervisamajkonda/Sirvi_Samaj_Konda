import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('village_information');

export const getVillageInfo = asyncHandler(async (_req, res) => {
  const { data, error } = await supabase
    .from('village_information')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const raw = data || {};
  const formatted = {
    ...raw,
    _id: raw.id,
    name: raw.village_hi || raw.village_en || 'कोणदा (Konda)',
    tehsil: raw.tehsil_hi || raw.tehsil_en || 'कुक्षी (Kukshi)',
    district: raw.district_hi || raw.district_en || 'धार (Dhar)',
    state: raw.state_hi || raw.state_en || 'मध्यप्रदेश (Madhya Pradesh)',
    pinCode: raw.pin_code || '454335',
    communityCenter: raw.spiritual_seat_hi || raw.spiritual_seat_en || 'श्री आई माताजी बडेर एवं सिर्वी समाज धर्मशाला',
    description: raw.history_hi || raw.history_en || 'श्री सीरवी समाज कोणदा आई पंथ के 11 नियमों एवं क्षत्रिय परंपरा का पालन करने वाला गौरवशाली समाज है।',
    purpose: raw.spiritual_seat_hi || 'सामाजिक बैठकें, विवाह, धार्मिक अनुष्ठान एवं सांस्कृतिक आयोजन।',
  };

  // Support both object and array format for frontend backwards compatibility
  res.json({ success: true, data: [formatted], village: formatted });
});

export const updateVillageInfo = asyncHandler(async (req, res) => {
  const { data: existing } = await supabase.from('village_information').select('id').limit(1).maybeSingle();

  const payload = {
    village_hi: req.body.name || req.body.village_hi,
    village_en: req.body.village_en || req.body.name,
    tehsil_hi: req.body.tehsil || req.body.tehsil_hi,
    tehsil_en: req.body.tehsil_en || req.body.tehsil,
    district_hi: req.body.district || req.body.district_hi,
    district_en: req.body.district_en || req.body.district,
    state_hi: req.body.state || req.body.state_hi,
    state_en: req.body.state_en || req.body.state,
    pin_code: req.body.pinCode || req.body.pin_code,
    spiritual_seat_hi: req.body.communityCenter || req.body.spiritual_seat_hi,
    history_hi: req.body.description || req.body.history_hi,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabase
      .from('village_information')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true, message: 'Village info updated', data });
  } else {
    const { data, error } = await supabase.from('village_information').insert(payload).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, message: 'Village info created', data });
  }
});
