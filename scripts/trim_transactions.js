const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

async function trimTxs() {
  console.log('⚡ Trimming bloated DAILY_ROI transactions to restore Supabase egress...');

  // Fetch all DAILY_ROI transactions
  const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions?type=eq.DAILY_ROI&select=id,created_at&order=created_at.desc`, { headers });
  console.log('Fetch status:', res.status);
  const data = await res.json();

  if (!Array.isArray(data)) {
    console.log('Response error:', data);
    return;
  }

  console.log(`Total DAILY_ROI transactions in DB: ${data.length}`);

  // Keep the 30 newest DAILY_ROI transactions, delete older ones
  const toKeep = data.slice(0, 30);
  const toDelete = data.slice(30);

  console.log(`Deleting ${toDelete.length} bloated transactions...`);

  const ids = toDelete.map(t => t.id);
  const chunkSize = 50;

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=in.("${chunk.join('","')}")`, {
      method: 'DELETE',
      headers
    });
    console.log(`Deleted chunk ${i} to ${i + chunk.length}: ${delRes.status}`);
  }

  console.log('✅ Trimming complete!');
}

trimTxs();
