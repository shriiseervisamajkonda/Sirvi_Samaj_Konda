import { asyncHandler } from '../middleware/validate.js';
import { paginateResponse, escapeRegex } from '../utils/helpers.js';

// Default sensitive/internal fields to exclude from all client responses
const DEFAULT_EXCLUDE_FIELDS = '-__v -password -refreshToken -otp -resetPasswordToken -emailVerificationToken -internalNotes -adminNotes';

export const sanitizeDocument = (doc) => {
  if (!doc) return null;
  const sanitized = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete sanitized.__v;
  delete sanitized.password;
  delete sanitized.refreshToken;
  delete sanitized.otp;
  delete sanitized.resetPasswordToken;
  delete sanitized.emailVerificationToken;
  delete sanitized.internalNotes;
  delete sanitized.adminNotes;
  return sanitized;
};

export const createCRUDController = (Model, moduleName, options = {}) => {
  const {
    populate = [],
    searchFields = [],
    publicFilter = {},
    select = DEFAULT_EXCLUDE_FIELDS,
    serializer,
    beforeCreate,
    afterCreate,
  } = options;

  const getAll = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { ...publicFilter };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.village) filter.village = req.query.village;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search && searchFields.length) {
      const escapedSearch = escapeRegex(req.query.search);
      filter.$or = searchFields.map((field) => ({
        [field]: { $regex: escapedSearch, $options: 'i' },
      }));
    }

    let query = Model.find(filter)
      .select(select)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    populate.forEach((p) => {
      query = query.populate(p);
    });

    const [data, total] = await Promise.all([
      query,
      Model.countDocuments(filter),
    ]);

    const sanitizedData = data.map((item) => {
      const clean = sanitizeDocument(item);
      return serializer ? serializer(clean, req) : clean;
    });

    res.json(paginateResponse(sanitizedData, total, page, limit));
  });

  const getOne = asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id).select(select).lean();
    populate.forEach((p) => {
      query = query.populate(p);
    });
    const item = await query;
    if (!item) {
      return res.status(404).json({ success: false, message: `${moduleName} not found` });
    }
    const clean = sanitizeDocument(item);
    const responseData = serializer ? serializer(clean, req) : clean;
    res.json({ success: true, data: responseData });
  });

  const create = asyncHandler(async (req, res) => {
    let data = { ...req.body, createdBy: req.user?._id };
    if (beforeCreate) data = await beforeCreate(data, req);
    const item = await Model.create(data);
    if (afterCreate) await afterCreate(item, req);
    const clean = sanitizeDocument(item);
    res.status(201).json({ success: true, data: clean });
  });

  const update = asyncHandler(async (req, res) => {
    let item = await Model.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: `${moduleName} not found` });
    }
    Object.assign(item, req.body);
    await item.save();
    const clean = sanitizeDocument(item);
    res.json({ success: true, data: clean });
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: `${moduleName} not found` });
    }
    await item.deleteOne();
    res.json({ success: true, message: `${moduleName} deleted successfully` });
  });

  return { getAll, getOne, create, update, remove };
};
