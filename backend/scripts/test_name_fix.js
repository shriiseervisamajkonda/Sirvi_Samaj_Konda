import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testNameFixDryRun() {
  console.log('Fetching all families and members...');
  const { data: families, error: famErr } = await supabase.from('families').select('id, gotra, head_name');
  if (famErr) throw famErr;

  const famMap = new Map(families.map((f) => [f.id, f]));

  // Fetch all members (Supabase defaults to 1000 limit, so we page)
  let allMembers = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data: members, error: memErr } = await supabase
      .from('family_members')
      .select('id, first_name, last_name, full_name, family_id, relation_to_head, is_head')
      .range(from, from + pageSize - 1);
    if (memErr) throw memErr;
    if (!members || members.length === 0) break;
    allMembers.push(...members);
    if (members.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Loaded ${allMembers.length} total members across ${families.length} families.`);

  let singleWordCount = 0;
  let multiWordCount = 0;
  const updates = [];

  for (const m of allMembers) {
    const fam = famMap.get(m.family_id);
    const gotra = (fam?.gotra || '').trim();
    const rawFirst = (m.first_name || '').trim();

    let cleanFirst = rawFirst;
    let cleanLast = (m.last_name || '').trim();

    if (!cleanLast) {
      const parts = rawFirst.split(/\s+/);
      if (parts.length > 1) {
        // Last word is usually Gotra / Surname
        const lastPart = parts[parts.length - 1];
        cleanLast = lastPart;
        cleanFirst = parts.slice(0, -1).join(' ');
        multiWordCount++;
      } else {
        // Single word, use family gotra
        cleanLast = gotra;
        cleanFirst = rawFirst;
        singleWordCount++;
      }
    }

    const cleanFullName = `${cleanFirst} ${cleanLast}`.trim();

    updates.push({
      id: m.id,
      first_name: cleanFirst,
      last_name: cleanLast,
      full_name: cleanFullName,
    });
  }

  console.log(`\nAnalysis Summary:`);
  console.log(`- Multi-word names split into First + Last: ${multiWordCount}`);
  console.log(`- Single-word names assigned Family Gotra: ${singleWordCount}`);
  console.log(`\nFirst 15 dry-run transformations:`);
  for (let i = 0; i < 15; i++) {
    const u = updates[i];
    const orig = allMembers[i];
    console.log(`[#${i + 1}] Original: "${orig.first_name}" (last: ${orig.last_name}) -> First: "${u.first_name}" | Last: "${u.last_name}" | Full: "${u.full_name}"`);
  }
}

testNameFixDryRun().catch(console.error);
