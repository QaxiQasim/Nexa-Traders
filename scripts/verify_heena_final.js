const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

async function verifyFinal() {
  const email = 'heenainnovationfactory@gmail.com';
  console.log(`=== VERIFYING FINAL STATE FOR ${email} ===\n`);

  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, { headers });
  const profile = await profRes.json();
  console.log('👤 USER PROFILE:');
  console.log(`- Email: ${profile[0]?.email}`);
  console.log(`- Wallet Balance: $${profile[0]?.wallet_balance} USDT`);

  const pkgRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?user_email=eq.${encodeURIComponent(email)}&order=purchase_date.asc`, { headers });
  const packages = await pkgRes.json();
  console.log('\n📦 PURCHASED PACKAGES:');
  packages.forEach(pkg => {
    console.log(`- [${pkg.id}] ${pkg.package_name} ($${pkg.amount} USDT)`);
    console.log(`   Purchase Date: ${pkg.purchase_date} | Status: ${pkg.status}`);
    console.log(`   Earned ROI: $${pkg.earned_roi} USDT | Remaining ROI: $${pkg.remaining_roi} USDT / Cap: $${pkg.total_roi_cap} USDT`);
  });

  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(email)}&order=created_at.desc`, { headers });
  const txs = await txRes.json();
  console.log('\n💳 RECENT TRANSACTIONS:');
  txs.forEach(tx => {
    console.log(`- [${tx.type}] ${tx.description} | Amount: $${tx.amount} | Date: ${tx.created_at}`);
  });
}

verifyFinal();
