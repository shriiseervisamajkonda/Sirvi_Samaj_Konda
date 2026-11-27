import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { clearCacheByPattern } from '../middleware/cache.js';

export const TABLE_ALLOWED_COLUMNS = {
  events: ['title', 'description', 'event_type', 'start_date', 'end_date', 'location', 'images', 'status', 'created_by'],
  news: ['title', 'content', 'excerpt', 'category', 'image_url', 'is_featured', 'published_at', 'status', 'author_name', 'created_by'],
  blood_donors: ['member_id', 'name', 'blood_group', 'phone', 'village', 'last_donated_date', 'is_available'],
  committees: ['name', 'designation', 'committee_type', 'phone', 'email', 'photo_url', 'order_priority', 'is_active', 'member_id', 'bio'],
  panch_settlements: ['title', 'parties', 'settlement_date', 'description', 'panchs', 'documents', 'status', 'created_by'],
  albums: ['title', 'description', 'cover_image_url', 'event_id', 'photo_count', 'status'],
  gallery_photos: ['album_id', 'title', 'photo_url', 'caption', 'order_index'],
  families: ['panchayat_family_id', 'gotra', 'head_name', 'head_mobile', 'land_area_acres', 'land_details_text', 'village', 'tehsil', 'district', 'state', 'pin_code', 'faliya_or_ward', 'house_number', 'total_members', 'photo_url', 'qr_code_token', 'status', 'notes', 'created_by'],
  family_members: ['family_id', 'member_number', 'first_name', 'last_name', 'full_name', 'relation_to_head', 'relative_relation_type', 'relative_name', 'parent_member_id', 'spouse_member_id', 'is_head', 'dob', 'approximate_age', 'gender', 'education', 'occupation', 'mobile_number', 'blood_group', 'is_blood_donor', 'marital_status', 'is_matrimonial_profile', 'life_status', 'photo_url', 'notes'],
  social_info: ['title', 'category', 'content', 'order_priority', 'is_published'],
  lekha_jokha: ['title', 'amount', 'entry_type', 'category', 'entry_date', 'person_name', 'payment_method', 'receipt_or_bill_no', 'notes', 'recorded_by'],
  documents: ['title', 'description', 'file_url', 'file_type', 'category', 'status', 'downloads_count', 'uploaded_by'],
  village_information: ['community_name_en', 'community_name_hi', 'village_en', 'village_hi', 'tehsil_en', 'tehsil_hi', 'district_en', 'district_hi', 'state_en', 'state_hi', 'pin_code', 'country_en', 'country_hi', 'history_en', 'history_hi', 'spiritual_seat_en', 'spiritual_seat_hi', 'emergency_contacts', 'known_gotras'],
  activity_logs: ['user_id', 'user_name', 'user_role', 'action', 'module', 'target_id', 'details', 'ip_address'],
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
    
    // Check constraint events_event_type_check: only allows 'upcoming', 'ongoing', 'past'
    const allowedTypes = ['upcoming', 'ongoing', 'past'];
    if (rawBody.eventType || rawBody.event_type) {
      const typeVal = String(rawBody.eventType || rawBody.event_type).toLowerCase();
      if (allowedTypes.includes(typeVal)) {
        normalized.event_type = typeVal;
      } else {
        const start = rawBody.startDate || rawBody.start_date;
        const isPast = start && new Date(start) < new Date();
        normalized.event_type = isPast ? 'past' : 'upcoming';
      }
    } else {
      normalized.event_type = 'upcoming';
    }

    if (!normalized.description || normalized.description.trim() === '') {
      normalized.description = normalized.title || 'Event details';
    }
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
  } else if (tableName === 'social_info') {
    if (rawBody.order !== undefined) normalized.order_priority = Number(rawBody.order) || 0;
    if (rawBody.orderPriority !== undefined) normalized.order_priority = Number(rawBody.orderPriority) || 0;
    if (rawBody.isActive !== undefined) normalized.is_published = Boolean(rawBody.isActive);
    if (rawBody.is_active !== undefined) normalized.is_published = Boolean(rawBody.is_active);
    if (normalized.is_published === undefined) normalized.is_published = true;
  } else if (tableName === 'lekha_jokha') {
    if (rawBody.type) normalized.entry_type = rawBody.type;
    if (rawBody.entryType) normalized.entry_type = rawBody.entryType;
    if (rawBody.date) normalized.entry_date = rawBody.date;
    if (rawBody.entryDate) normalized.entry_date = rawBody.entryDate;
    if (rawBody.receiptNumber) normalized.receipt_or_bill_no = rawBody.receiptNumber;
    if (rawBody.receipt_or_bill_no) normalized.receipt_or_bill_no = rawBody.receipt_or_bill_no;
    if (rawBody.personName) normalized.person_name = rawBody.personName;
    if (rawBody.paymentMethod) normalized.payment_method = rawBody.paymentMethod;
    if (rawBody.amount !== undefined) normalized.amount = Number(rawBody.amount) || 0;
    if (!normalized.entry_type) normalized.entry_type = 'income';
    if (!normalized.category) normalized.category = 'general';
  } else if (tableName === 'documents') {
    if (rawBody.fileUrl) normalized.file_url = rawBody.fileUrl;
    if (rawBody.fileType) normalized.file_type = rawBody.fileType;
    
    // Check constraint documents_category_check: ('circular', 'census_form', 'rules', 'history', 'report', 'other')
    const allowedCategories = ['circular', 'census_form', 'rules', 'history', 'report', 'other'];
    const cat = String(rawBody.category || '').toLowerCase().trim();
    if (allowedCategories.includes(cat)) {
      normalized.category = cat;
    } else if (cat.includes('form')) {
      normalized.category = 'census_form';
    } else if (cat.includes('rule')) {
      normalized.category = 'rules';
    } else if (cat.includes('hist')) {
      normalized.category = 'history';
    } else if (cat.includes('rep')) {
      normalized.category = 'report';
    } else {
      normalized.category = 'other';
    }

    if (!normalized.status || !['active', 'archived'].includes(normalized.status)) {
      normalized.status = 'active';
    }
  } else if (tableName === 'gallery_photos') {
    if (rawBody.url && !normalized.photo_url) normalized.photo_url = rawBody.url;
    if (rawBody.imageUrl && !normalized.photo_url) normalized.photo_url = rawBody.imageUrl;
    if (rawBody.image_url && !normalized.photo_url) normalized.photo_url = rawBody.image_url;
    if (rawBody.photoUrl && !normalized.photo_url) normalized.photo_url = rawBody.photoUrl;
    if (rawBody.album && !normalized.album_id) normalized.album_id = rawBody.album;
    if (rawBody.order !== undefined) normalized.order_index = Number(rawBody.order) || 0;
    if (rawBody.order_index !== undefined) normalized.order_index = Number(rawBody.order_index) || 0;
  } else if (tableName === 'family_members') {
    if (rawBody.family) normalized.family_id = rawBody.family;
    if (rawBody.familyId) normalized.family_id = rawBody.familyId;
    if (rawBody.firstName) normalized.first_name = rawBody.firstName;
    if (rawBody.lastName) normalized.last_name = rawBody.lastName;
    if (!normalized.full_name) {
      normalized.full_name = `${normalized.first_name || ''} ${normalized.last_name || ''}`.trim();
    }
    if (rawBody.phone) normalized.mobile_number = rawBody.phone;
    if (rawBody.guardianName) normalized.relative_name = rawBody.guardianName;
    if (!normalized.relative_relation_type) normalized.relative_relation_type = 'father';
    if (!normalized.relation_to_head) normalized.relation_to_head = rawBody.relation || 'other';
    if (rawBody.status) {
      normalized.life_status = ['active', 'deceased', 'married_out', 'moved_away'].includes(rawBody.status)
        ? rawBody.status
        : (rawBody.status === 'inactive' ? 'deceased' : 'active');
    }
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

// Automatic audit logger for all administrative mutations
const recordActivityLog = async (req, action, moduleName, targetId, details = {}) => {
  try {
    const user = req.user || {};
    const logEntry = {
      user_id: user.id || null,
      user_name: user.full_name || user.fullName || user.phone || 'Admin System',
      user_role: user.role || 'admin',
      action: `${moduleName.toUpperCase()}_${action.toUpperCase()}`,
      module: moduleName,
      target_id: targetId ? String(targetId) : null,
      details: typeof details === 'object' ? details : { info: String(details) },
      ip_address: req.ip || req.headers['x-forwarded-for'] || null,
    };
    await supabase.from('activity_logs').insert(logEntry);
  } catch (err) {
    console.warn(`[AuditLog Warning] Failed to capture activity for ${moduleName}:`, err.message);
  }
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

    // For family_members, compute next member_number if not provided
    if (tableName === 'family_members' && safeBody.family_id && !safeBody.member_number) {
      const { data: maxMember } = await supabase
        .from('family_members')
        .select('member_number')
        .eq('family_id', safeBody.family_id)
        .order('member_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      safeBody.member_number = (maxMember?.member_number || 0) + 1;
    }

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

    // Audit log
    await recordActivityLog(req, 'CREATE', tableName, data?.id, { title: data?.title || data?.full_name || data?.name });

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

    // Audit log
    await recordActivityLog(req, 'UPDATE', tableName, id, { title: data?.title || data?.full_name || data?.name });

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

    // Audit log
    await recordActivityLog(req, 'DELETE', tableName, id, {});

    res.json({ success: true, message: 'Record deleted successfully' });
  });

  return { getAll, getOne, create, update, remove };
};

export default createSupabaseCRUDController;
