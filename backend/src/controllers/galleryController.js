import { createSupabaseCRUDController } from './baseSupabaseController.js';
import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

const albumBase = createSupabaseCRUDController('albums', {
  searchFields: ['title', 'description', 'category'],
  filterMap: { category: 'category', status: 'status' },
  defaultSort: { column: 'created_at', ascending: false },
});

const photoBase = createSupabaseCRUDController('gallery_photos', {
  searchFields: ['title', 'caption'],
  filterMap: { album_id: 'album_id' },
  defaultSort: { column: 'display_order', ascending: true },
});

export const getAlbums = albumBase.getAll;
export const getAlbumById = albumBase.getOne;
export const createAlbum = albumBase.create;
export const updateAlbum = albumBase.update;
export const deleteAlbum = albumBase.remove;

export const getPhotos = photoBase.getAll;
export const createPhoto = photoBase.create;
export const deletePhoto = photoBase.remove;
