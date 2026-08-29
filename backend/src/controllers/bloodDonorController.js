import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('blood_donors', {
  searchFields: ['name', 'phone', 'village'],
  filterMap: {
    blood_group: 'blood_group',
    is_available: 'is_available',
  },
  defaultSort: { column: 'created_at', ascending: false },
});

export const getBloodDonors = base.getAll;
export const getBloodDonorById = base.getOne;
export const createBloodDonor = base.create;
export const updateBloodDonor = base.update;
export const deleteBloodDonor = base.remove;
