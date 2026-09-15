import crypto from 'crypto';

const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

function getRandomTxHash() {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function addDaysToDate(startDateStr, days) {
  const d = new Date(startDateStr + 'T00:00:00Z');
  d.setDate(d.getDate() + days);
  return d.toISOString().substring(0, 10);
}

async function refineExactDailyRoi() {
  console.log('🚀 REFINING DAILY ROI TRANSACTIONS WITH EXACT PLAN DAILY RATES...\n');

  const TARGET_USERS = ['qasimashfaq344@gmail.com', 'heenainnovationfactory@gmail.com'];

  // 1. Delete all current DAILY_ROI and ROI_PAYOUT transactions for these users
  for (const email of TARGET_USERS) {
    const del1 = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(email)}&type=eq.DAILY_ROI`, {
      method: 'DELETE',
      headers
    });
    console.log(`Cleaned old DAILY_ROI for ${email}: ${del1.status}`);

    const del2 = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(email)}&type=eq.ROI_PAYOUT`, {
      method: 'DELETE',
      headers
    });
    console.log(`Cleaned old ROI_PAYOUT for ${email}: ${del2.status}`);
  }

  // 2. Generate exact daily transactions per package
  for (const email of TARGET_USERS) {
    console.log(`\nProcessing exact daily transactions for ${email}...`);

    const pkgRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?user_email=eq.${encodeURIComponent(email)}`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const packages = await pkgRes.json();

    const newTxList = [];
    let userTotalRoiSum = 0;

    for (const pkg of packages) {
      const pkgAmount = Number(pkg.amount) || 0;
      const dailyRate = Number(pkg.daily_roi) || 1.0;
      const targetEarned = Number(pkg.earned_roi) || (pkgAmount * 0.50);
      const pkgName = pkg.package_name || 'Standard';

      let accumulated = 0;
      let dayOffset = 0;

      while (accumulated < targetEarned) {
        const dateStr = addDaysToDate('2026-06-10', dayOffset);
        let amountToday = dailyRate;

        if (Number((accumulated + dailyRate).toFixed(2)) > targetEarned) {
          amountToday = Number((targetEarned - accumulated).toFixed(2));
        }

        if (amountToday <= 0) break;

        accumulated = Number((accumulated + amountToday).toFixed(2));
        userTotalRoiSum = Number((userTotalRoiSum + amountToday).toFixed(2));

        const txHash = getRandomTxHash();
        const shortHash = `${txHash.substring(0, 10)}...${txHash.substring(60)}`;

        newTxList.push({
          id: crypto.randomUUID(),
          user_email: email,
          type: 'DAILY_ROI',
          description: `Daily yield payout for ${dateStr} (${pkgName} Plan) [TxHash: ${shortHash}]`,
          amount: amountToday,
          status: 'COMPLETED',
          created_at: `${dateStr}T12:00:00.000Z`
        });

        dayOffset++;
      }
    }

    console.log(`Generated ${newTxList.length} exact daily transactions for ${email}. Total Sum: $${userTotalRoiSum} USDT`);

    // Insert in batch chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < newTxList.length; i += chunkSize) {
      const chunk = newTxList.slice(i, i + chunkSize);
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(chunk)
      });
      console.log(`  Inserted batch ${i} to ${i + chunk.length}: ${insertRes.status}`);
    }
  }

  console.log('\n✅ EXACT DAILY ROI TRANSACTIONS GENERATED SUCCESSFULLY!');
}

refineExactDailyRoi();
