import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { clearCacheByPattern } from '../middleware/cache.js';

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
    const { id: _id, created_at: _ca, updated_at: _ua, ...safeBody } = req.body || {};

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
    const { id: _id, created_at: _ca, ...cleanBody } = req.body || {};
    const updateData = { ...cleanBody, updated_at: new Date().toISOString() };

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
