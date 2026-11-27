import supabase from '../config/supabase.js';

/**
 * Resolves all family identifiers (UUIDs and numeric panchayat IDs) for a user
 * based on users table, families table (head), and family_members table.
 */
export const resolveUserFamily = async (user) => {
  if (!user) {
    return {
      familyUuids: [],
      panchayatFamilyIds: [],
      cleanPhone: '',
      isStaff: false,
      primaryFamily: null,
      familyMembers: [],
    };
  }

  const isStaff = ['developer', 'super_admin', 'admin', 'treasurer'].includes(user.role);
  const cleanPhone = (user.phone || '').trim().replace(/\D/g, '').slice(-10);

  const familyUuids = new Set();
  const panchayatFamilyIds = new Set();
  let primaryFamily = null;
  const familyMemberNames = new Set();

  if (user.family_id) {
    familyUuids.add(user.family_id);
  }
  if (user.panchayat_family_id) {
    panchayatFamilyIds.add(String(user.panchayat_family_id));
  }
  if (user.name) {
    familyMemberNames.add(user.name.trim());
  }

  // 1. Check families table (where user is Head of Family by phone)
  if (cleanPhone) {
    const { data: headFamilies } = await supabase
      .from('families')
      .select('id, panchayat_family_id, head_name, gotra, village')
      .ilike('head_mobile', `%${cleanPhone}%`);

    if (headFamilies && headFamilies.length > 0) {
      headFamilies.forEach((f) => {
        if (f.id) familyUuids.add(f.id);
        if (f.panchayat_family_id) panchayatFamilyIds.add(String(f.panchayat_family_id));
        if (f.head_name) familyMemberNames.add(f.head_name.trim());
        if (!primaryFamily) primaryFamily = f;
      });
    }

    // 2. Check family_members table (where user is a Family Member by phone)
    const { data: memberRecords } = await supabase
      .from('family_members')
      .select('family_id, first_name, last_name, full_name, families(id, panchayat_family_id, head_name, gotra, village)')
      .ilike('mobile_number', `%${cleanPhone}%`);

    if (memberRecords && memberRecords.length > 0) {
      memberRecords.forEach((m) => {
        if (m.family_id) familyUuids.add(m.family_id);
        if (m.families?.id) familyUuids.add(m.families.id);
        if (m.families?.panchayat_family_id) panchayatFamilyIds.add(String(m.families.panchayat_family_id));
        if (m.full_name) familyMemberNames.add(m.full_name.trim());
        if (m.families?.head_name) familyMemberNames.add(m.families.head_name.trim());
        if (!primaryFamily && m.families) primaryFamily = m.families;
      });
    }
  }

  // 3. If still not resolved but user.panchayat_family_id was present, fetch family details
  if (user.panchayat_family_id && !primaryFamily) {
    const { data: famData } = await supabase
      .from('families')
      .select('id, panchayat_family_id, head_name, gotra, village')
      .eq('panchayat_family_id', String(user.panchayat_family_id))
      .maybeSingle();

    if (famData) {
      familyUuids.add(famData.id);
      if (famData.head_name) familyMemberNames.add(famData.head_name.trim());
      primaryFamily = famData;
    }
  }

  // 4. Fetch all member names in this family for broader Lekha-Jokha matching
  if (familyUuids.size > 0) {
    const { data: allMembersInFamily } = await supabase
      .from('family_members')
      .select('full_name, first_name, last_name')
      .in('family_id', Array.from(familyUuids));

    if (allMembersInFamily && allMembersInFamily.length > 0) {
      allMembersInFamily.forEach((m) => {
        if (m.full_name) familyMemberNames.add(m.full_name.trim());
        const combined = `${m.first_name || ''} ${m.last_name || ''}`.trim();
        if (combined) familyMemberNames.add(combined);
      });
    }
  }

  return {
    familyUuids: Array.from(familyUuids).filter(Boolean),
    panchayatFamilyIds: Array.from(panchayatFamilyIds).filter(Boolean),
    cleanPhone,
    isStaff,
    primaryFamily,
    familyMemberNames: Array.from(familyMemberNames).filter(Boolean),
  };
};

/**
 * Fetches unified receipts across ALL modules (Donations + Lekha Jokha) for a family.
 */
