import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('committees', {
  searchFields: ['name', 'designation', 'phone'],
  filterMap: {
    committee_type: 'committee_type',
    is_active: 'is_active',
  },
  defaultSort: { column: 'order_priority', ascending: true },
});

export const getCommittees = base.getAll;
export const getCommitteeById = base.getOne;
export const createCommittee = base.create;
export const updateCommittee = base.update;
export const deleteCommittee = base.remove;
