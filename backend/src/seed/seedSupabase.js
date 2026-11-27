import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedSupabase = async () => {
  console.log('🌱 Starting Fast Batch Supabase Seed & Census Import...');

  if (!supabase) {
    console.error('❌ Supabase client is not configured.');
    process.exit(1);
  }

  try {
    // 1. Roles
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
      await supabase.from('roles').upsert(role, { onConflict: 'name' });
    }
    console.log('   ✅ Roles upserted.');

    // 2. Village Info
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
        'rathore', 'shinada', 'barfa', 'septa', 'sencha', 'parihar',
      ],
      emergency_contacts: [
        { name: 'कुक्षी पुलिस थाना', phone: '07297-234220' },
        { name: 'सामुदायिक स्वास्थ्य केंद्र कुक्षी', phone: '07297-234233' },
        { name: 'ग्राम पंचायत कोणदा', phone: '+91-9981644585' },
      ],
    };

    const { data: existingVillage } = await supabase.from('village_information').select('id').limit(1);
    if (!existingVillage || existingVillage.length === 0) {
      await supabase.from('village_information').insert(villageData);
    }
    console.log('   ✅ Village Information ready.');

    // 3. Admin Account
    console.log('3️⃣ Seeding Master Admin Account...');
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'shriseervisamajkonda@gmail.com';
    const adminPhone = process.env.SUPER_ADMIN_PHONE || '9981644585';

    await supabase.from('users').upsert({
      name: 'Super Admin (श्री सीरवी समाज कोणदा)',
      email: adminEmail,
      phone: adminPhone,
      password_hash: adminPasswordHash,
      role: 'developer',
      is_active: true,
    }, { onConflict: 'phone' });
    console.log(`   ✅ Master Super Admin created (${adminEmail} | ${adminPassword})`);

    // 4. Parse CSV & Bulk Insert
    console.log('4️⃣ Parsing Census CSV...');
    const csvPath = path.resolve(__dirname, '../../../docs/sirvi_samaj_konda_census.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
    const rows = lines.slice(1);

    const familiesMap = new Map();

    for (const row of rows) {
      const cols = row.split(',');
      if (cols.length < 17) continue;

      const [
        panchayat_family_id,
        gotra,
        land_area,
        faliya_or_ward,
        member_number,
        name_hi,
        relative_relation_type,
        relative_name,
        is_head,
        dob,
        approximate_age,
        gender,
        education,
        occupation,
        mobile_number,
        blood_group,
        marital_status,
      ] = cols;

      if (!familiesMap.has(panchayat_family_id)) {
        familiesMap.set(panchayat_family_id, {
          panchayat_family_id,
          gotra: gotra.trim().toLowerCase(),
          land_details_text: land_area ? land_area.trim() : null,
          faliya_or_ward: faliya_or_ward ? faliya_or_ward.trim() : null,
          head_name: '',
          head_mobile: null,
          members: [],
        });
      }

      const famObj = familiesMap.get(panchayat_family_id);
      const isHeadBool = is_head.trim().toUpperCase() === 'TRUE';

      const memberObj = {
        member_number: parseInt(member_number, 10) || (famObj.members.length + 1),
        first_name: name_hi.trim(),
        full_name: `${name_hi.trim()} (${relative_relation_type.trim()} ${relative_name.trim()})`,
        relative_relation_type: relative_relation_type.trim().toLowerCase() === 'husband' ? 'husband' : 'father',
        relative_name: relative_name.trim(),
        relation_to_head: isHeadBool ? 'self' : (relative_relation_type.trim().toLowerCase() === 'husband' ? 'spouse' : 'other'),
        is_head: isHeadBool,
        dob: dob.trim() || null,
        approximate_age: parseInt(approximate_age, 10) || null,
        gender: gender.trim().toLowerCase() === 'female' ? 'female' : 'male',
        education: education.trim() || null,
        occupation: occupation.trim() || null,
        mobile_number: mobile_number.trim() || null,
        blood_group: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(blood_group?.trim()) ? blood_group.trim() : 'unknown',
        marital_status: ['married', 'single', 'widowed', 'divorced'].includes(marital_status?.trim()) ? marital_status.trim() : 'single',
      };

      if (isHeadBool || !famObj.head_name) {
        famObj.head_name = name_hi.trim();
        if (mobile_number && mobile_number.trim()) {
          famObj.head_mobile = mobile_number.trim();
        }
      }

      famObj.members.push(memberObj);
    }

    console.log(`   📊 Preparing bulk upsert for ${familiesMap.size} families...`);

    // Prepare Families Bulk Array
    const familiesToUpsert = [];
    for (const fam of familiesMap.values()) {
      familiesToUpsert.push({
        panchayat_family_id: fam.panchayat_family_id,
        gotra: fam.gotra,
        head_name: fam.head_name || `Family #${fam.panchayat_family_id}`,
        head_mobile: fam.head_mobile,
        land_details_text: fam.land_details_text,
        faliya_or_ward: fam.faliya_or_ward,
        village: 'Konda',
        tehsil: 'Kukshi',
        district: 'Dhar',
        state: 'Madhya Pradesh',
        pin_code: '454335',
        total_members: fam.members.length,
        status: 'active',
      });
    }

    // Upsert families in chunks of 50
    const chunkSize = 50;
    const insertedFamilies = [];
    for (let i = 0; i < familiesToUpsert.length; i += chunkSize) {
      const chunk = familiesToUpsert.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('families')
        .upsert(chunk, { onConflict: 'panchayat_family_id' })
        .select('id, panchayat_family_id');

      if (error) {
        console.error('Error inserting families chunk:', error.message);
      } else if (data) {
        insertedFamilies.push(...data);
      }
    }

    console.log(`   ✅ ${insertedFamilies.length} Families synchronized in database.`);

    // Map panchayat_family_id to UUID
    const familyUuidMap = new Map();
    insertedFamilies.forEach(f => familyUuidMap.set(f.panchayat_family_id, f.id));

    // Prepare Members Bulk Array
    const membersToInsert = [];
    for (const fam of familiesMap.values()) {
      const familyUuid = familyUuidMap.get(fam.panchayat_family_id);
      if (!familyUuid) continue;

      for (const m of fam.members) {
        membersToInsert.push({
          family_id: familyUuid,
          member_number: m.member_number,
          first_name: m.first_name,
          full_name: m.full_name,
          relation_to_head: m.relation_to_head,
          relative_relation_type: m.relative_relation_type,
          relative_name: m.relative_name,
          is_head: m.is_head,
          dob: m.dob,
          approximate_age: m.approximate_age,
          gender: m.gender,
          education: m.education,
          occupation: m.occupation,
          mobile_number: m.mobile_number,
          blood_group: m.blood_group,
          marital_status: m.marital_status,
        });
      }
    }

    console.log(`   📊 Inserting ${membersToInsert.length} members in batch chunks...`);
    // Clear old members first
    await supabase.from('family_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    let totalMembersInserted = 0;
    for (let i = 0; i < membersToInsert.length; i += chunkSize) {
      const chunk = membersToInsert.slice(i, i + chunkSize);
      const { error } = await supabase.from('family_members').insert(chunk);
      if (error) {
        console.error('Error inserting members chunk:', error.message);
      } else {
        totalMembersInserted += chunk.length;
      }
    }

    console.log(`\n🎉 Census Import Summary:`);
    console.log(`   ✅ Total Families: ${insertedFamilies.length}`);
    console.log(`   ✅ Total Members Inserted: ${totalMembersInserted}`);
    console.log(`\n🎉 Supabase Database is 100% Seeded and Live!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Supabase Seed Error:', err.message);
    process.exit(1);
  }
};

seedSupabase();
