import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function bulkNormalizeNames() {
  console.log('=== Fast Bulk Member Name Normalization ===');
  const { data: families, error: famErr } = await supabase.from('families').select('id, gotra');
  if (famErr) throw famErr;

  const famMap = new Map(families.map((f) => [f.id, f.gotra]));

  // Load all members with pagination
  let allMembers = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data: members, error: memErr } = await supabase
      .from('family_members')
      .select('*')
      .range(from, from + pageSize - 1);
    if (memErr) throw memErr;
    if (!members || members.length === 0) break;
    allMembers.push(...members);
    if (members.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Loaded ${allMembers.length} members. Preparing normalized records...`);

  const normalized = allMembers.map((m) => {
    const gotra = (famMap.get(m.family_id) || '').trim();
    const rawFirst = (m.first_name || '').trim();

    let cleanFirst = rawFirst;
    let cleanLast = (m.last_name || '').trim();

    if (!cleanLast) {
      const parts = rawFirst.split(/\s+/);
      if (parts.length > 1) {
        cleanLast = parts[parts.length - 1];
        cleanFirst = parts.slice(0, -1).join(' ');
      } else {
        cleanLast = gotra;
        cleanFirst = rawFirst;
      }
    }

    const cleanFullName = `${cleanFirst} ${cleanLast}`.trim();

    return {
      ...m,
      first_name: cleanFirst,
      last_name: cleanLast,
      full_name: cleanFullName,
      updated_at: new Date().toISOString(),
    };
  });

  const CHUNK_SIZE = 100;
  let processed = 0;

  for (let i = 0; i < normalized.length; i += CHUNK_SIZE) {
    const chunk = normalized.slice(i, i + CHUNK_SIZE);
    const { error: upsertErr } = await supabase.from('family_members').upsert(chunk);
    if (upsertErr) {
      console.error(`Error in chunk ${i / CHUNK_SIZE + 1}:`, upsertErr.message);
    } else {
      processed += chunk.length;
      console.log(`[PASS] Upserted batch ${Math.floor(i / CHUNK_SIZE) + 1} (${processed}/${normalized.length} members)`);
    }
  }

  console.log(`\n[SUCCESS] Successfully normalized First Name & Last Name across all ${processed} members!`);
}

bulkNormalizeNames().catch(console.error);
