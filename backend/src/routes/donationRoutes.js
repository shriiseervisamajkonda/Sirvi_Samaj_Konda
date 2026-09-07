import express from 'express';
import {
  getDonations,
  getDonationStats,
  getMyReceipts,
  getReceiptByNumber,
  recordDonation,
  updateDonation,
  deleteDonation,
} from '../controllers/donationController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public receipt lookup
router.get('/receipt/:receiptNumber', optionalAuth, getReceiptByNumber);
router.get('/stats', optionalAuth, getDonationStats);

// Protected Member & Staff operations
router.use(protect);
router.get('/my-receipts', getMyReceipts);
router.get('/', authorize('developer', 'super_admin', 'admin', 'treasurer', 'donations:read'), getDonations);
router.post('/', authorize('developer', 'super_admin', 'admin', 'treasurer', 'donations:write'), recordDonation);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'treasurer', 'donations:write'), updateDonation);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'donations:write'), deleteDonation);

export default router;
