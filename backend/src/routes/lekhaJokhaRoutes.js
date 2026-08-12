import express from 'express';
import Model from '../models/LekhaJokha.js';
import { createCRUDController } from '../controllers/baseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = express.Router();
const ctrl = createCRUDController(Model, 'LekhaJokha', {
  searchFields: ['title', 'personName', 'receiptNumber', 'notes'],
});

// GET statistics for financial ledgers
router.get('/stats', optionalAuth, asyncHandler(async (req, res) => {
  const categoryStats = await Model.aggregate([
    {
      $group: {
        _id: '$category',
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  const overallStats = await Model.aggregate([
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      categories: categoryStats,
      overall: overallStats[0] || { totalIncome: 0, totalExpense: 0, count: 0 }
    }
  });
}));

// GET all records - public view (read-only, anyone can view)
router.get('/public', optionalAuth, ctrl.getAll);

// Admin-secured routes
router.get('/', protect, authorize('super_admin', 'admin', 'editor'), ctrl.getAll);
router.get('/:id', protect, authorize('super_admin', 'admin', 'editor'), ctrl.getOne);
router.post('/', protect, authorize('super_admin', 'admin', 'editor'), ctrl.create);
router.put('/:id', protect, authorize('super_admin', 'admin'), ctrl.update);
router.delete('/:id', protect, authorize('super_admin', 'admin'), ctrl.remove);

export default router;