export const fetchUnifiedFamilyReceipts = async (user) => {
  const {
    familyUuids,
    panchayatFamilyIds,
    cleanPhone,
    isStaff,
    primaryFamily,
    familyMemberNames,
  } = await resolveUserFamily(user);

  const unifiedList = [];
  const seenReceiptNumbers = new Set();

  // Helper to add unified receipt
  const addReceipt = (r) => {
    const key = (r.receipt_number || r.id || '').toString().trim().toLowerCase();
    if (key && seenReceiptNumbers.has(key)) return;
    if (key) seenReceiptNumbers.add(key);
    unifiedList.push(r);
  };

  // 1. Fetch from Donations table
  if (panchayatFamilyIds.length > 0 || familyUuids.length > 0 || cleanPhone) {
    const filterClauses = [];
    panchayatFamilyIds.forEach((pid) => filterClauses.push(`panchayat_family_id.eq.${pid}`));
    familyUuids.forEach((fid) => filterClauses.push(`family_id.eq.${fid}`));
    if (cleanPhone) filterClauses.push(`mobile_number.ilike.%${cleanPhone}%`);

    if (filterClauses.length > 0) {
      const { data: donData } = await supabase
        .from('donations')
        .select('*, families(id, panchayat_family_id, head_name, gotra, village)')
        .or(filterClauses.join(','))
        .order('payment_date', { ascending: false });

      (donData || []).forEach((d) => {
        addReceipt({
          id: d.id,
          receipt_number: d.receipt_number,
          panchayat_family_id: d.panchayat_family_id || d.families?.panchayat_family_id || primaryFamily?.panchayat_family_id,
          family_id: d.family_id || d.families?.id || primaryFamily?.id,
          donor_name: d.donor_name,
          head_name: d.families?.head_name || primaryFamily?.head_name || d.donor_name,
          gotra: d.gotra || d.families?.gotra || primaryFamily?.gotra,
          mobile_number: d.mobile_number,
          amount: Number(d.amount || 0),
          purpose: d.purpose || 'annual_chanda',
          payment_mode: d.payment_mode || 'cash',
          payment_status: d.payment_status || 'confirmed',
          payment_date: d.payment_date || d.created_at,
          source: 'दान एवं चंदा (Donations)',
          notes: d.notes,
          financial_year: d.financial_year || new Date().getFullYear(),
          created_at: d.created_at,
        });
      });
    }
  }

  // 2. Fetch from Lekha-Jokha (income entries with receipts)
  const { data: allIncomeLekha } = await supabase
    .from('lekha_jokha')
    .select('*')
    .eq('entry_type', 'income')
    .order('entry_date', { ascending: false });

  (allIncomeLekha || []).forEach((lj) => {
    // Check if this lekha_jokha entry belongs to the user's family
    let isMatch = false;

    // Check by family_id or panchayat_family_id if present
    if (lj.family_id && familyUuids.includes(lj.family_id)) isMatch = true;
    if (lj.panchayat_family_id && panchayatFamilyIds.includes(String(lj.panchayat_family_id))) isMatch = true;

    // Check by person_name matching any family member or head name
    if (!isMatch && lj.person_name) {
      const pName = lj.person_name.trim().toLowerCase();
      for (const mName of familyMemberNames) {
        if (!mName) continue;
        const cleanM = mName.trim().toLowerCase();
        if (pName.includes(cleanM) || cleanM.includes(pName)) {
          isMatch = true;
          break;
        }
      }
    }

    if (isMatch) {
      addReceipt({
        id: lj.id,
        receipt_number: lj.receipt_or_bill_no || `REC-${new Date(lj.entry_date || Date.now()).getFullYear()}-${lj.id.slice(0, 4).toUpperCase()}`,
        panchayat_family_id: lj.panchayat_family_id || primaryFamily?.panchayat_family_id || '—',
        family_id: lj.family_id || primaryFamily?.id || null,
        donor_name: lj.person_name || primaryFamily?.head_name,
        head_name: primaryFamily?.head_name || lj.person_name,
        gotra: primaryFamily?.gotra || '—',
        mobile_number: lj.mobile_number || cleanPhone,
        amount: Number(lj.amount || 0),
        purpose: lj.category || 'annual_chanda',
        payment_mode: lj.payment_method || 'cash',
        payment_status: 'confirmed',
        payment_date: lj.entry_date || lj.created_at,
        source: 'लेखा-जोखा (Lekha-Jokha)',
        notes: lj.title ? `${lj.title}${lj.notes ? ` - ${lj.notes}` : ''}` : lj.notes,
        financial_year: new Date(lj.entry_date || lj.created_at || Date.now()).getFullYear(),
        created_at: lj.created_at,
      });
    }
  });

  // 3. If staff/admin and no personal records found, return all records
  if (isStaff && unifiedList.length === 0) {
    const { data: allDons } = await supabase
      .from('donations')
      .select('*, families(id, panchayat_family_id, head_name, gotra, village)')
      .order('payment_date', { ascending: false });

    (allDons || []).forEach((d) => {
      addReceipt({
        id: d.id,
        receipt_number: d.receipt_number,
        panchayat_family_id: d.panchayat_family_id || d.families?.panchayat_family_id || '—',
        family_id: d.family_id || d.families?.id,
        donor_name: d.donor_name,
        head_name: d.families?.head_name || d.donor_name,
        gotra: d.gotra || d.families?.gotra || '—',
        mobile_number: d.mobile_number,
        amount: Number(d.amount || 0),
        purpose: d.purpose || 'annual_chanda',
        payment_mode: d.payment_mode || 'cash',
        payment_status: d.payment_status || 'confirmed',
        payment_date: d.payment_date || d.created_at,
        source: 'दान एवं चंदा (Donations)',
        notes: d.notes,
        financial_year: d.financial_year || new Date().getFullYear(),
        created_at: d.created_at,
      });
    });

    (allIncomeLekha || []).forEach((lj) => {
      addReceipt({
        id: lj.id,
        receipt_number: lj.receipt_or_bill_no || `REC-${new Date(lj.entry_date || Date.now()).getFullYear()}-${lj.id.slice(0, 4).toUpperCase()}`,
        panchayat_family_id: lj.panchayat_family_id || '—',
        family_id: lj.family_id,
        donor_name: lj.person_name,
        head_name: lj.person_name,
        gotra: '—',
        mobile_number: lj.mobile_number,
        amount: Number(lj.amount || 0),
        purpose: lj.category || 'annual_chanda',
        payment_mode: lj.payment_method || 'cash',
        payment_status: 'confirmed',
        payment_date: lj.entry_date || lj.created_at,
        source: 'लेखा-जोखा (Lekha-Jokha)',
        notes: lj.title ? `${lj.title}${lj.notes ? ` - ${lj.notes}` : ''}` : lj.notes,
        financial_year: new Date(lj.entry_date || lj.created_at || Date.now()).getFullYear(),
        created_at: lj.created_at,
      });
    });
  }

  // Sort chronologically descending
  unifiedList.sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at));

  return {
    receipts: unifiedList,
    primaryFamily,
    panchayatFamilyIds,
    isStaff,
  };
};

