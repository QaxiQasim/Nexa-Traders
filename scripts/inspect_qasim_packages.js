const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

async function inspectQasim() {
  const email = 'qasimashfaq344@gmail.com';
  console.log(`Checking profile for ${email}...`);

  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, { headers });
  const profileData = await profRes.json();
  console.log('Profile:', JSON.stringify(profileData, null, 2));

  const pkgRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?user_email=eq.${encodeURIComponent(email)}`, { headers });
  const pkgData = await pkgRes.json();
  console.log('Purchased Packages:', JSON.stringify(pkgData, null, 2));
}

inspectQasim();
