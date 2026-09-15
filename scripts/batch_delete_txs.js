const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

const ALLOWED_EMAILS = [
  'qasimashfaq344@gmail.com',
  'rbrajabbutt@gmail.com',
  'khankhawar608@gmail.com',
  'heenainnovationfactory@gmail.com'
];

async function deleteAllNonAllowedTxs() {
  console.log('⚡ Starting comprehensive batch delete for ALL remaining non-allowed transactions...');

  let loopCount = 0;
  while (true) {
    loopCount++;
    const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=id,user_email&limit=1000`, { headers });
    const txs = await txRes.json();
    const toDelete = txs.filter(t => !ALLOWED_EMAILS.includes((t.user_email || '').toLowerCase().trim()));

    console.log(`Loop #${loopCount}: Found ${toDelete.length} non-allowed transactions to delete.`);
    if (toDelete.length === 0) break;

    const ids = toDelete.map(t => t.id);
    const chunkSize = 50;

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const delRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=in.("${chunk.join('","')}")`, {
        method: 'DELETE',
        headers
      });
      console.log(`  Deleted chunk ${i}-${i + chunk.length}: ${delRes.status}`);
    }
  }

  console.log('✅ ALL non-allowed transactions deleted!');
}

deleteAllNonAllowedTxs();
