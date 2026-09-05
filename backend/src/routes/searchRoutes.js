import express from 'express';
import { globalSearch, searchBloodDonors } from '../controllers/searchController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/blood-donors', optionalAuth, searchBloodDonors);
router.get('/', optionalAuth, globalSearch);

export default router;
