import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('lekha_jokha', {
  searchFields: ['title', 'person_name', 'receipt_or_bill_no', 'notes'],
  filterMap: {
    entry_type: 'entry_type',
    category: 'category',
    payment_method: 'payment_method',
  },
  defaultSort: { column: 'entry_date', ascending: false },
});

export const getLekhaJokha = base.getAll;
export const getLekhaJokhaById = base.getOne;
export const createLekhaJokha = base.create;
export const updateLekhaJokha = base.update;
export const deleteLekhaJokha = base.remove;

// GET /api/lekha-jokha/stats
export const getLekhaJokhaStats = asyncHandler(async (_req, res) => {
  const { data: entries, error } = await supabase
    .from('lekha_jokha')
    .select('amount, entry_type, category');

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const byCategory = {};

  for (const item of entries || []) {
    const amt = Number(item.amount || 0);
    if (item.entry_type === 'income') totalIncome += amt;
    else if (item.entry_type === 'expense') totalExpense += amt;

    if (!byCategory[item.category]) byCategory[item.category] = { income: 0, expense: 0 };
    if (item.entry_type === 'income') byCategory[item.category].income += amt;
    else byCategory[item.category].expense += amt;
  }

  res.json({
    success: true,
    data: {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      totalEntries: entries?.length || 0,
      byCategory,
    },
  });
});
