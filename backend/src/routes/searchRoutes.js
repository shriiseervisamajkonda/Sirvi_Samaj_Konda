import express from 'express';
import { globalSearch, searchBloodDonors } from '../controllers/searchController.js';

const router = express.Router();

router.get('/', globalSearch);
router.get('/blood-donors', searchBloodDonors);

export default router;
