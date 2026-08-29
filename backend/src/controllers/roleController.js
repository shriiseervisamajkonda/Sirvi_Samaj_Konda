import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('roles', {
  searchFields: ['name', 'display_name_en', 'display_name_hi', 'description'],
  defaultSort: { column: 'created_at', ascending: true },
});

export const getRoles = base.getAll;
export const getRoleById = base.getOne;
export const createRole = base.create;
export const updateRole = base.update;
export const deleteRole = base.remove;
