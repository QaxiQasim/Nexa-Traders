import crypto from 'crypto';

const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function insertTx() {
  const targetEmail = 'heenainnovationfactory@gmail.com';

  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: crypto.randomUUID(),
      user_email: targetEmail,
      type: 'ROI_PAYOUT',
      description: '50% Retroactive Package ROI Yield Credit ($850 USDT)',
      amount: 850,
      status: 'COMPLETED',
      created_at: '2026-06-10T12:00:00.000Z'
    })
  });
  console.log('Tx status:', txRes.status, await txRes.text());
}

insertTx();
