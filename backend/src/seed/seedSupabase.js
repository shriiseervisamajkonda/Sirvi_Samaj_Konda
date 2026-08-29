import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';

dotenv.config();

const seedSupabase = async () => {
  console.log('🌱 Starting Supabase Baseline Data Seed...');

  if (!supabase) {
    console.error('❌ Supabase client is not configured. Check .env variables.');
    process.exit(1);
  }

  try {
    // 1. Seed Roles
    console.log('1️⃣ Seeding Dynamic RBAC Roles...');
    const rolesData = [
      {
        name: 'developer',
        display_name_en: 'Developer / Super Admin',
        display_name_hi: 'डेवलपर / सुपर एडमिन',
        permissions: ['*'],
        description: 'Master access to database, system configurations, and all modules',
        is_system_role: true,
      },
      {
        name: 'admin',
        display_name_en: 'Executive Admin',
        display_name_hi: 'कार्यकारी एडमिन',
        permissions: [
          'families:read', 'families:write',
          'members:read', 'members:write',
          'news:read', 'news:write',
          'events:read', 'events:write',
          'committees:read', 'committees:write',
          'gallery:read', 'gallery:write',
          'documents:read', 'documents:write',
          'blood_donors:read', 'blood_donors:write',
          'panch_settlements:read', 'panch_settlements:write',
          'lekha_jokha:read', 'lekha_jokha:write',
          'marriage_profiles:read', 'marriage_profiles:write',
        ],
        description: 'Administrative control over community records, news, and events',
        is_system_role: true,
      },
      {
        name: 'treasurer',
        display_name_en: 'Treasurer / Cashier',
        display_name_hi: 'कोषाध्यक्ष / खजांची',
        permissions: [
          'donations:read', 'donations:write',
          'families:read', 'members:read',
          'lekha_jokha:read', 'lekha_jokha:write',
        ],
        description: 'Manages yearly chanda, donation receipts, and WhatsApp receipt sharing',
        is_system_role: true,
      },
      {
        name: 'member',
        display_name_en: 'Community Member / Family Head',
        display_name_hi: 'समाज सदस्य / परिवार मुखिया',
        permissions: ['public:read', 'personal_receipts:read'],
        description: 'Read-only access to community directory and personal receipts',
        is_system_role: true,
      },
    ];

    for (const role of rolesData) {
      const { error } = await supabase
        .from('roles')
        .upsert(role, { onConflict: 'name' });
      if (error) console.warn(`Warning upserting role ${role.name}:`, error.message);
      else console.log(`   ✅ Role upserted: ${role.display_name_en}`);
    }

    // 2. Seed Village Information
    console.log('2️⃣ Seeding Village Information...');
    const villageData = {
      community_name_en: 'Shri Seervi Samaj Konda',
      community_name_hi: 'श्री सीरवी समाज कोणदा',
      village_en: 'Konda',
      village_hi: 'कोणदा',
      tehsil_en: 'Kukshi',
      tehsil_hi: 'कुक्षी',
      district_en: 'Dhar',
      district_hi: 'धार',
      state_en: 'Madhya Pradesh',
      state_hi: 'मध्यप्रदेश',
      pin_code: '454335',
      country_en: 'India',
      country_hi: 'भारत',
      spiritual_seat_en: 'Shri Aai Mataji Bader & Akhand Jyot',
      spiritual_seat_hi: 'श्री आई माताजी बडेर एवं अखंड ज्योति',
      history_en: 'Shri Seervi Samaj Konda represents the proud Kshatriya heritage, religious tradition of Aai Mataji, and continuous development in Kukshi tehsil, Dhar district.',
      history_hi: 'श्री सीरवी समाज कोणदा आई पंथ के 11 नियमों एवं क्षत्रिय परंपरा का पालन करने वाला गौरवशाली समाज है।',
      known_gotras: [
        'chouhan', 'bhayal', 'kag', 'pawar', 'solanki',
        'choyal', 'padiyar', 'gehlot', 'agalcha', 'lacheta',
        'rathore', 'shinada', 'barfa', 'hammad', 'sencha',
      ],
      emergency_contacts: [
        { name: 'कुक्षी पुलिस थाना', phone: '07297-234220' },
        { name: 'सामुदायिक स्वास्थ्य केंद्र कुक्षी', phone: '07297-234233' },
        { name: 'ग्राम पंचायत कोणदा', phone: '+91-9981644585' },
      ],
    };

    const { data: existingVillage } = await supabase.from('village_information').select('id').limit(1);
    if (!existingVillage || existingVillage.length === 0) {
      const { error: vError } = await supabase.from('village_information').insert(villageData);
      if (vError) console.warn('Warning inserting village info:', vError.message);
      else console.log('   ✅ Village Information seeded');
    } else {
      console.log('   ℹ️ Village Information already exists');
    }

    // 3. Seed Sample Family & Members (Family #1)
    console.log('3️⃣ Seeding Sample Census Family #1...');
    const { data: existingFam } = await supabase
      .from('families')
      .select('id')
      .eq('panchayat_family_id', '1')
      .maybeSingle();

    let familyId = existingFam?.id;

    if (!familyId) {
      const { data: newFam, error: fError } = await supabase
        .from('families')
        .insert({
          panchayat_family_id: '1',
          gotra: 'chouhan',
          head_name: 'Shantilal Mohan',
          head_mobile: '7724878027',
          land_area_acres: 3.0,
          land_details_text: '03 एकड़ (3 Acres)',
          village: 'Konda',
          tehsil: 'Kukshi',
          district: 'Dhar',
          state: 'Madhya Pradesh',
          pin_code: '454335',
          faliya_or_ward: 'माताजी फलिया',
          total_members: 4,
          status: 'active',
        })
        .select('id')
        .single();

      if (fError) {
        console.warn('Warning inserting family:', fError.message);
      } else {
        familyId = newFam.id;
        console.log(`   ✅ Family #1 created with UUID: ${familyId}`);

        // Insert Members
        const membersData = [
          {
            family_id: familyId,
            member_number: 1,
            first_name: 'Shantilal',
            last_name: 'Chouhan',
            full_name: 'Shantilal Mohan Chouhan',
            relation_to_head: 'self',
            relative_relation_type: 'father',
            relative_name: 'Mohan',
            is_head: true,
            dob: '1981-01-01',
            education: '6th',
            occupation: 'tailoring',
            mobile_number: '7724878027',
            gender: 'male',
            marital_status: 'married',
            blood_group: 'O+',
          },
          {
            family_id: familyId,
            member_number: 2,
            first_name: 'Urmila',
            last_name: 'Chouhan',
            full_name: 'Urmila Shantilal Chouhan',
            relation_to_head: 'spouse',
            relative_relation_type: 'husband',
            relative_name: 'Shantilal',
            is_head: false,
            dob: '1978-01-01',
            education: '2nd',
            occupation: 'homemaker',
            mobile_number: null,
            gender: 'female',
            marital_status: 'married',
          },
          {
            family_id: familyId,
            member_number: 3,
            first_name: 'Anil',
            last_name: 'Chouhan',
            full_name: 'Anil Shantilal Chouhan',
            relation_to_head: 'son',
            relative_relation_type: 'father',
            relative_name: 'Shantilal',
            is_head: false,
            dob: '1997-01-01',
            education: '8th',
            occupation: 'shopkeeper',
            mobile_number: '9981644564',
            gender: 'male',
            marital_status: 'single',
            blood_group: 'B+',
          },
          {
            family_id: familyId,
            member_number: 4,
            first_name: 'Sunil',
            last_name: 'Chouhan',
            full_name: 'Sunil Shantilal Chouhan',
            relation_to_head: 'son',
            relative_relation_type: 'father',
            relative_name: 'Shantilal',
            is_head: false,
            dob: '2003-01-01',
            education: '9th',
            occupation: 'agriculture',
            mobile_number: '7909784358',
            gender: 'male',
            marital_status: 'single',
            blood_group: 'O+',
          },
        ];

        const { error: mError } = await supabase.from('family_members').insert(membersData);
        if (mError) console.warn('Warning inserting family members:', mError.message);
        else console.log('   ✅ 4 Family Members seeded');

        // Create Family Head User Account (Password: 8027@1)
        const passwordHash = await bcrypt.hash('8027@1', 10);
        await supabase.from('users').insert({
          name: 'Shantilal Mohan Chouhan',
          phone: '7724878027',
          password_hash: passwordHash,
          role: 'member',
          panchayat_family_id: '1',
          is_active: true,
        });
        console.log('   ✅ Family Head user account created (Login: 7724878027 / 8027@1)');
      }
    } else {
      console.log('   ℹ️ Family #1 already exists in Supabase');
    }

    // 4. Seed Sample Donation for 2026
    console.log('4️⃣ Seeding Sample Donation for Family #1...');
    const { data: existingDon } = await supabase
      .from('donations')
      .select('id')
      .eq('receipt_number', 'KONDA-2026-0001')
      .maybeSingle();

    if (!existingDon && familyId) {
      await supabase.from('donations').insert({
        family_id: familyId,
        donor_name: 'Shantilal Mohan Chouhan',
        panchayat_family_id: '1',
        gotra: 'chouhan',
        mobile_number: '7724878027',
        financial_year: 2026,
        amount: 1100.0,
        purpose: 'annual_chanda',
        payment_mode: 'cash',
        payment_status: 'confirmed',
        receipt_number: 'KONDA-2026-0001',
        collected_by_name: 'Kailash Agalcha (Treasurer)',
      });
      console.log('   ✅ Sample 2026 Annual Chanda donation recorded');
    }

    console.log('\n🎉 Supabase Seed Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Supabase Seed Error:', err.message);
    process.exit(1);
  }
};

seedSupabase();
