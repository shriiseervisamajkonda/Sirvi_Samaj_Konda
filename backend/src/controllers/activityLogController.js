import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('activity_logs', {
  searchFields: ['user_name', 'action', 'module'],
  filterMap: {
    module: 'module',
    user_id: 'user_id',
  },
  defaultSort: { column: 'created_at', ascending: false },
});

export const getActivityLogs = base.getAll;
export const getActivityLogById = base.getOne;
export const createActivityLog = base.create;
