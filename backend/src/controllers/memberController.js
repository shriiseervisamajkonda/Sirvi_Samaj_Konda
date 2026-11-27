import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('family_members', {
  searchFields: ['first_name', 'last_name', 'full_name', 'relative_name', 'occupation', 'education'],
  filterMap: {
    family_id: 'family_id',
    gender: 'gender',
    blood_group: 'blood_group',
    marital_status: 'marital_status',
    occupation: 'occupation',
    education: 'education',
    life_status: 'life_status',
  },
  select: '*, families(panchayat_family_id, head_name, gotra, village)',
});

// GET /api/members (Public & Admin search)
export const getMembers = base.getAll;
export const getMemberById = base.getOne;
export const createMember = base.create;
export const updateMember = base.update;
export const deleteMember = base.remove;
