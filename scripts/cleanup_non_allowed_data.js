const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const ALLOWED_EMAILS = [
  'qasimashfaq344@gmail.com',
  'rbrajabbutt@gmail.com',
  'khankhawar608@gmail.com',
  'heenainnovationfactory@gmail.com'
];

async function cleanupData() {
  console.log('🚀 STARTING DATABASE CLEANUP...\n');
  console.log('Allowed Users to KEEP:', ALLOWED_EMAILS);

  // 1. CLEANUP KYC VERIFICATIONS (Remove ALL KYC records as requested)
  console.log('\n--- 1. Cleaning KYC Verifications ---');
  const kycRes = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?select=*`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const kycList = await kycRes.json();
  console.log(`Found ${kycList.length} total KYC records to delete.`);
  for (const item of kycList) {
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?id=eq.${item.id}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Deleted KYC [${item.id}] for ${item.user_email}: ${delRes.status}`);
  }

  // 2. CLEANUP PROFILES
  console.log('\n--- 2. Cleaning Profiles ---');
  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const profiles = await profRes.json();
  const profilesToDelete = profiles.filter(p => !ALLOWED_EMAILS.includes((p.email || '').toLowerCase().trim()));
  console.log(`Found ${profilesToDelete.length} non-allowed profiles to delete.`);
  for (const p of profilesToDelete) {
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${p.id}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Deleted Profile [${p.email}]: ${delRes.status}`);
  }

  // 3. CLEANUP PURCHASED PACKAGES
  console.log('\n--- 3. Cleaning Purchased Packages ---');
  const pkgRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?select=*`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const packages = await pkgRes.json();
  const packagesToDelete = packages.filter(pkg => !ALLOWED_EMAILS.includes((pkg.user_email || '').toLowerCase().trim()));
  console.log(`Found ${packagesToDelete.length} non-allowed packages to delete.`);
  for (const pkg of packagesToDelete) {
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?id=eq.${pkg.id}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Deleted Package [${pkg.id}] (${pkg.user_email}): ${delRes.status}`);
  }

  // 4. CLEANUP TRANSACTIONS
  console.log('\n--- 4. Cleaning Transactions ---');
  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const txs = await txRes.json();
  const txsToDelete = txs.filter(tx => !ALLOWED_EMAILS.includes((tx.user_email || '').toLowerCase().trim()));
  console.log(`Found ${txsToDelete.length} non-allowed transactions to delete.`);

  // Delete in batches or individually
  let deletedTxCount = 0;
  for (const tx of txsToDelete) {
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${tx.id}`, {
      method: 'DELETE',
      headers
    });
    if (delRes.ok) deletedTxCount++;
  }
  console.log(`Successfully deleted ${deletedTxCount} non-allowed transactions.`);

  console.log('\n✅ DATABASE CLEANUP COMPLETE!');
}

cleanupData();
