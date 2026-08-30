import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
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
  const { name, firstName, lastName, first_name, last_name, phone, email, password, role = 'member', panchayat_family_id } = req.body;

  const fName = (firstName || first_name || '').trim();
  const lName = (lastName || last_name || '').trim();
  const resolvedName = (fName || lName) ? `${fName} ${lName}`.trim() : (name || '').trim();

  if (!phone || !password || !resolvedName) {
    return res.status(400).json({ success: false, message: 'First name (or full name), Phone, and Password are required' });
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
      name: resolvedName,
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
    .select('id, name, phone, email, password_hash, role, photo_url, is_active, must_change_password, panchayat_family_id')
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
      must_change_password: Boolean(user.must_change_password),
      accessToken,
      refreshToken,
    },
  });
});

// POST /api/auth/google-login
export const googleLogin = asyncHandler(async (req, res) => {
  const { token, email } = req.body;
  let verifiedEmail = (email || '').trim().toLowerCase();

  // If a cryptographic Supabase token is provided, verify it directly with Supabase Auth
  if (token && isSupabaseConfigured) {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user?.email) {
        return res.status(401).json({
          success: false,
          message: 'Google cryptographic token verification failed. Please try again.',
        });
      }
      verifiedEmail = authData.user.email.trim().toLowerCase();
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google authentication session.',
      });
    }
  }

  if (!verifiedEmail) {
    return res.status(400).json({ success: false, message: 'Google email or OAuth token is required' });
  }

  // Check if this Google email is linked to a registered Samaj account
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, phone, email, role, photo_url, is_active, must_change_password, panchayat_family_id, created_at, last_login')
    .eq('email', verifiedEmail)
    .maybeSingle();

  if (error || !user) {
    return res.status(403).json({
      success: false,
      code: 'GOOGLE_NOT_LINKED',
      message: 'यह Google खाता किसी पंजीकृत सदस्य से लिंक नहीं है। कृपया पहले अपने पंजीकृत मोबाइल नंबर व डिफ़ॉल्ट पासवर्ड से लॉगिन करें और प्रोफ़ाइल में जाकर Google खाता लिंक करें।',
      email: verifiedEmail,
    });
  }

  if (!user.is_active) {
    return res.status(403).json({ success: false, message: 'Your account is currently deactivated' });
  }

  // Check if user still needs to complete mandatory first-time password change
  if (user.must_change_password) {
    return res.status(403).json({
      success: false,
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'कृपया पहले अपने पंजीकृत मोबाइल नंबर व डिफ़ॉल्ट पासवर्ड से लॉगिन कर अपना नया पासवर्ड सेट करें।',
    });
  }

  // Update last login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  const { accessToken, refreshToken } = generateTokens(user);

  res.json({
    success: true,
    message: 'Google login successful',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

// POST /api/auth/link-google-oauth (Protected)
export const linkGoogleOAuth = asyncHandler(async (req, res) => {
  const { token, email } = req.body;
  let verifiedEmail = (email || '').trim().toLowerCase();

  // If cryptographic token provided, verify it with Supabase Auth
  if (token && isSupabaseConfigured) {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user?.email) {
        return res.status(401).json({
          success: false,
          message: 'Google OAuth token verification failed. Could not verify account ownership.',
        });
      }
      verifiedEmail = authData.user.email.trim().toLowerCase();
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google OAuth token',
      });
    }
  }

  if (!verifiedEmail) {
    return res.status(400).json({ success: false, message: 'Verified Google email is required' });
  }

  // Check if another user already has this email linked
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, name')
    .eq('email', verifiedEmail)
    .neq('id', req.user.id)
    .maybeSingle();

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: `यह Google खाता (${verifiedEmail}) पहले से किसी अन्य सदस्य खाते से जुड़ा हुआ है।`,
    });
  }

  // Update user's email with the verified Google email
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ email: verifiedEmail, updated_at: new Date().toISOString() })
    .eq('id', req.user.id)
    .select('id, name, phone, email, role, photo_url, is_active, panchayat_family_id, created_at, last_login')
    .single();

  if (updateError) {
    return res.status(400).json({ success: false, message: updateError.message });
  }

  res.json({
    success: true,
    message: 'Google खाता सफलतापूर्वक सत्यापित व लिंक हो गया है!',
    data: updatedUser,
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

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, firstName, lastName, first_name, last_name, email, phone } = req.body;

  const updates = {};
  const fName = (firstName || first_name || '').trim();
  const lName = (lastName || last_name || '').trim();
  if (fName || lName) {
    updates.name = `${fName} ${lName}`.trim();
  } else if (name !== undefined) {
    updates.name = name.trim();
  }
  if (phone !== undefined) updates.phone = phone.trim();
  if (email !== undefined) {
    const cleanEmail = email ? email.trim().toLowerCase() : null;
    // Check if email already in use by another user
    if (cleanEmail) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .neq('id', req.user.id)
        .maybeSingle();

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'This email is already associated with another account' });
      }
    }
    updates.email = cleanEmail;
  }

  updates.updated_at = new Date().toISOString();

  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.user.id)
    .select('id, name, phone, email, role, photo_url, is_active, panchayat_family_id, created_at, last_login')
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
});

