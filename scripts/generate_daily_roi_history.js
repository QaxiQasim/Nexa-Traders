import crypto from 'crypto';

const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

function getDatesInRange(startDateStr, endDateStr) {
  const dates = [];
  let curr = new Date(startDateStr + 'T00:00:00Z');
  const end = new Date(endDateStr + 'T00:00:00Z');
  while (curr <= end) {
    dates.push(curr.toISOString().substring(0, 10));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

function getRandomTxHash() {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

async function processDailyRoiHistory() {
  console.log('🚀 GENERATING DAILY DATE-WISE ROI TRANSACTIONS (2026-06-10 TO 2026-09-09)...\n');

  const dateList = getDatesInRange('2026-06-10', '2026-09-09');
  console.log(`Total Days in Range: ${dateList.length} days (June 10 to Sept 9)`);

  const TARGET_USERS = ['qasimashfaq344@gmail.com', 'heenainnovationfactory@gmail.com'];

  // 1. Remove previous single lump-sum ROI_PAYOUT transactions
  console.log('\n--- 1. Removing old lump-sum ROI_PAYOUT transactions ---');
  for (const email of TARGET_USERS) {
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(email)}&type=eq.ROI_PAYOUT`, {
      method: 'DELETE',
      headers
    });
    console.log(`Removed old lump-sum ROI_PAYOUT for ${email}: ${delRes.status}`);
  }

  // Also remove old auto-generated DAILY_ROI transactions if any to avoid duplication
  for (const email of TARGET_USERS) {
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(email)}&type=eq.DAILY_ROI`, {
      method: 'DELETE',
      headers
    });
    console.log(`Cleaned previous DAILY_ROI transactions for ${email}: ${delRes.status}`);
  }

  // 2. Fetch packages for target users
  console.log('\n--- 2. Generating Date-Wise Daily ROI Transactions ---');

  for (const email of TARGET_USERS) {
    console.log(`\nProcessing daily history for ${email}...`);

    const pkgRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?user_email=eq.${encodeURIComponent(email)}`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const packages = await pkgRes.json();
    console.log(`Found ${packages.length} active packages.`);

    const newTransactions = [];
    let totalRoiSum = 0;

    // Distribute daily ROI across the 92 dates
    for (const pkg of packages) {
      const dailyRoi = Number(pkg.daily_roi) || (Number(pkg.amount) * 0.01);
      const pkgName = pkg.package_name || 'Standard';

      // Distribute evenly so total earned ROI matches ~50% target cap
      const targetEarnedRoi = Number(pkg.earned_roi) || (Number(pkg.amount) * 0.50);
      const dailyAmount = Number((targetEarnedRoi / dateList.length).toFixed(2));

      for (const dateStr of dateList) {
        totalRoiSum += dailyAmount;
        const txHash = getRandomTxHash();
        const shortHash = `${txHash.substring(0, 10)}...${txHash.substring(60)}`;

        newTransactions.push({
          id: crypto.randomUUID(),
          user_email: email,
          type: 'DAILY_ROI',
          description: `Daily yield payout for ${dateStr} (${pkgName} Plan) [TxHash: ${shortHash}]`,
          amount: dailyAmount,
          status: 'COMPLETED',
          created_at: `${dateStr}T12:00:00.000Z`
        });
      }
    }

    console.log(`Generated ${newTransactions.length} daily transactions for ${email}. Total Yield: $${totalRoiSum.toFixed(2)} USDT`);

    // Insert in batch chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < newTransactions.length; i += chunkSize) {
      const chunk = newTransactions.slice(i, i + chunkSize);
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(chunk)
      });
      console.log(`  Inserted batch ${i} to ${i + chunk.length}: ${insertRes.status}`);
    }
  }

  console.log('\n✅ DATE-WISE DAILY ROI TRANSACTIONS GENERATION COMPLETE!');
}

processDailyRoiHistory();
