import { createSupabaseCRUDController } from './baseSupabaseController.js';
import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

const base = createSupabaseCRUDController('marriage_profiles', {
  searchFields: ['candidate_name', 'gotra', 'education', 'occupation', 'father_name'],
  filterMap: {
    gender: 'gender',
    gotra: 'gotra',
    status: 'status',
  },
  defaultSort: { column: 'created_at', ascending: false },
});

export const getMarriageProfiles = base.getAll;
export const getMarriageProfileById = base.getOne;
export const createMarriageProfile = base.create;
export const updateMarriageProfile = base.update;
export const deleteMarriageProfile = base.remove;

export const approveMarriageProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status = 'approved' } = req.body;

  const { data, error } = await supabase
    .from('marriage_profiles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.json({
    success: true,
    message: `Marriage profile status updated to ${status}`,
    data,
  });
});

