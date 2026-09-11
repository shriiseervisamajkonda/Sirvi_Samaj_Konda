import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { validatePasswordPolicy } from './authController.js';

// GET /api/users
export const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('users')
    .select('id, name, phone, email, role, permissions, photo_url, is_active, panchayat_family_id, created_at, last_login', { count: 'exact' });

  if (req.query.search) {
    const s = req.query.search;
    query = query.or(`name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,role.ilike.%${s}%`);
  }

  if (req.query.role && req.query.role !== 'all') {
    query = query.eq('role', req.query.role);
  }

  if (req.query.status !== undefined && req.query.status !== '') {
    const isActive = req.query.status === 'active' || req.query.status === true || req.query.status === 'true';
    query = query.eq('is_active', isActive);
  }

  const sortCol = req.query.sortBy || 'created_at';
  const ascending = req.query.sortOrder === 'asc';
  query = query.order(sortCol, { ascending }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.json({
    success: true,
    data: data || [],
    pagination: {
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit) || 1,
    },
  });
});

// GET /api/users/:id
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, email, role, permissions, photo_url, is_active, panchayat_family_id, created_at, last_login')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, data });
});

// POST /api/users
export const createUser = asyncHandler(async (req, res) => {
  const { name, firstName, lastName, first_name, last_name, phone, email, password, role, is_active, status, panchayat_family_id } = req.body;

  const fName = (firstName || first_name || '').trim();
  const lName = (lastName || last_name || '').trim();
  const resolvedName = (fName || lName) ? `${fName} ${lName}`.trim() : (name || '').trim();

  if (!resolvedName || !phone || !password) {
    return res.status(400).json({ success: false, message: 'First name (or full name), mobile number, and password are required' });
  }

  const cleanPhone = phone.trim().replace(/\D/g, '');
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें' });
  }

  const cleanEmail = email ? email.trim().toLowerCase() : null;

  // Validate password complexity
  const passwordError = validatePasswordPolicy(password);
  if (passwordError) {
    return res.status(400).json({ success: false, message: passwordError });
  }

  // Check if phone already in use
  const { data: existingPhone } = await supabase
    .from('users')
    .select('id')
    .eq('phone', cleanPhone)
    .maybeSingle();

  if (existingPhone) {
    return res.status(400).json({ success: false, message: 'यह मोबाइल नंबर पहले से पंजीकृत है (Mobile number already exists)' });
  }

  // Check if email already in use
  if (cleanEmail) {
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'यह ईमेल आईडी पहले से पंजीकृत है (Email address already exists)' });
    }
  }

  const passwordHash = await bcrypt.hash(password.trim(), 10);
  const isActive = is_active !== undefined ? Boolean(is_active) : status === 'inactive' ? false : true;

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      name: resolvedName,
      phone: cleanPhone,
      email: cleanEmail,
      password_hash: passwordHash,
      role: role || 'member',
      is_active: isActive,
      panchayat_family_id: panchayat_family_id || null,
      must_change_password: true,
    })
    .select('id, name, phone, email, role, photo_url, is_active, panchayat_family_id, must_change_password, created_at')
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
});

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, firstName, lastName, first_name, last_name, phone, email, password, role, is_active, status, panchayat_family_id } = req.body;

  const updates = {};
  const fName = (firstName || first_name || '').trim();
  const lName = (lastName || last_name || '').trim();
  if (fName || lName) {
    updates.name = `${fName} ${lName}`.trim();
  } else if (name !== undefined) {
    updates.name = name.trim();
  }
  if (role !== undefined) updates.role = role;
  if (panchayat_family_id !== undefined) updates.panchayat_family_id = panchayat_family_id || null;
  if (is_active !== undefined) updates.is_active = Boolean(is_active);
  else if (status !== undefined) updates.is_active = status === 'active';

  if (phone !== undefined) {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें' });
    }
    const { data: existingPhone } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .neq('id', id)
      .maybeSingle();

    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'This mobile number is in use by another user' });
    }
    updates.phone = cleanPhone;
  }

  if (email !== undefined) {
    const cleanEmail = email ? email.trim().toLowerCase() : null;
    if (cleanEmail) {
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .neq('id', id)
        .maybeSingle();

      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'This email is in use by another user' });
      }
    }
    updates.email = cleanEmail;
  }

  if (password && password.trim() !== '') {
    const passwordError = validatePasswordPolicy(password.trim());
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }
    updates.password_hash = await bcrypt.hash(password.trim(), 10);
  }

  updates.updated_at = new Date().toISOString();

  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, name, phone, email, role, photo_url, is_active, panchayat_family_id, created_at')
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.json({ success: true, message: 'User updated successfully', data: updatedUser });
});

// DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent deleting oneself
  if (req.user?.id === id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
  }

  const { error } = await supabase.from('users').delete().eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.json({ success: true, message: 'User deleted successfully' });
});

// POST /api/users/:id/reset-default-password
export const resetDefaultPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, name, phone, panchayat_family_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const cleanPhone = (user.phone || '').replace(/\D/g, '');
  const last4 = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : '0000';
  const familyId = user.panchayat_family_id || '1';
  const defaultPassword = `${last4}@${familyId}`;

  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const { error: updateError } = await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      must_change_password: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    return res.status(400).json({ success: false, message: updateError.message });
  }

  res.json({
    success: true,
    message: `पासवर्ड डिफ़ॉल्ट (${defaultPassword}) पर रीसेट कर दिया गया है।`,
    defaultPassword,
  });
});

// PUT /api/users/:id/toggle-export-permission
// Only developer/super_admin can grant/revoke can_export_data permission
export const toggleExportPermission = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Fetch current user permissions
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, name, role, permissions')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const currentPermissions = Array.isArray(user.permissions) ? user.permissions : [];
  const hasExport = currentPermissions.includes('can_export_data');

  // Toggle: add or remove can_export_data
  const updatedPermissions = hasExport
    ? currentPermissions.filter((p) => p !== 'can_export_data')
    : [...currentPermissions, 'can_export_data'];

  const { error: updateError } = await supabase
    .from('users')
    .update({
      permissions: updatedPermissions,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    return res.status(400).json({ success: false, message: updateError.message });
  }

  const granted = !hasExport;
  res.json({
    success: true,
    message: granted
      ? `${user.name} को डेटा एक्सपोर्ट अधिकार प्रदान किया गया (Export permission granted)`
      : `${user.name} का डेटा एक्सपोर्ट अधिकार हटा दिया गया (Export permission revoked)`,
    data: { permissions: updatedPermissions, can_export_data: granted },
  });
});
