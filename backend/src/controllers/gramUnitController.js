import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { createSupabaseCRUDController } from './baseSupabaseController.js';

const unitBase = createSupabaseCRUDController('gram_units');
const memberBase = createSupabaseCRUDController('gram_unit_members', {
  searchFields: ['name', 'designation', 'phone', 'village'],
  filterMap: {
    category: 'category',
    is_active: 'is_active',
  },
  defaultSort: { column: 'order_priority', ascending: true },
});

// Public combined Gram Unit page payload
export const getGramUnitPublicDetails = asyncHandler(async (_req, res) => {
  const [
    { data: unit },
    { data: allMembers },
  ] = await Promise.all([
    supabase.from('gram_units').select('*').limit(1).maybeSingle(),
    supabase.from('gram_unit_members').select('*').eq('is_active', true).order('order_priority', { ascending: true }),
  ]);

  const defaultUnit = unit || {
    name: 'श्री सीरवी समाज कोणदा ग्राम इकाई',
    village: 'कोणदा (Konda)',
    tehsil: 'कुक्षी (Kukshi)',
    district: 'धार (Dhar)',
    state: 'मध्य प्रदेश',
    total_households: 213,
    total_population: 1184,
  };

  const membersList = allMembers || [];
  const officeBearers = membersList.filter((m) => m.category === 'office_bearer');
  const members = membersList.filter((m) => m.category === 'member');
  const representatives = membersList.filter((m) => m.category === 'representative');

  res.json({
    success: true,
    data: {
      unit: defaultUnit,
      officeBearers,
      members,
      representatives,
    },
  });
});

export const getGramUnits = unitBase.getAll;
export const updateGramUnit = unitBase.update;

export const getGramUnitMembers = memberBase.getAll;
export const createGramUnitMember = memberBase.create;
export const updateGramUnitMember = memberBase.update;
export const deleteGramUnitMember = memberBase.remove;
