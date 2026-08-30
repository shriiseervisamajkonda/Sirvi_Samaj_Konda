import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('social_info', {
  searchFields: ['title', 'content', 'category'],
  filterMap: {
    category: 'category',
    is_published: 'is_published',
  },
  defaultSort: { column: 'order_priority', ascending: true },
});

export const getSocialInfo = base.getAll;
export const getSocialInfoById = base.getOne;
export const createSocialInfo = base.create;
export const updateSocialInfo = base.update;
export const deleteSocialInfo = base.remove;
