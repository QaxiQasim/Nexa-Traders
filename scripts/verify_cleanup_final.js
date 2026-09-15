const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

const ALLOWED_EMAILS = [
  'qasimashfaq344@gmail.com',
  'rbrajabbutt@gmail.com',
  'khankhawar608@gmail.com',
  'heenainnovationfactory@gmail.com'
];

async function verifyAll() {
  console.log('=== VERIFYING FINAL DATABASE CLEANUP ===\n');

  // 1. Profiles
  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, { headers });
  const profiles = await profRes.json();
  console.log(`👤 PROFILES Remaining in DB: ${profiles.length}`);
  profiles.forEach(p => console.log(`   - ${p.email} | Balance: $${p.wallet_balance} USDT | KYC: ${p.kyc_status}`));

  // 2. KYC
  const kycRes = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?select=*`, { headers });
  const kyc = await kycRes.json();
  console.log(`\n🆔 KYC Records Remaining in DB: ${kyc.length}`);

  // 3. Purchased Packages
  const pkgRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?select=*`, { headers });
  const packages = await pkgRes.json();
  console.log(`\n📦 PURCHASED PACKAGES Remaining in DB: ${packages.length}`);
  const nonAllowedPkgs = packages.filter(p => !ALLOWED_EMAILS.includes((p.user_email || '').toLowerCase().trim()));
  console.log(`   - Packages belonging to allowed 4 users: ${packages.length - nonAllowedPkgs.length}`);
  console.log(`   - Non-allowed packages remaining: ${nonAllowedPkgs.length}`);

  // 4. Transactions
  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*`, { headers });
  const txs = await txRes.json();
  console.log(`\n💳 TRANSACTIONS Remaining in DB: ${txs.length}`);
  const nonAllowedTxs = txs.filter(t => !ALLOWED_EMAILS.includes((t.user_email || '').toLowerCase().trim()));
  console.log(`   - Transactions belonging to allowed 4 users: ${txs.length - nonAllowedTxs.length}`);
  console.log(`   - Non-allowed transactions remaining: ${nonAllowedTxs.length}`);

  console.log('\n=======================================');
  if (nonAllowedPkgs.length === 0 && nonAllowedTxs.length === 0 && kyc.length === 0) {
    console.log('🎉 VERIFICATION SUCCESS: All non-allowed data & KYC records completely removed!');
  } else {
    console.log('⚠️ WARNING: Some residual records found.');
  }
}

verifyAll();
