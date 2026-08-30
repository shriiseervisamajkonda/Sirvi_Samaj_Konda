import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

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

  const totalCollected = (allDonations || []).reduce((acc, d) => acc + Number(d.amount || 0), 0);
  const currentYearCollected = (allDonations || [])
    .filter((d) => d.financial_year === currentYear)
    .reduce((acc, d) => acc + Number(d.amount || 0), 0);

  const byPurpose = (allDonations || []).reduce((acc, d) => {
    acc[d.purpose] = (acc[d.purpose] || 0) + Number(d.amount || 0);
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      totalCollected,
      currentYearCollected,
      totalRecords: allDonations?.length || 0,
      byPurpose,
    },
  });
});

// GET /api/donations/receipt/:receiptNumber (Dynamic Receipt Lookup)
export const getReceiptByNumber = asyncHandler(async (req, res) => {
  const { receiptNumber } = req.params;

  const { data: donation, error } = await supabase
    .from('donations')
    .select('*, families(head_name, gotra, village, faliya_or_ward, head_mobile)')
    .eq('receipt_number', receiptNumber)
    .maybeSingle();

  if (error || !donation) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }

  res.json({ success: true, data: donation });
});

// POST /api/donations (Record Cash / Offline / UPI Payment)
export const recordDonation = asyncHandler(async (req, res) => {
  const {
    family_id,
    donor_name,
    panchayat_family_id,
    gotra,
    mobile_number,
    financial_year = new Date().getFullYear(),
    amount,
    purpose = 'annual_chanda',
    payment_mode = 'cash',
    receipt_number,
    receipt_book_number,
    collected_by_name,
    notes,
  } = req.body;

  if (!amount || Number(amount) <= 0 || !donor_name) {
    return res.status(400).json({ success: false, message: 'Valid amount and donor name are required' });
  }

  // Auto-generate receipt number if not provided
  const generatedReceiptNo = receipt_number || `KONDA-${financial_year}-${Date.now().toString().slice(-4)}`;

  const { data: donation, error } = await supabase
    .from('donations')
    .insert({
      family_id: family_id || null,
      donor_name,
      panchayat_family_id: panchayat_family_id ? String(panchayat_family_id) : null,
      gotra: gotra || null,
      mobile_number: mobile_number || null,
      financial_year: Number(financial_year),
      amount: Number(amount),
      purpose,
      payment_mode,
      payment_status: 'confirmed',
      receipt_number: generatedReceiptNo,
      receipt_book_number: receipt_book_number || null,
      collected_by_name: collected_by_name || req.user?.name || 'Treasurer',
      collected_by_user_id: req.user?.id || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.status(201).json({
    success: true,
    message: 'Donation recorded successfully',
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

  res.json({ success: true, message: 'Donation record deleted successfully' });
});
