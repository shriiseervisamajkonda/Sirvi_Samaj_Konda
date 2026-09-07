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
    };
  }

  const isStaff = ['developer', 'super_admin', 'admin', 'treasurer'].includes(user.role);
  const cleanPhone = (user.phone || '').trim().replace(/\D/g, '').slice(-10);

  const familyUuids = new Set();
  const panchayatFamilyIds = new Set();
  let primaryFamily = null;

  if (user.family_id) {
    familyUuids.add(user.family_id);
  }
  if (user.panchayat_family_id) {
    panchayatFamilyIds.add(String(user.panchayat_family_id));
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
      primaryFamily = famData;
    }
  }

  return {
    familyUuids: Array.from(familyUuids).filter(Boolean),
    panchayatFamilyIds: Array.from(panchayatFamilyIds).filter(Boolean),
    cleanPhone,
    isStaff,
    primaryFamily,
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
