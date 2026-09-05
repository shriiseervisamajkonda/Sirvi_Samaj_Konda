import express from 'express';
import {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getPhotos,
  getPhotoById,
  createPhoto,
  updatePhoto,
  deletePhoto,
} from '../controllers/galleryController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public / Read
router.get('/', optionalAuth, getPhotos);
router.get('/photos', optionalAuth, getPhotos);
router.get('/albums', optionalAuth, getAlbums);
router.get('/albums/:id', optionalAuth, getAlbumById);
router.get('/:id', optionalAuth, getPhotoById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'gallery:write'), createPhoto);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'gallery:write'), updatePhoto);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'gallery:write'), deletePhoto);

router.post('/albums', authorize('developer', 'super_admin', 'admin', 'gallery:write'), createAlbum);
router.put('/albums/:id', authorize('developer', 'super_admin', 'admin', 'gallery:write'), updateAlbum);
router.delete('/albums/:id', authorize('developer', 'super_admin', 'admin', 'gallery:write'), deleteAlbum);

router.post('/photos', authorize('developer', 'super_admin', 'admin', 'gallery:write'), createPhoto);
router.put('/photos/:id', authorize('developer', 'super_admin', 'admin', 'gallery:write'), updatePhoto);
router.delete('/photos/:id', authorize('developer', 'super_admin', 'admin', 'gallery:write'), deletePhoto);

export default router;