/**
 * Automatically syncs any existing donation records in the database
 * to ensure family_id UUID is mapped if panchayat_family_id exists.
 */
export const syncExistingDonationsWithFamilies = async () => {
  try {
    const { data: unlinkedDonations } = await supabase
      .from('donations')
      .select('id, panchayat_family_id, mobile_number, family_id')
      .is('family_id', null);

    if (!unlinkedDonations || unlinkedDonations.length === 0) return;

    for (const don of unlinkedDonations) {
      let matchedFamily = null;
      if (don.panchayat_family_id) {
        const { data: fam } = await supabase
          .from('families')
          .select('id, panchayat_family_id')
          .eq('panchayat_family_id', String(don.panchayat_family_id))
          .maybeSingle();
        matchedFamily = fam;
      }

      if (!matchedFamily && don.mobile_number) {
        const clean = don.mobile_number.trim().replace(/\D/g, '').slice(-10);
        if (clean) {
          const { data: fam } = await supabase
            .from('families')
            .select('id, panchayat_family_id')
            .ilike('head_mobile', `%${clean}%`)
            .maybeSingle();
          matchedFamily = fam;
        }
      }

      if (matchedFamily?.id) {
        await supabase
          .from('donations')
          .update({
            family_id: matchedFamily.id,
            panchayat_family_id: String(matchedFamily.panchayat_family_id || don.panchayat_family_id),
          })
          .eq('id', don.id);
      }
    }
  } catch (err) {
    console.error('Error syncing existing donations with families:', err);
  }
};
