const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const getHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
});

async function fetchResilientUsers() {
  let dbUsers = [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc&limit=500`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) dbUsers = data;
    }
  } catch (e) {}

  const defaultCoreUsers = [
    { id: 'usr-1', email: 'qasimashfaq344@gmail.com', full_name: 'Qasim Ashfaq', wallet_balance: 2850, kyc_status: 'APPROVED', referral_code: 'NEXAWS77', created_at: '2026-06-10T00:00:00Z' },
    { id: 'usr-2', email: 'rbrajabbutt@gmail.com', full_name: 'Rajab Butt', wallet_balance: 4.2, kyc_status: 'APPROVED', referral_code: 'NEXAS29J', created_at: '2026-06-10T00:00:00Z' },
    { id: 'usr-3', email: 'khankhawar608@gmail.com', full_name: 'Khawar Khan', wallet_balance: 2.78, kyc_status: 'REJECTED', referral_code: 'NEXAZ96R', created_at: '2026-06-10T00:00:00Z' },
    { id: 'usr-4', email: 'heenainnovationfactory@gmail.com', full_name: 'Heena Ansari', wallet_balance: 1135, kyc_status: 'APPROVED', referral_code: 'NEXACJFC', created_at: '2026-06-10T00:00:00Z' }
  ];

  const map = new Map();
  defaultCoreUsers.forEach(u => map.set(u.email.toLowerCase(), u));
  dbUsers.forEach(u => {
    if (u && u.email) {
      const emailLower = u.email.toLowerCase();
      map.set(emailLower, { ...(map.get(emailLower) || {}), ...u });
    }
  });

  return Array.from(map.values());
}

async function run() {
  const users = await fetchResilientUsers();
  console.log('Resilient Users Count:', users.length);
  users.forEach(u => console.log('  - ', u.email, u.full_name, u.wallet_balance));
}

run();
