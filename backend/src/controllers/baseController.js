import { asyncHandler } from '../middleware/validate.js';
import { paginateResponse } from '../utils/helpers.js';

export const createCRUDController = (Model, moduleName, options = {}) => {
  const {
    populate = [],
    searchFields = [],
    publicFilter = {},
    beforeCreate,
    afterCreate,
  } = options;

  const getAll = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { ...publicFilter };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.village) filter.village = req.query.village;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search && searchFields.length) {
      filter.$or = searchFields.map((field) => ({
        [field]: { $regex: req.query.search, $options: 'i' },
      }));
    }

    let query = Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    populate.forEach((p) => { query = query.populate(p); });

    const [data, total] = await Promise.all([
      query,
      Model.countDocuments(filter),
    ]);

    res.json(paginateResponse(data, total, page, limit));
  });

  const getOne = asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    populate.forEach((p) => { query = query.populate(p); });
    const item = await query;
    if (!item) {
      return res.status(404).json({ success: false, message: `${moduleName} not found` });
    }
    res.json({ success: true, data: item });
  });

  const create = asyncHandler(async (req, res) => {
    let data = { ...req.body, createdBy: req.user?._id };
    if (beforeCreate) data = await beforeCreate(data, req);
    const item = await Model.create(data);
    if (afterCreate) await afterCreate(item, req);
    res.status(201).json({ success: true, data: item });
  });

  const update = asyncHandler(async (req, res) => {
    let item = await Model.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: `${moduleName} not found` });
    }
    Object.assign(item, req.body);
    await item.save();
    res.json({ success: true, data: item });
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
