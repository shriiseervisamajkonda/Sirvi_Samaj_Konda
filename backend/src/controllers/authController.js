import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

// Password Security Policy: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const validatePasswordPolicy = (pwd) => {
  if (!pwd || typeof pwd !== 'string') {
    return 'पासवर्ड आवश्यक है (Password is required)';
  }
  if (!PASSWORD_REGEX.test(pwd)) {
    return 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए जिसमें कम से कम 1 बड़ा अक्षर (A-Z), 1 छोटा अक्षर (a-z), 1 अंक (0-9) और 1 विशेष चिह्न (!@#$%^&* आदि) होना आवश्यक है';
  }
  return null;
};

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '8h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
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

  // Enforce phone validation (10 digits Indian mobile)
  const cleanPhone = phone.trim().replace(/\D/g, '');
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें (Valid 10-digit mobile number required)' });
  }

  // Enforce password strength policy
  const passwordError = validatePasswordPolicy(password);
  if (passwordError) {
    return res.status(400).json({ success: false, message: passwordError });
  }

  // Check duplicate phone separately
  const { data: existingPhone } = await supabase
    .from('users')
    .select('id')
    .eq('phone', cleanPhone)
    .maybeSingle();

  if (existingPhone) {
    return res.status(400).json({ success: false, message: 'यह मोबाइल नंबर पहले से पंजीकृत है (This mobile number is already registered)' });
  }

  // Check duplicate email separately if email is provided
  const cleanEmail = email ? email.trim().toLowerCase() : null;
  if (cleanEmail) {
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'यह ईमेल आईडी पहले से पंजीकृत है (This email is already registered)' });
    }
  }

  const passwordHash = await bcrypt.hash(password.trim(), 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      name: resolvedName,
      phone: cleanPhone,
      email: cleanEmail,
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
  const loginId = (identifier || phone || email || '').trim();

  if (!loginId || !password) {
    return res.status(400).json({ success: false, message: 'Please provide mobile number/email and password' });
  }

  // Query user by phone or email
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, phone, email, password_hash, role, photo_url, is_active, must_change_password, panchayat_family_id')
    .or(`phone.eq.${loginId},email.eq.${loginId.toLowerCase()}`)
    .maybeSingle();

  if (error || !user) {
    return res.status(401).json({ success: false, message: 'अमान्य मोबाइल नंबर / ईमेल अथवा गलत पासवर्ड (Invalid login credentials)' });
  }

  if (!user.is_active) {
    return res.status(403).json({ success: false, message: 'Your account is currently deactivated. Please contact the administrator.' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'अमान्य मोबाइल नंबर / ईमेल अथवा गलत पासवर्ड (Invalid login credentials)' });
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
    } catch {
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
      message: 'यह Google खाता किसी पंजीकृत सदस्य से लिंक नहीं है। कृपया पहले अपने पंजीकृत मोबाइल नंबर व पासवर्ड से लॉगिन करें और प्रोफ़ाइल में जाकर Google खाता लिंक करें।',
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

// POST /api/auth/unlink-google (Protected)
export const unlinkGoogle = asyncHandler(async (req, res) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, phone')
    .eq('id', req.user.id)
    .single();

  if (userError || !user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Update DB user record to remove linked email
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ email: null, updated_at: new Date().toISOString() })
    .eq('id', req.user.id)
    .select('id, name, phone, email, role, photo_url, is_active, panchayat_family_id, created_at, last_login')
    .single();

  if (updateError) {
    return res.status(400).json({ success: false, message: updateError.message });
  }

  res.json({
    success: true,
    message: 'Google खाता सफलतापूर्वक हटा दिया गया है।',
    data: updatedUser,
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, phone, email, role, photo_url, is_active, must_change_password, panchayat_family_id, created_at, last_login')
    .eq('id', req.user.id)
    .maybeSingle();

  if (error || !user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, data: user });
});

// POST /api/auth/forgot-password (Honest Coming Soon state)
export const forgotPassword = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: false,
    code: 'FEATURE_COMING_SOON',
    message: 'पासवर्ड रीसेट एवं ओटीपी सुविधा शीघ्र ही उपलब्ध होगी (Coming Soon)। कृपया पासवर्ड रीसेट के लिए अपने समाज प्रशासक से संपर्क करें।',
  });
});

// POST /api/auth/send-otp (Honest Coming Soon state)
export const sendOTP = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: false,
    code: 'FEATURE_COMING_SOON',
    message: 'एसएमएस/ईमेल ओटीपी सेवा शीघ्र ही उपलब्ध होगी (Coming Soon)।',
  });
});

// POST /api/auth/verify-otp (Honest Coming Soon state)
export const verifyOTP = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: false,
    code: 'FEATURE_COMING_SOON',
    message: 'ओटीपी सत्यापन सेवा शीघ्र ही उपलब्ध होगी (Coming Soon)।',
  });
});

// PUT /api/auth/update-password
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'वर्तमान पासवर्ड एवं नया पासवर्ड दोनों दर्ज करना आवश्यक है' });
  }

  const { data: user } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', req.user.id)
    .single();

  if (!user || !user.password_hash) {
    return res.status(400).json({ success: false, message: 'User account not configured for password login' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'वर्तमान पासवर्ड सही नहीं है (Current password incorrect)' });
  }

  // Check if new password is same as current password
  const isSameAsOld = await bcrypt.compare(newPassword.trim(), user.password_hash);
  if (isSameAsOld) {
    return res.status(400).json({ success: false, message: 'नया पासवर्ड वर्तमान पासवर्ड से अलग होना चाहिए (New password must be different from current password)' });
  }

  // Enforce password strength policy
  const passwordError = validatePasswordPolicy(newPassword.trim());
  if (passwordError) {
    return res.status(400).json({ success: false, message: passwordError });
  }

  const newHash = await bcrypt.hash(newPassword.trim(), 10);
  await supabase
    .from('users')
    .update({ password_hash: newHash, must_change_password: false, updated_at: new Date().toISOString() })
    .eq('id', req.user.id);

  res.json({ success: true, message: 'पासवर्ड सफलतापूर्वक बदल दिया गया है (Password changed successfully)' });
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

  if (phone !== undefined) {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें' });
    }
    // Check if phone number is already used by another user
    const { data: existingPhone } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .neq('id', req.user.id)
      .maybeSingle();

    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'यह मोबाइल नंबर पहले से किसी अन्य सदस्य खाते से जुड़ा हुआ है' });
    }
    updates.phone = cleanPhone;
  }

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
    .select('id, name, phone, email, role, photo_url, is_active, must_change_password, panchayat_family_id, created_at, last_login')
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

export const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

