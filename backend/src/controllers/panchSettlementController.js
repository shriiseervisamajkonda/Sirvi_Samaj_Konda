import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('panch_settlements', {
  searchFields: ['title', 'parties', 'description', 'panchs'],
  filterMap: {
    status: 'status',
  },
  defaultSort: { column: 'settlement_date', ascending: false },
});

export const getPanchSettlements = base.getAll;
export const getPanchSettlementById = base.getOne;
export const createPanchSettlement = base.create;
export const updatePanchSettlement = base.update;
export const deletePanchSettlement = base.remove;
