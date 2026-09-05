import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { clearCacheByPattern } from '../middleware/cache.js';

export const TABLE_ALLOWED_COLUMNS = {
  events: ['title', 'description', 'event_type', 'start_date', 'end_date', 'location', 'images', 'status', 'created_by'],
  news: ['title', 'content', 'excerpt', 'category', 'image_url', 'is_featured', 'published_at', 'status', 'author_name', 'created_by'],
  blood_donors: ['member_id', 'name', 'blood_group', 'phone', 'village', 'last_donated_date', 'is_available'],
  committees: ['name', 'designation', 'committee_type', 'phone', 'email', 'photo_url', 'order_priority', 'is_active', 'member_id', 'bio'],
  panch_settlements: ['title', 'parties', 'settlement_date', 'description', 'panchs', 'documents', 'status', 'created_by'],
  families: ['panchayat_family_id', 'gotra', 'head_name', 'head_mobile', 'land_area_acres', 'land_details_text', 'village', 'tehsil', 'district', 'state', 'pin_code', 'faliya_or_ward', 'house_number', 'total_members', 'photo_url', 'qr_code_token', 'status', 'notes', 'created_by'],
  family_members: ['family_id', 'member_number', 'first_name', 'last_name', 'full_name', 'relation_to_head', 'relative_relation_type', 'relative_name', 'parent_member_id', 'spouse_member_id', 'is_head', 'dob', 'approximate_age', 'gender', 'education', 'occupation', 'mobile_number', 'blood_group', 'is_blood_donor', 'marital_status', 'is_matrimonial_profile', 'life_status', 'photo_url', 'notes'],
};

export const normalizePayload = (tableName, rawBody = {}) => {
  if (!rawBody || typeof rawBody !== 'object') return {};
  const normalized = {};

  for (const [key, value] of Object.entries(rawBody)) {
    if (value === undefined) continue;
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    normalized[snakeKey] = value;
  }

  // Schema-specific alias normalizations
  if (tableName === 'events') {
    if (rawBody.startDate) normalized.start_date = rawBody.startDate;
    if (rawBody.endDate) normalized.end_date = rawBody.endDate;
    if (rawBody.eventType) normalized.event_type = rawBody.eventType;
    if (rawBody.image && !normalized.images) normalized.images = [rawBody.image];
    if (rawBody.image_url && !normalized.images) normalized.images = [rawBody.image_url];
  } else if (tableName === 'news') {
    if (rawBody.image && !normalized.image_url) normalized.image_url = rawBody.image;
  } else if (tableName === 'blood_donors') {
    if (rawBody.phone) normalized.phone = rawBody.phone;
    if (rawBody.mobile_number) normalized.phone = rawBody.mobile_number;
    if (rawBody.bloodGroup) normalized.blood_group = rawBody.bloodGroup;
    if (rawBody.lastDonationDate || rawBody.last_donation_date) {
      normalized.last_donated_date = rawBody.lastDonationDate || rawBody.last_donation_date;
    }
    if (rawBody.status !== undefined) {
      normalized.is_available = rawBody.status === 'available' || rawBody.status === true;
    }
    if (rawBody.is_available !== undefined) {
      normalized.is_available = Boolean(rawBody.is_available);
    }
  } else if (tableName === 'panch_settlements') {
    if (rawBody.settlementDate) normalized.settlement_date = rawBody.settlementDate;
  } else if (tableName === 'families') {
    if (rawBody.headOfFamily) normalized.head_name = rawBody.headOfFamily;
    if (rawBody.surname) normalized.gotra = rawBody.surname;
    if (rawBody.mobileNumber) normalized.head_mobile = rawBody.mobileNumber;
    if (rawBody.familyId) normalized.panchayat_family_id = String(rawBody.familyId);
    if (rawBody.agriculturalLandArea !== undefined && rawBody.agriculturalLandArea !== '') {
      normalized.land_area_acres = Number(rawBody.agriculturalLandArea);
    }
    if (rawBody.numberOfMembers !== undefined && rawBody.numberOfMembers !== '') {
      normalized.total_members = Number(rawBody.numberOfMembers);
    }
    if (rawBody.pinCode) normalized.pin_code = String(rawBody.pinCode);
  }

  const allowed = TABLE_ALLOWED_COLUMNS[tableName];
  if (allowed && allowed.length > 0) {
    const safeResult = {};
    for (const col of allowed) {
      if (normalized[col] !== undefined) {
        safeResult[col] = normalized[col];
      }
    }
    return safeResult;
  }

  return normalized;
};

export const createSupabaseCRUDController = (tableName, options = {}) => {
  const {
    searchFields = [],
    defaultSort = { column: 'created_at', ascending: false },
    filterMap = {},
    select = '*',
  } = options;

  // GET ALL with pagination, search, sorting & filtering
  const getAll = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    let query = supabase.from(tableName).select(select, { count: 'exact' });

    // Apply explicit query filters
    for (const [queryParam, dbColumn] of Object.entries(filterMap)) {
      const val = req.query[queryParam];
      if (val !== undefined && val !== '') {
        let cleanVal = val;
        if (cleanVal === 'true') cleanVal = true;
        if (cleanVal === 'false') cleanVal = false;
        query = query.eq(dbColumn, cleanVal);
      }
    }

    // Apply generic search across specified fields (using or ilike)
    if (req.query.search && searchFields.length > 0) {
      const searchTerms = searchFields
        .map((field) => `${field}.ilike.%${req.query.search}%`)
        .join(',');
      query = query.or(searchTerms);
    }

    // Sorting
    const sortCol = req.query.sortBy || defaultSort.column;
    const ascending = req.query.sortOrder === 'asc' ? true : defaultSort.ascending;
    query = query.order(sortCol, { ascending });

    // Pagination range
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      data: data || [],
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  });

  // GET ONE BY ID
  const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (!data) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.json({ success: true, data });
  });

  // CREATE RECORD
  const create = asyncHandler(async (req, res) => {
    const safeBody = normalizePayload(tableName, req.body || {});

    const { data, error } = await supabase
      .from(tableName)
      .insert(safeBody)
      .select(select)
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    clearCacheByPattern(tableName);
    clearCacheByPattern('dashboard');

    res.status(201).json({ success: true, data });
  });

  // UPDATE RECORD
  const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const safeBody = normalizePayload(tableName, req.body || {});
    const updateData = { ...safeBody, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select(select)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (!data) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    clearCacheByPattern(tableName);
    clearCacheByPattern('dashboard');

    res.json({ success: true, data });
  });

  // DELETE RECORD
  const remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from(tableName).delete().eq('id', id);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    clearCacheByPattern(tableName);
    clearCacheByPattern('dashboard');

    res.json({ success: true, message: 'Record deleted successfully' });
  });

  return { getAll, getOne, create, update, remove };
};

export default createSupabaseCRUDController;
