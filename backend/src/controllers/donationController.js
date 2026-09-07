import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';
import { clearCacheByPattern } from '../middleware/cache.js';
import { resolveUserFamily, syncExistingDonationsWithFamilies } from '../utils/familyHelper.js';

// GET /api/donations (With rich filtering: year, purpose, family, payment_mode)
export const getDonations = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 15));
  const offset = (page - 1) * limit;

  let query = supabase.from('donations').select('*', { count: 'exact' });

  if (req.query.financial_year) query = query.eq('financial_year', Number(req.query.financial_year));
  if (req.query.purpose) query = query.eq('purpose', req.query.purpose);
  if (req.query.payment_mode) query = query.eq('payment_mode', req.query.payment_mode);
  if (req.query.payment_status) query = query.eq('payment_status', req.query.payment_status);
  if (req.query.family_id) query = query.eq('family_id', req.query.family_id);
  if (req.query.panchayat_family_id) query = query.eq('panchayat_family_id', req.query.panchayat_family_id);

  if (req.query.search) {
    const s = req.query.search;
    query = query.or(`donor_name.ilike.%${s}%,receipt_number.ilike.%${s}%,gotra.ilike.%${s}%,panchayat_family_id.ilike.%${s}%`);
  }

  query = query.order('payment_date', { ascending: false }).range(offset, offset + limit - 1);

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

// GET /api/donations/stats (Yearly & Purpose totals)
export const getDonationStats = asyncHandler(async (_req, res) => {
  const currentYear = new Date().getFullYear();

  const { data: allDonations, error } = await supabase
    .from('donations')
    .select('amount, purpose, financial_year, payment_status')
    .eq('payment_status', 'confirmed');

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const yearlyMap = {};
  const purposeMap = {};
  let lifetimeTotal = 0;
  let currentYearTotal = 0;

  (allDonations || []).forEach((item) => {
    const amt = Number(item.amount) || 0;
    lifetimeTotal += amt;

    const yr = item.financial_year || currentYear;
    yearlyMap[yr] = (yearlyMap[yr] || 0) + amt;
    if (yr === currentYear) currentYearTotal += amt;

    const p = item.purpose || 'general';
    purposeMap[p] = (purposeMap[p] || 0) + amt;
  });

  res.json({
    success: true,
    data: {
      lifetimeTotal,
      currentYearTotal,
      currentYear,
      byYear: yearlyMap,
      byPurpose: purposeMap,
      totalCount: allDonations?.length || 0,
    },
  });
});

// GET /api/donations/:id
export const getDonationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('donations').select('*').eq('id', id).single();

  if (error || !data) {
    return res.status(404).json({ success: false, message: 'Donation record not found' });
  }

  res.json({ success: true, data });
});

// GET /api/donations/my-receipts (For logged-in member to view personal / family receipts)
export const getMyReceipts = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.json({ success: true, data: [] });
  }

  const { familyUuids, panchayatFamilyIds, cleanPhone, isStaff, primaryFamily } = await resolveUserFamily(user);

  // If user is regular member or has identified family
  if (panchayatFamilyIds.length > 0 || familyUuids.length > 0 || cleanPhone) {
    const filterClauses = [];
    panchayatFamilyIds.forEach((pid) => filterClauses.push(`panchayat_family_id.eq.${pid}`));
    familyUuids.forEach((fid) => filterClauses.push(`family_id.eq.${fid}`));
    if (cleanPhone) {
      filterClauses.push(`mobile_number.ilike.%${cleanPhone}%`);
    }

    if (filterClauses.length > 0) {
      const { data: matchedData, error: matchError } = await supabase
        .from('donations')
        .select('*')
        .or(filterClauses.join(','))
        .order('payment_date', { ascending: false });

      if (!matchError && matchedData && matchedData.length > 0) {
        return res.json({
          success: true,
          data: matchedData,
          family: primaryFamily,
          panchayatFamilyIds,
        });
      }
    }
  }

  // If staff/admin and no specific personal records found, return all donations for admin view
  if (isStaff) {
    const { data: allData, error: allError } = await supabase
      .from('donations')
      .select('*')
      .order('payment_date', { ascending: false });
    if (!allError) {
      return res.json({
        success: true,
        data: allData || [],
        isStaffView: true,
      });
    }
  }

  res.json({
    success: true,
    data: [],
    family: primaryFamily,
  });
});

// GET /api/donations/receipt/:receiptNumber (Strict family verification)
export const getReceiptByNumber = asyncHandler(async (req, res) => {
  const { receiptNumber } = req.params;
  const { data, error } = await supabase
    .from('donations')
    .select('*, families(id, panchayat_family_id, head_name, gotra, village, faliya_or_ward, head_mobile)')
    .eq('receipt_number', receiptNumber)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }

  // Strict Family Authorization Check:
  // If user is authenticated and not staff, ensure this receipt belongs to their family
  if (req.user) {
    const { familyUuids, panchayatFamilyIds, cleanPhone, isStaff } = await resolveUserFamily(req.user);
    if (!isStaff) {
      const isFamilyMatch =
        (data.family_id && familyUuids.includes(data.family_id)) ||
        (data.panchayat_family_id && panchayatFamilyIds.includes(String(data.panchayat_family_id))) ||
        (cleanPhone && data.mobile_number && data.mobile_number.includes(cleanPhone));

      if (!isFamilyMatch) {
        return res.status(403).json({
          success: false,
          message: 'इस परिवार की रसीद देखने अथवा डाउनलोड करने की अनुमति नहीं है (You are not authorized to view receipts of another family)',
        });
      }
    }
  }

  res.json({ success: true, data });
});

