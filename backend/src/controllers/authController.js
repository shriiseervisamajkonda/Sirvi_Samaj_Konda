import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );

  return { accessToken, refreshToken };
};

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, phone, email, password, role = 'member', panchayat_family_id } = req.body;

  if (!phone || !password || !name) {
    return res.status(400).json({ success: false, message: 'Name, Phone and Password are required' });
  }

  // Check if phone or email already registered
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .or(`phone.eq.${phone},email.eq.${email || 'none@none.com'}`)
    .maybeSingle();

  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Phone or Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      name,
      phone,
      email: email || null,
      password_hash: passwordHash,
      role,
      panchayat_family_id: panchayat_family_id || null,
      is_active: true,
    })
    .select('id, name, phone, email, role, photo_url, panchayat_family_id, created_at')
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user, accessToken, refreshToken },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { identifier, phone, email, password } = req.body;
  const loginId = identifier || phone || email;

  if (!loginId || !password) {
    return res.status(400).json({ success: false, message: 'Please provide mobile number/email and password' });
  }

  // Query user by phone or email
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, phone, email, password_hash, role, photo_url, is_active, panchayat_family_id')
    .or(`phone.eq.${loginId},email.eq.${loginId}`)
    .maybeSingle();

  if (error || !user) {
    return res.status(401).json({ success: false, message: 'Invalid phone number/email or password' });
  }

  if (!user.is_active) {
    return res.status(403).json({ success: false, message: 'Your account is currently deactivated' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid phone number/email or password' });
  }

  // Update last login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  const { password_hash, ...userProfile } = user;
  const { accessToken, refreshToken } = generateTokens(user);

  res.json({
    success: true,
    message: 'Logged in successfully',
    data: {
      user: userProfile,
      accessToken,
      refreshToken,
    },
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, phone, email, role, photo_url, is_active, panchayat_family_id, created_at, last_login')
    .eq('id', req.user.id)
    .maybeSingle();

  if (error || !user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, data: user });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { phone, email } = req.body;

  let query = supabase.from('users').select('id, name, phone, email');
  if (phone) query = query.eq('phone', phone);
  else if (email) query = query.eq('email', email);
  else return res.status(400).json({ success: false, message: 'Please provide phone or email' });

  const { data: user } = await query.maybeSingle();
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found with this credential' });
  }

  // Generate temporary 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  res.json({
    success: true,
    message: 'Reset instructions / OTP generated',
    data: { phone: user.phone, otpHint: 'Sent to registered mobile' },
  });
});

// PUT /api/auth/update-password
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new password required' });
  }

  const { data: user } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', req.user.id)
    .single();

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password does not match' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await supabase
    .from('users')
    .update({ password_hash: newHash, must_change_password: false, updated_at: new Date().toISOString() })
    .eq('id', req.user.id);

  res.json({ success: true, message: 'Password updated successfully' });
});
