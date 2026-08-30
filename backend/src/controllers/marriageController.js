import { createSupabaseCRUDController } from './baseSupabaseController.js';

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
