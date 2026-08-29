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

  res.json({ success: true, data: data || {} });
});

export const updateVillageInfo = asyncHandler(async (req, res) => {
  const { data: existing } = await supabase.from('village_information').select('id').limit(1).maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('village_information')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true, message: 'Village info updated', data });
  } else {
    const { data, error } = await supabase.from('village_information').insert(req.body).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, message: 'Village info created', data });
  }
});
