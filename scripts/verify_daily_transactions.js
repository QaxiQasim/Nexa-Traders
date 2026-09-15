const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

async function verifyLedger() {
  const email = 'qasimashfaq344@gmail.com';
  console.log(`=== CHECKING DAILY TRANSACTIONS LEDGER FOR ${email} ===\n`);

  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(email)}&order=created_at.asc&limit=15`, { headers });
  const txs = await txRes.json();

  console.log(`Sample First 15 Daily ROI Payouts starting from June 10, 2026:`);
  txs.forEach(t => {
    console.log(`- [${t.created_at.substring(0, 10)}] ${t.description} | Amount: +$${t.amount} USDT | Status: ${t.status}`);
  });

  const txCountRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(email)}&select=id`, { headers });
  const allTxs = await txCountRes.json();
  console.log(`\nTotal Ledger Transactions for Qasim: ${allTxs.length}`);
}

verifyLedger();
