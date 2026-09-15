import crypto from 'crypto';

const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function updateQasimAccount() {
  const targetEmail = 'qasimashfaq344@gmail.com';
  console.log(`🚀 Updating 50% ROI & Setting purchase date to 2026-06-10 for ${targetEmail}...`);

  // 1. Fetch user's packages
  const pkgRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?user_email=eq.${encodeURIComponent(targetEmail)}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  const packages = await pkgRes.json();
  console.log(`Found ${packages.length} packages for ${targetEmail}`);

  let totalRoiCredited = 0;

  for (const pkg of packages) {
    const pkgAmount = Number(pkg.amount) || 0;
    const roi50Pct = Number((pkgAmount * 0.50).toFixed(2));
    totalRoiCredited += roi50Pct;

    const totalRoiCap = Number(pkg.total_roi_cap) || (pkgAmount * 1.85);
    const newRemaining = Math.max(0, Number((totalRoiCap - roi50Pct).toFixed(2)));

    console.log(`Updating ${pkg.id} (${pkg.package_name} - $${pkgAmount}): 50% ROI = $${roi50Pct}, Remaining = $${newRemaining}`);

    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?id=eq.${pkg.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        earned_roi: roi50Pct,
        remaining_roi: newRemaining,
        purchase_date: '2026-06-10',
        created_at: '2026-06-10T00:00:00.000Z'
      })
    });

    console.log(`Package ${pkg.id} update status: ${updateRes.status}`);
  }

  console.log(`\n💰 Total 50% ROI Yield calculated across packages: $${totalRoiCredited} USDT`);

  // 2. Fetch profile & update wallet balance
  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(targetEmail)}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  const profiles = await profRes.json();
  if (profiles && profiles.length > 0) {
    const currentBalance = Number(profiles[0].wallet_balance) || 0;
    const newBalance = Number((currentBalance + totalRoiCredited).toFixed(2));
    console.log(`Current Balance: $${currentBalance} USDT -> New Balance: $${newBalance} USDT`);

    const profPatchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(targetEmail)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        wallet_balance: newBalance
      })
    });
    console.log(`Profile wallet_balance update status: ${profPatchRes.status}`);
  }

  // 3. Record transaction for 50% ROI credit
  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: crypto.randomUUID(),
      user_email: targetEmail,
      type: 'ROI_PAYOUT',
      description: `50% Retroactive Package ROI Credit ($${totalRoiCredited} USDT)`,
      amount: totalRoiCredited,
      status: 'COMPLETED',
      created_at: '2026-06-10T12:00:00.000Z'
    })
  });
  console.log(`Transaction record status: ${txRes.status}`);

  console.log('\n✅ All updates applied successfully in Supabase for qasimashfaq344@gmail.com!');
}

updateQasimAccount();
