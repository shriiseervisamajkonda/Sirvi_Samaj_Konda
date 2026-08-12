import express from 'express';
import Gallery from '../models/Gallery.js';
import Album from '../models/Album.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';
import { paginateResponse } from '../utils/helpers.js';

const router = express.Router();
const galleryCtrl = createCRUDController(Gallery, 'Gallery', {
  populate: [{ path: 'album', select: 'title' }],
});

router.get('/albums', optionalAuth, asyncHandler(async (req, res) => {
  const albums = await Album.find().sort({ createdAt: -1 });
  res.json({ success: true, data: albums });
}));

router.post('/albums', protect, authorize('super_admin', 'admin', 'editor'), asyncHandler(async (req, res) => {
  const album = await Album.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: album });
}));

router.get('/', optionalAuth, galleryCtrl.getAll);
router.get('/:id', galleryCtrl.getOne);
router.use(protect);
router.post('/', authorize('super_admin', 'admin', 'editor'), galleryCtrl.create);
router.put('/:id', authorize('super_admin', 'admin', 'editor'), galleryCtrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), galleryCtrl.remove);

export default router;
