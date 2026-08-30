import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('documents', {
  searchFields: ['title', 'description', 'category'],
  filterMap: {
    category: 'category',
    status: 'status',
  },
  defaultSort: { column: 'created_at', ascending: false },
});

export const getDocuments = base.getAll;
export const getDocumentById = base.getOne;
export const createDocument = base.create;
export const updateDocument = base.update;
export const deleteDocument = base.remove;
