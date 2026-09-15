const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

async function checkDailyRoiTxs() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions?type=eq.DAILY_ROI&limit=10`, { headers });
  const data = await res.json();
  console.log('Sample DAILY_ROI transactions:', JSON.stringify(data, null, 2));
}

checkDailyRoiTxs();
