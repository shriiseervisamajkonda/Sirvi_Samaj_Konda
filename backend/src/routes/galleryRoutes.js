import express from 'express';
import {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getPhotos,
  createPhoto,
  deletePhoto,
} from '../controllers/galleryController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Albums
router.get('/albums', optionalAuth, getAlbums);
router.get('/albums/:id', optionalAuth, getAlbumById);
router.get('/photos', optionalAuth, getPhotos);

router.use(protect);
router.post('/albums', authorize('developer', 'super_admin', 'admin', 'gallery:write'), createAlbum);
router.put('/albums/:id', authorize('developer', 'super_admin', 'admin', 'gallery:write'), updateAlbum);
router.delete('/albums/:id', authorize('developer', 'super_admin', 'admin', 'gallery:write'), deleteAlbum);

router.post('/photos', authorize('developer', 'super_admin', 'admin', 'gallery:write'), createPhoto);
router.delete('/photos/:id', authorize('developer', 'super_admin', 'admin', 'gallery:write'), deletePhoto);

export default router;
