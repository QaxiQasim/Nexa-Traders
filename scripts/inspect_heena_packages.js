const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

async function inspectUserTx() {
  const email = 'heenainnovationfactory@gmail.com';

  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(email)}`, { headers });
  const txData = await txRes.json();
  console.log('Transactions:', JSON.stringify(txData, null, 2));
}

inspectUserTx();
