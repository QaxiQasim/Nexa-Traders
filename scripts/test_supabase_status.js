const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

async function test() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  console.log('Status Code:', res.status);
  const text = await res.text();
  console.log('Response Body:', text);
}

test();
