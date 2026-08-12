import express from 'express';
import { body } from 'express-validator';
import {
  register, login, logout, refreshToken, getMe,
  forgotPassword, resetPassword, verifyEmail,
  sendOTP, verifyOTP, updatePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], validate, login);

router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);
router.put('/reset-password/:token', [body('password').isLength({ min: 6 })], validate, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/send-otp', [body('email').isEmail()], validate, sendOTP);
router.post('/verify-otp', validate, verifyOTP);
router.put('/update-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], validate, updatePassword);

export default router;
