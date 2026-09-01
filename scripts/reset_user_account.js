const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function resetUserAccount() {
  const targetEmail = 'rbrajabbutt@gmail.com';
  console.log(`⚡ Resetting account data for ${targetEmail} to 0...`);

  // 1. Reset Profile Balance to 0 using PATCH
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(targetEmail)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        wallet_balance: 0.00
      })
    });
    console.log('Profile reset PATCH status:', res.status, await res.text());
  } catch (e) {
    console.error('Profile reset error:', e.message);
  }

  // 2. Clear Purchased Packages
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?user_email=eq.${encodeURIComponent(targetEmail)}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    console.log('Packages clear status:', res.status);
  } catch (e) {
    console.error('Packages clear error:', e.message);
  }

  // 3. Clear Transactions
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(targetEmail)}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    console.log('Transactions clear status:', res.status);
  } catch (e) {
    console.error('Transactions clear error:', e.message);
  }

  // 4. Clear KYC
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?user_email=eq.${encodeURIComponent(targetEmail)}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    console.log('KYC clear status:', res.status);
  } catch (e) {
    console.error('KYC clear error:', e.message);
  }
}

resetUserAccount();
