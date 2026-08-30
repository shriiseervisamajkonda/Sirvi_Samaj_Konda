import express from 'express';
import {
  register,
  login,
  googleLogin,
  linkGoogleOAuth,
  getMe,
  forgotPassword,
  updatePassword,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/link-google-oauth', protect, linkGoogleOAuth);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

export default router;