// POST /api/donations (Record Donation / Cashier Entry with Family Mapping)
export const createDonation = asyncHandler(async (req, res) => {
  const {
    family_id,
    panchayat_family_id,
    donor_name,
    gotra,
    mobile_number,
    financial_year = new Date().getFullYear(),
    amount,
    purpose = 'annual_chanda',
    payment_mode = 'cash',
    remarks,
    collected_by_name = req.user?.name || 'Treasurer',
  } = req.body;

  if (!donor_name || !amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Donor name and a valid amount are required' });
  }

  let resolvedFamilyId = family_id || null;
  let resolvedPanchayatId = panchayat_family_id ? String(panchayat_family_id) : null;
  let resolvedGotra = gotra || null;

  // Auto-resolve family UUID or Panchayat ID from families table
  if (resolvedPanchayatId && !resolvedFamilyId) {
    const { data: fam } = await supabase
      .from('families')
      .select('id, panchayat_family_id, gotra')
      .eq('panchayat_family_id', resolvedPanchayatId)
      .maybeSingle();
    if (fam) {
      resolvedFamilyId = fam.id;
      if (!resolvedGotra) resolvedGotra = fam.gotra;
    }
  } else if (resolvedFamilyId && !resolvedPanchayatId) {
    const { data: fam } = await supabase
      .from('families')
      .select('id, panchayat_family_id, gotra')
      .eq('id', resolvedFamilyId)
      .maybeSingle();
    if (fam) {
      resolvedPanchayatId = String(fam.panchayat_family_id);
      if (!resolvedGotra) resolvedGotra = fam.gotra;
    }
  } else if (!resolvedFamilyId && !resolvedPanchayatId && mobile_number) {
    const clean = mobile_number.trim().replace(/\D/g, '').slice(-10);
    if (clean) {
      const { data: fam } = await supabase
        .from('families')
        .select('id, panchayat_family_id, gotra')
        .ilike('head_mobile', `%${clean}%`)
        .maybeSingle();
      if (fam) {
        resolvedFamilyId = fam.id;
        resolvedPanchayatId = String(fam.panchayat_family_id);
        if (!resolvedGotra) resolvedGotra = fam.gotra;
      }
    }
  }

  // Generate clean, collision-safe receipt number with family code
  const randHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  const famCode = resolvedPanchayatId ? `F${resolvedPanchayatId}` : 'KONDA';
  const receipt_number = `KONDA-${financial_year}-${famCode}-${randHex}`;

  const { data: donation, error } = await supabase
    .from('donations')
    .insert({
      family_id: resolvedFamilyId,
      panchayat_family_id: resolvedPanchayatId,
      donor_name,
      gotra: resolvedGotra,
      mobile_number: mobile_number || null,
      financial_year: Number(financial_year),
      amount: Number(amount),
      purpose,
      payment_mode,
      payment_status: 'confirmed',
      receipt_number,
      collected_by_name,
      collected_by_user_id: req.user?.id || null,
      notes: remarks || null,
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  clearCacheByPattern('donations');
  clearCacheByPattern('dashboard');

  res.status(201).json({
    success: true,
    message: 'Donation recorded and family receipt generated successfully',
    data: donation,
  });
});

// PUT /api/donations/:id (Treasurer Correction with Audit Trail)
export const updateDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { edit_reason, ...fieldsToUpdate } = req.body;

  // Fetch current donation to build audit log
  const { data: currentDonation } = await supabase
    .from('donations')
    .select('amount, purpose, edit_history')
    .eq('id', id)
    .single();

  const currentHistory = currentDonation?.edit_history || [];
  const newHistoryEntry = {
    modified_at: new Date().toISOString(),
    modified_by: req.user?.name || 'Treasurer',
    modified_by_id: req.user?.id,
    old_amount: currentDonation?.amount,
    new_amount: fieldsToUpdate.amount || currentDonation?.amount,
    reason: edit_reason || 'Correction',
  };

  const { data: updatedDonation, error } = await supabase
    .from('donations')
    .update({
      ...fieldsToUpdate,
      edit_history: [...currentHistory, newHistoryEntry],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  clearCacheByPattern('donations');
  clearCacheByPattern('dashboard');

  res.json({
    success: true,
    message: 'Payment details updated successfully',
    data: updatedDonation,
  });
});

// DELETE /api/donations/:id
export const deleteDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('donations').delete().eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  clearCacheByPattern('donations');
  clearCacheByPattern('dashboard');

  res.json({ success: true, message: 'Donation record deleted successfully' });
});

export const recordDonation = createDonation;
