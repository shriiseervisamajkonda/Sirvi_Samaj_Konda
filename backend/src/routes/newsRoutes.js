import express from 'express';
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getNews);
router.get('/:id', optionalAuth, getNewsById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'news:write'), createNews);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'news:write'), updateNews);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'news:write'), deleteNews);

export default router;
