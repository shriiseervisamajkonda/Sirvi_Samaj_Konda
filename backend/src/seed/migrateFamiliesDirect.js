import https from 'https';

const GOTRA_MAP = {
  chouhan: 'चौहान',
  bhayal: 'भायल',
  kag: 'काग',
  pawar: 'पंवार',
  solanki: 'सोलंकी',
  choyal: 'चोयल',
  padiyar: 'पड़ियार',
  gehlot: 'गेहलोत',
  agalcha: 'आगलचा',
  lacheta: 'लछेटा',
  rathore: 'राठौर',
  shinada: 'शिनदड़ा',
  barfa: 'बर्फा',
  septa: 'सेप्टा',
  sencha: 'सेंचा',
  parihar: 'परिहार',
  hammad: 'हम्माद',
};

const SUPABASE_URL = 'trdfvbtpnfvcojrvdgml.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZGZ2YnRwbmZ2Y29qcnZkZ21sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjcyNTI2MCwiZXhwIjoyMTAyMzAxMjYwfQ.F2KIlzPnuHDRFYB0rE7dSoG4qBcf6CJbkQRHfPuyw2U';

const fetchAllFamilies = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      path: '/rest/v1/families?select=id,panchayat_family_id,head_name,gotra,land_area_acres,land_details_text&limit=1000',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const updateFamilyRecord = (id, payload) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const options = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/families?id=eq.${id}`,
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
    };
    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          reject(new Error(`Failed to update ${id}, status: ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

const run = async () => {
  console.log('Fetching all families from Supabase...');
  const families = await fetchAllFamilies();
  console.log(`Total families fetched: ${families.length}`);

  let updatedCount = 0;
  for (let i = 0; i < families.length; i++) {
    const f = families[i];
    const gKey = (f.gotra || '').trim().toLowerCase();
    const hindiGotra = GOTRA_MAP[gKey] || f.gotra;

    let headName = (f.head_name || '').trim();
    if (hindiGotra && headName.endsWith(hindiGotra)) {
      const trimmed = headName.slice(0, -hindiGotra.length).trim();
      if (trimmed.length > 0) {
        headName = trimmed;
      }
    }

    let landAcres = Number(f.land_area_acres) || 0;
    if (landAcres === 0 && f.land_details_text) {
      const match = String(f.land_details_text).match(/([0-9.]+)/);
      if (match) {
        landAcres = parseFloat(match[1]);
      }
    }

    const payload = {
      head_name: headName,
      gotra: hindiGotra,
      land_area_acres: landAcres,
    };

    await updateFamilyRecord(f.id, payload);
    updatedCount++;
    if (updatedCount % 25 === 0 || updatedCount === families.length) {
      console.log(`Updated ${updatedCount}/${families.length} families...`);
    }
  }

  console.log(`\nSuccessfully updated all ${updatedCount} families in Supabase directly.`);
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
