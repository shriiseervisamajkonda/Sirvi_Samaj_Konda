import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('news', {
  searchFields: ['title', 'content', 'excerpt'],
  filterMap: {
    category: 'category',
    status: 'status',
    is_featured: 'is_featured',
  },
  defaultSort: { column: 'published_at', ascending: false },
});

export const getNews = base.getAll;
export const getNewsById = base.getOne;
export const createNews = base.create;
export const updateNews = base.update;
export const deleteNews = base.remove;
