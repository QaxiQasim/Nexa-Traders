const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function depositForParth() {
  const targetEmail = 'parth@gmail.com';
  console.log(`⚡ Processing $500 Deposit for ${targetEmail}...`);

  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(targetEmail)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      wallet_balance: 500.00
    })
  });
  console.log('Profile balance update:', patchRes.status);

  // Insert Transaction Record ($500 Deposit)
  const txId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: txId,
      user_email: targetEmail,
      type: 'DEPOSIT',
      description: 'BEP20 USDT Verified On-Chain Deposit ($500)',
      amount: 500,
      status: 'COMPLETED',
      created_at: new Date().toISOString()
    })
  });
  console.log('Transaction insert status:', txRes.status, await txRes.text());

  console.log('✅ $500 Deposit successfully processed for parth@gmail.com!');
}

depositForParth();
