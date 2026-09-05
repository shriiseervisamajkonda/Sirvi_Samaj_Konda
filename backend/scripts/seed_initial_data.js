import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../src/config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seedData() {
  console.log('Starting Initial Database Seed for Shri Seervi Samaj Konda...');

  try {
    // 1. COMMITTEES
    console.log('Seeding Committees...');
    const committeesData = [
      // Sankal Panch
      { name: 'श्री शंकर जी वालाजी पवार', designation: 'सकल पंच / वरिष्ठ मार्गदर्शक', committee_type: 'sankal_panch', phone: '9981644585', order_priority: 1, is_active: true },
      { name: 'श्री खेमाजी दुदाजी गेहलोत', designation: 'सकल पंच / वरिष्ठ मार्गदर्शक', committee_type: 'sankal_panch', phone: '9755309933', order_priority: 2, is_active: true },
      { name: 'श्री कन्हैयालाल लालाजी भायल', designation: 'सकल पंच / वरिष्ठ मार्गदर्शक', committee_type: 'sankal_panch', phone: '7389089165', order_priority: 3, is_active: true },
      { name: 'श्री लक्ष्मण वालाजी काग', designation: 'सकल पंच / वरिष्ठ मार्गदर्शक', committee_type: 'sankal_panch', phone: '9893944986', order_priority: 4, is_active: true },
      { name: 'श्री सुनिल पन्नालाल जी भायल', designation: 'सकल पंच / वरिष्ठ मार्गदर्शक', committee_type: 'sankal_panch', phone: '9993339042', order_priority: 5, is_active: true },
      // Sahayata Kosh
      { name: 'शंकर जी वालाजी पवार', designation: 'अध्यक्ष', committee_type: 'sahayata_kosh', phone: '9981644585', order_priority: 1, is_active: true },
      { name: 'कैलाश जी रतनाजी अगल्चा', designation: 'उपाध्यक्ष', committee_type: 'sahayata_kosh', order_priority: 2, is_active: true },
      { name: 'कमलजी चेनाजी काग', designation: 'कोषाध्यक्ष', committee_type: 'sahayata_kosh', order_priority: 3, is_active: true },
      { name: 'अनिल जी हामाजी भायल', designation: 'सचिव', committee_type: 'sahayata_kosh', order_priority: 4, is_active: true },
      { name: 'शान्तिलाल जी काशिराम जी पवार', designation: 'सहसचिव', committee_type: 'sahayata_kosh', order_priority: 5, is_active: true },
      { name: 'मुकेश हिराजी पड़ियार', designation: 'कार्यकारिणी सदस्य', committee_type: 'sahayata_kosh', order_priority: 6, is_active: true },
      { name: 'टिकम जी मंगता जी शिंनदडा', designation: 'कार्यकारिणी सदस्य', committee_type: 'sahayata_kosh', order_priority: 7, is_active: true },
      { name: 'गोपाल जी रुखडुजी गेहलोत', designation: 'कार्यकारिणी सदस्य', committee_type: 'sahayata_kosh', order_priority: 8, is_active: true },
      { name: 'दिलीप मोतीलाल जी चोयल', designation: 'कार्यकारिणी सदस्य', committee_type: 'sahayata_kosh', order_priority: 9, is_active: true },
      { name: 'हुकुम कानाजी लछेटा', designation: 'कार्यकारिणी सदस्य', committee_type: 'sahayata_kosh', order_priority: 10, is_active: true },
      // Bhavan Samiti
      { name: 'शंकर वालाजी पवार', designation: 'संरक्षक / प्रमुख', committee_type: 'bhavan_samiti', phone: '9981644585', order_priority: 1, is_active: true },
      { name: 'खेमाजी दुदाजी गेहलोत', designation: 'संरक्षक / प्रमुख', committee_type: 'bhavan_samiti', phone: '9755309933', order_priority: 2, is_active: true },
      { name: 'कन्हैयालाल लालाजी भायल', designation: 'संरक्षक / प्रमुख', committee_type: 'bhavan_samiti', phone: '7389089165', order_priority: 3, is_active: true },
      { name: 'लक्ष्मण वालाजी काग', designation: 'संरक्षक / प्रमुख', committee_type: 'bhavan_samiti', phone: '9893944986', order_priority: 4, is_active: true },
      { name: 'सुनिल पन्नालाल जी भायल', designation: 'संरक्षक / प्रमुख', committee_type: 'bhavan_samiti', phone: '9993339042', order_priority: 5, is_active: true },
      // Women Committee
      { name: 'श्रीमती पुष्पा पवार', designation: 'अध्यक्ष', committee_type: 'women_committee', order_priority: 1, is_active: true },
      { name: 'श्रीमती संतोषी भायल', designation: 'उपाध्यक्ष', committee_type: 'women_committee', order_priority: 2, is_active: true },
      { name: 'श्रीमती निर्मला गेहलोत', designation: 'सचिव', committee_type: 'women_committee', order_priority: 3, is_active: true },
      { name: 'श्रीमती लीला काग', designation: 'कोषाध्यक्ष', committee_type: 'women_committee', order_priority: 4, is_active: true },
      { name: 'श्रीमती ममता सोलंकी', designation: 'कार्यकारिणी सदस्य', committee_type: 'women_committee', order_priority: 5, is_active: true },
      { name: 'श्रीमती रेखा चोयल', designation: 'कार्यकारिणी सदस्य', committee_type: 'women_committee', order_priority: 6, is_active: true }
    ];

    const { error: committeeErr } = await supabase.from('committees').insert(committeesData);
    if (committeeErr) console.error('Committees seed error:', committeeErr.message);
    else console.log(`✓ Seeded ${committeesData.length} committee members`);

    // 2. GRAM UNITS & MEMBERS
    console.log('Seeding Gram Unit...');
    const { data: unitData, error: unitErr } = await supabase.from('gram_units').insert({
      name: 'अखिल भारतीय सिर्वी महासभा - कोणदा ग्राम इकाई',
      village: 'कोणदा',
      tehsil: 'कुक्षी',
      district: 'धार',
      state: 'मध्यप्रदेश',
      total_households: 211,
      total_population: 1175,
      description: 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश के नवीन मनोनयन की प्रक्रिया के तहत कुक्षी तहसील के ग्राम कोणदा में ग्राम इकाई का गठन सर्वसम्मति से किया गया।'
    }).select().single();

    if (unitErr) {
      console.error('Gram unit error:', unitErr.message);
    } else if (unitData) {
      console.log('✓ Seeded Gram Unit:', unitData.name);
      const gramMembers = [
        { name: 'सुनिल/पन्नालाल जी भायल', designation: 'अध्यक्ष', category: 'office_bearer', order_priority: 1, is_active: true },
        { name: 'अजय/गोपाल जी शिनदडा', designation: 'महासचिव', category: 'office_bearer', order_priority: 2, is_active: true },
        { name: 'कन्हैयालाल/रत्न जी चोहान', designation: 'उपाध्यक्ष', category: 'office_bearer', order_priority: 3, is_active: true },
        { name: 'दिनेश/गोविंद जी लछेटा', designation: 'सचिव', category: 'office_bearer', order_priority: 4, is_active: true },
        { name: 'कैलाश/रत्नजी अगल्चा', designation: 'कोषाध्यक्ष', category: 'office_bearer', order_priority: 5, is_active: true },
        { name: 'जिवन /गोपाल जी सोलंकी', designation: 'सदस्य', category: 'member', order_priority: 6, is_active: true },
        { name: 'दिलीप/मोतीलाल जी चोयल', designation: 'सदस्य', category: 'member', order_priority: 7, is_active: true },
        { name: 'कमल/लक्ष्मण जी पड़ियार', designation: 'सदस्य', category: 'member', order_priority: 8, is_active: true },
        { name: 'सुनिल/शंकर जी गेहलोत', designation: 'सदस्य', category: 'member', order_priority: 9, is_active: true },
        { name: 'सुनील/मुन्नालाल पवार', designation: 'सदस्य', category: 'member', order_priority: 10, is_active: true },
        { name: 'रवि/पारस जी लछेटा', designation: 'सदस्य', category: 'member', order_priority: 11, is_active: true },
        { name: 'शान्तिलाल/काशिराम जी पवार', designation: 'तहसील प्रतिनिधि', category: 'representative', order_priority: 12, is_active: true },
        { name: 'मुकेश/हिराजी पड़ियार', designation: 'तहसील प्रतिनिधि', category: 'representative', order_priority: 13, is_active: true },
        { name: 'अनिल/हामाजी भायल', designation: 'तहसील प्रतिनिधि', category: 'representative', order_priority: 14, is_active: true },
        { name: 'महेन्द्र/मोहनजी काग', designation: 'तहसील प्रतिनिधि', category: 'representative', order_priority: 15, is_active: true },
        { name: 'कैलाश/मंगताजी राठौर', designation: 'तहसील प्रतिनिधि', category: 'representative', order_priority: 16, is_active: true },
        { name: 'जगदीश /देवाजी भायल', designation: 'जिला प्रतिनिधि', category: 'representative', order_priority: 17, is_active: true },
        { name: 'दिलीप/हामाजी चोयल', designation: 'जिला प्रतिनिधि', category: 'representative', order_priority: 18, is_active: true },
        { name: 'खेमाजी/दुदाजी गेहलोत', designation: 'जिला प्रतिनिधि', category: 'representative', order_priority: 19, is_active: true },
        { name: 'जितेन्द्र/देवाजी शिनदडा', designation: 'प्रदेश प्रतिनिधि', category: 'representative', order_priority: 20, is_active: true }
      ];
      const { error: gmErr } = await supabase.from('gram_unit_members').insert(gramMembers);
      if (gmErr) console.error('Gram unit members error:', gmErr.message);
      else console.log(`✓ Seeded ${gramMembers.length} gram unit members`);
    }

    // 3. SOCIAL INFO & REFORMS
    console.log('Seeding Social Info...');
    const socialData = [
      {
        title: 'सिर्वी समाज सामाजिक सुधार एवं नियमावली',
        category: 'rules',
        content: 'सिर्वी समाज कोणदा में सर्वसम्मति से पारित सामाजिक नियम:\n1. विवाह समारोह में सादगी एवं अनुशासन का पालन।\n2. मृत्युभोज एवं फिजूलखर्ची पर पूर्ण प्रतिबंध।\n3. बालिका शिक्षा एवं उच्च शिक्षा को प्रोत्साहन।\n4. व्यसन मुक्ति एवं सामाजिक सद्भाव बनाए रखना।',
        order_priority: 1,
        is_published: true
      },
      {
        title: 'श्री आई माताजी बडेर नियम व दर्शन समय',
        category: 'customs',
        content: 'श्री आई माताजी बडेर कोणदा में प्रतिदिन प्रातः 6:00 बजे एवं सायं 7:00 बजे महाआरती होती है। शुक्ल पक्ष की दूज को विशेष पूजा-अर्चना व अखंड ज्योत दर्शन का विधान है।',
        order_priority: 2,
        is_published: true
      },
      {
        title: 'श्री आईजी सहायता कोष नियमावली',
        category: 'reforms',
        content: 'समाज के जरूरतमंद परिवारों, चिकित्सा सहायता एवं मेधावी छात्र-छात्राओं की उच्च शिक्षा हेतु सहायता कोष संचालित है। आवेदन सकल पंच एवं समिति के समक्ष प्रस्तुत किए जा सकते हैं।',
        order_priority: 3,
        is_published: true
      }
    ];
    const { error: socErr } = await supabase.from('social_info').insert(socialData);
    if (socErr) console.error('Social info error:', socErr.message);
    else console.log(`✓ Seeded ${socialData.length} social info articles`);

    // 4. EVENTS
    console.log('Seeding Events...');
    const eventsData = [
      {
        title: 'श्री आई माताजी पाटोत्सव एवं विशाल मेला',
        description: 'वार्षिक पाटोत्सव, महाआरती, धर्मसभा एवं समाज के वरिष्ठजनों का सम्मान समारोह।',
        event_type: 'upcoming',
        start_date: new Date(Date.now() + 15 * 86400000).toISOString(),
        end_date: new Date(Date.now() + 16 * 86400000).toISOString(),
        location: 'श्री आई माताजी बडेर परिसर, कोणदा',
        status: 'published'
      },
      {
        title: 'सिर्वी समाज प्रतिभा सम्मान समारोह 2025',
        description: 'कक्षा 10वीं, 12वीं एवं उच्च शिक्षा में उत्कृष्ट प्रदर्शन करने वाले मेधावी छात्र-छात्राओं का सम्मान।',
        event_type: 'past',
        start_date: '2025-06-15T10:00:00Z',
        location: 'माँ अन्नपूर्णा भवन, कोणदा',
        status: 'published'
      }
    ];
    const { error: evErr } = await supabase.from('events').insert(eventsData);
    if (evErr) console.error('Events error:', evErr.message);
    else console.log(`✓ Seeded ${eventsData.length} events`);

    // 5. NEWS
    console.log('Seeding News...');
    const newsData = [
      {
        title: 'सिर्वी समाज कोणदा डिजिटल पोर्टल का शुभारंभ',
        excerpt: 'समाज के सभी परिवारों एवं सदस्यों के लिए ऑनलाइन जनगणना एवं सेवा पोर्टल लाइव हुआ।',
        content: 'श्री सीरवी समाज कोणदा के समग्र विकास, डिजिटल जनगणना, वार्षिक चंदा पारदर्शी प्रणाली एवं युवा-मातृशक्ति समन्वय हेतु आधिकारिक वेब पोर्टल का शुभारंभ किया गया।',
        category: 'news',
        is_featured: true,
        status: 'published',
        published_at: new Date().toISOString()
      },
      {
        title: 'माँ अन्नपूर्णा भवन निर्माण कार्य प्रगति पर',
        excerpt: 'भवन निर्माण हेतु समाजजनों का सहयोग एवं दान निरंतर प्राप्त हो रहा है।',
        content: 'समाज के नवनिर्मित माँ अन्नपूर्णा भवन का कार्य तीव्र गति से चल रहा है। सभी दानदाताओं का हार्दिक आभार।',
        category: 'announcement',
        is_featured: false,
        status: 'published',
        published_at: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ];
    const { error: newsErr } = await supabase.from('news').insert(newsData);
    if (newsErr) console.error('News error:', newsErr.message);
    else console.log(`✓ Seeded ${newsData.length} news items`);

    // 6. BLOOD DONORS
    console.log('Seeding Blood Donors...');
    const bloodDonorsData = [
      { name: 'अजय गोपाल जी शिनदडा', blood_group: 'O+', phone: '9981644585', village: 'कोणदा', is_available: true },
      { name: 'दिनेश गोविंद जी लछेटा', blood_group: 'B+', phone: '9755309933', village: 'कोणदा', is_available: true },
      { name: 'रवि पारस जी लछेटा', blood_group: 'A+', phone: '7389089165', village: 'कोणदा', is_available: true },
      { name: 'सुनील मुन्नालाल पवार', blood_group: 'AB+', phone: '9893944986', village: 'कोणदा', is_available: true }
    ];
    const { error: bdErr } = await supabase.from('blood_donors').insert(bloodDonorsData);
    if (bdErr) console.error('Blood donors error:', bdErr.message);
    else console.log(`✓ Seeded ${bloodDonorsData.length} blood donors`);

    // 7. DONATIONS & CHANDA
    console.log('Seeding Sample Donations...');
    const donationsData = [
      {
        donor_name: 'श्री शंकर जी वालाजी पवार',
        panchayat_family_id: '1',
        gotra: 'pawar',
        mobile_number: '9981644585',
        financial_year: 2026,
        amount: 2100.00,
        purpose: 'annual_chanda',
        payment_mode: 'cash',
        payment_status: 'confirmed',
        receipt_number: 'KONDA-2026-0001',
        collected_by_name: 'कैलाश जी अगल्चा (कोषाध्यक्ष)'
      },
      {
        donor_name: 'श्री खेमाजी दुदाजी गेहलोत',
        panchayat_family_id: '2',
        gotra: 'gehlot',
        mobile_number: '9755309933',
        financial_year: 2026,
        amount: 5100.00,
        purpose: 'annapurna_bhavan',
        payment_mode: 'upi_qr',
        payment_status: 'confirmed',
        receipt_number: 'KONDA-2026-0002',
        collected_by_name: 'कमलजी काग (कोषाध्यक्ष)'
      }
    ];
    const { error: donErr } = await supabase.from('donations').insert(donationsData);
    if (donErr) console.error('Donations error:', donErr.message);
    else console.log(`✓ Seeded ${donationsData.length} sample donations`);

    // 8. LEKHA JOKHA
    console.log('Seeding Lekha Jokha...');
    const lekhaData = [
      {
        title: 'वार्षिक चंदा प्राप्ति 2026',
        amount: 7200.00,
        entry_type: 'income',
        category: 'aaiji_kosh',
        payment_method: 'cash',
        receipt_or_bill_no: 'RCP-2026-01',
        person_name: 'सिर्वी समाज कोणदा'
      },
      {
        title: 'बडेर परिसर विद्युत एवं रख-रखाव व्यय',
        amount: 1500.00,
        entry_type: 'expense',
        category: 'dharmik_karya',
        payment_method: 'cash',
        receipt_or_bill_no: 'EXP-2026-01',
        person_name: 'रख-रखाव समिति'
      }
    ];
    const { error: ljErr } = await supabase.from('lekha_jokha').insert(lekhaData);
    if (ljErr) console.error('Lekha jokha error:', ljErr.message);
    else console.log(`✓ Seeded ${lekhaData.length} lekha jokha records`);

    // 9. PANCH SETTLEMENTS
    console.log('Seeding Panch Settlements...');
    const settlementsData = [
      {
        title: 'ग्राम सामाजिक विकास एवं आपसी समन्वय प्रस्ताव',
        parties: 'सकल पंच एवं ग्रामवासी कोणदा',
        description: 'ग्राम कोणदा के सामाजिक आयोजनों में सभी परिवारों की सक्रिय सहभागिता एवं एकता बनाए रखने हेतु सर्वसम्मत निर्णय।',
        panchs: 'श्री शंकर जी पवार, श्री खेमाजी गेहलोत, श्री कन्हैयालाल भायल',
        status: 'resolved'
      }
    ];
    const { error: psErr } = await supabase.from('panch_settlements').insert(settlementsData);
    if (psErr) console.error('Panch settlements error:', psErr.message);
    else console.log(`✓ Seeded ${settlementsData.length} panch settlement records`);

    // 10. ALBUMS & PHOTOS
    console.log('Seeding Albums...');
    const { data: albumData, error: albErr } = await supabase.from('albums').insert({
      title: 'श्री आई माताजी बडेर एवं सामाजिक उत्सव',
      description: 'कोणदा बडेर एवं वार्षिक आयोजनों के पावन चित्र',
      photo_count: 2,
      status: 'active'
    }).select().single();

    if (albErr) {
      console.error('Album error:', albErr.message);
    } else if (albumData) {
      const photosData = [
        {
          album_id: albumData.id,
          title: 'श्री आई माताजी बडेर कोणदा',
          photo_url: 'https://images.unsplash.com/photo-1545232979-fbf68fe9f1f8?w=800&auto=format&fit=crop&q=60',
          caption: 'बडेर परिसर मुख्य द्वार'
        },
        {
          album_id: albumData.id,
          title: 'वार्षिक धर्मसभा एवं समाज मिलन',
          photo_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60',
          caption: 'सकल पंच एवं समाजजन'
        }
      ];
      const { error: gpErr } = await supabase.from('gallery_photos').insert(photosData);
      if (gpErr) console.error('Gallery photos error:', gpErr.message);
      else console.log(`✓ Seeded ${photosData.length} gallery photos`);
    }

    console.log('\n========================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
  } catch (err) {
    console.error('Seeding process failed:', err);
  }
}

seedData();
