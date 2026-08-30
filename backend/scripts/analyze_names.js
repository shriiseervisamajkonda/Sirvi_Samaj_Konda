import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: members } = await supabase
    .from('family_members')
    .select('id, first_name, last_name, full_name, family_id, relative_name, relative_relation_type');
  const { data: families } = await supabase.from('families').select('id, gotra');
  const famGotraMap = new Map(families.map((f) => [f.id, f.gotra]));

  let nullLastName = 0;
  let withSpaces = 0;

  for (const m of members) {
    if (!m.last_name) nullLastName++;
    if (m.first_name && m.first_name.trim().includes(' ')) withSpaces++;
  }

  console.log('Total members in DB:', members.length);
  console.log('Members with null last_name:', nullLastName);
  console.log('Members with spaces in first_name (Name + Gotra):', withSpaces);

  console.log('\n--- Sample Transformations ---');
  for (let i = 0; i < 10; i++) {
    const m = members[i];
    const gotra = famGotraMap.get(m.family_id) || '';
    const rawFirst = (m.first_name || '').trim();
    const parts = rawFirst.split(/\s+/);

    let properFirst = rawFirst;
    let properLast = gotra;

    if (parts.length > 1) {
      properFirst = parts.slice(0, -1).join(' ');
      properLast = parts[parts.length - 1];
    } else if (!m.last_name && gotra) {
      properLast = gotra;
    }

    const cleanFullName = `${properFirst} ${properLast}`.trim();
    console.log(
      `[ID ${m.id.slice(0, 8)}] Raw First: "${rawFirst}" -> First: "${properFirst}", Last (Gotra): "${properLast}", Full: "${cleanFullName}"`
    );
  }
}

run().catch(console.error);
