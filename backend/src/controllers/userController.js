import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

// GET /api/users
export const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('users')
    .select('id, name, phone, email, role, photo_url, is_active, panchayat_family_id, created_at, last_login', { count: 'exact' });

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
    .select('id, name, phone, email, role, photo_url, is_active, panchayat_family_id, created_at, last_login')
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

  const cleanPhone = phone.trim();
  const cleanEmail = email ? email.trim().toLowerCase() : null;

  // Check if phone already in use
  const { data: existingPhone } = await supabase
    .from('users')
    .select('id')
    .eq('phone', cleanPhone)
    .maybeSingle();

  if (existingPhone) {
    return res.status(400).json({ success: false, message: 'A user with this mobile number already exists' });
  }

  // Check if email already in use
  if (cleanEmail) {
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists' });
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const isActive = is_active !== undefined ? Boolean(is_active) : status === 'inactive' ? false : true;

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      name: name.trim(),
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
    const cleanPhone = phone.trim();
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
