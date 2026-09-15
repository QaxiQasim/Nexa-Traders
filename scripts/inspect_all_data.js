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

async function inspectAll() {
  console.log('=== PROFILES in DB ===');
  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, { headers });
  const profiles = await profRes.json();
  console.log(`Total Profiles: ${profiles.length}`);
  profiles.forEach(p => console.log(`  - ${p.email} (Balance: $${p.wallet_balance})`));

  console.log('\n=== KYC VERIFICATIONS in DB ===');
  const kycRes = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?select=*`, { headers });
  const kyc = await kycRes.json();
  console.log(`Total KYC records: ${kyc.length}`);
  kyc.forEach(k => console.log(`  - ${k.user_email} (${k.status})`));

  console.log('\n=== PURCHASED PACKAGES in DB ===');
  const pkgRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?select=*`, { headers });
  const packages = await pkgRes.json();
  console.log(`Total Packages: ${packages.length}`);
  const nonAllowedPkgs = packages.filter(p => !ALLOWED_EMAILS.includes((p.user_email || '').toLowerCase()));
  console.log(`Packages to DELETE (belonging to non-allowed users): ${nonAllowedPkgs.length}`);
  nonAllowedPkgs.forEach(p => console.log(`  - [${p.id}] ${p.user_email} (${p.package_name})`));

  console.log('\n=== TRANSACTIONS in DB ===');
  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*`, { headers });
  const txs = await txRes.json();
  console.log(`Total Transactions: ${txs.length}`);
  const nonAllowedTxs = txs.filter(t => !ALLOWED_EMAILS.includes((t.user_email || '').toLowerCase()));
  console.log(`Transactions to DELETE (belonging to non-allowed users): ${nonAllowedTxs.length}`);
}

inspectAll();
