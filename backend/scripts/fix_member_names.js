import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function executeNameFix() {
  console.log('=== Starting Member First Name & Last Name Normalization ===');
  const { data: families, error: famErr } = await supabase.from('families').select('id, gotra');
  if (famErr) throw famErr;

  const famMap = new Map(families.map((f) => [f.id, f.gotra]));

  // Load all 1,184 members
  let allMembers = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data: members, error: memErr } = await supabase
      .from('family_members')
      .select('id, first_name, last_name, full_name, family_id')
      .range(from, from + pageSize - 1);
    if (memErr) throw memErr;
    if (!members || members.length === 0) break;
    allMembers.push(...members);
    if (members.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Loaded ${allMembers.length} records. Processing updates in parallel batches...`);

  const BATCH_SIZE = 50;
  let updatedCount = 0;

  for (let i = 0; i < allMembers.length; i += BATCH_SIZE) {
    const batch = allMembers.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (m) => {
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

        const { error: updateErr } = await supabase
          .from('family_members')
          .update({
            first_name: cleanFirst,
            last_name: cleanLast,
            full_name: cleanFullName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', m.id);

        if (updateErr) {
          console.error(`Error updating member ${m.id}:`, updateErr.message);
        } else {
          updatedCount++;
        }
      })
    );
    process.stdout.write(`Updated ${updatedCount}/${allMembers.length} members...\r`);
  }

  console.log(`\n\n[SUCCESS] Successfully normalized and updated all ${updatedCount} members in Supabase!`);
}

executeNameFix().catch(console.error);
