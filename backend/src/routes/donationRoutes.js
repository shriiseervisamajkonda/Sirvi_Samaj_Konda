import express from 'express';
import Model from '../models/Donation.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();
const ctrl = createCRUDController(Model, 'Donation', {
  searchFields: ['donorName', 'purpose'],
});

// Create Order for Donation (Razorpay or Simulator Mode)
router.post('/create-order', optionalAuth, asyncHandler(async (req, res) => {
  const { amount, donorName, phone, email, purpose, message, isAnonymous } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  // Create donation record in pending state
  const donation = await Model.create({
    donorName: isAnonymous ? 'Anonymous' : donorName || 'Anonymous',
    amount,
    purpose: purpose || 'General Fund',
    paymentMethod: 'online',
    isAnonymous: !!isAnonymous,
    notes: message || '',
    status: 'pending',
    recordedBy: req.user?._id,
  });

  const liveMode = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

  if (liveMode) {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        receipt: `receipt_${donation._id}`,
      });

      // Update donation record with the real order ID
      donation.transactionId = order.id;
      await donation.save();

      return res.json({
        success: true,
        mode: 'live',
        orderId: order.id,
        amount: order.amount,
        keyId: process.env.RAZORPAY_KEY_ID,
        donationId: donation._id,
      });
    } catch (err) {
      console.error('Razorpay order creation failed, falling back to simulator:', err);
      // Fallback to simulator if Razorpay fails
    }
  }

  // Simulator / Fallback Mode
  const mockOrderId = `mock_order_${donation._id}_${Date.now()}`;
  donation.transactionId = mockOrderId;
  await donation.save();

  return res.json({
    success: true,
    mode: 'simulator',
    orderId: mockOrderId,
    amount: amount * 100,
    keyId: null,
    donationId: donation._id,
  });
}));

// Verify Payment Signature
router.post('/verify-payment', optionalAuth, asyncHandler(async (req, res) => {
  const { donationId, orderId, paymentId, signature, mode, status } = req.body;

  const donation = await Model.findById(donationId);
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Donation record not found' });
  }

  if (mode === 'simulator') {
    if (status === 'success') {
      donation.status = 'confirmed';
      donation.receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
      donation.transactionId = paymentId || `mock_pay_${Date.now()}`;
      await donation.save();

      return res.json({
        success: true,
        message: 'Simulated payment processed successfully!',
        data: donation,
      });
    } else {
      donation.status = 'cancelled';
      await donation.save();
      return res.json({
        success: false,
        message: 'Simulated payment was cancelled or failed.',
      });
    }
  }

  // Live Razorpay Verification
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, message: 'Razorpay secret key not configured' });
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (generatedSignature === signature) {
    donation.status = 'confirmed';
    donation.transactionId = paymentId;
    donation.receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
    await donation.save();

    return res.json({
      success: true,
      message: 'Payment verified and donation completed!',
      data: donation,
    });
  } else {
    donation.status = 'cancelled';
    await donation.save();
    return res.status(400).json({ success: false, message: 'Payment verification signature match failed' });
  }
}));

// Public summary dashboard stats
router.get('/public-summary', optionalAuth, asyncHandler(async (_req, res) => {
  const stats = await Model.aggregate([
    { $match: { status: 'confirmed', isAnonymous: false } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const recent = await Model.find({ status: 'confirmed', isAnonymous: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('donorName amount purpose createdAt');
  res.json({ success: true, data: { total: stats[0]?.total || 0, count: stats[0]?.count || 0, recent } });
}));

// Admin endpoints
router.get('/', protect, authorize('super_admin', 'admin', 'editor'), ctrl.getAll);
router.get('/:id', protect, authorize('super_admin', 'admin', 'editor'), ctrl.getOne);
router.post('/', protect, authorize('super_admin', 'admin', 'editor'), ctrl.create);
router.put('/:id', protect, authorize('super_admin', 'admin'), ctrl.update);
router.delete('/:id', protect, authorize('super_admin', 'admin'), ctrl.remove);

export default router;
