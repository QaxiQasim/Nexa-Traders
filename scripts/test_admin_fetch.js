const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const getHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
});

async function testFetch() {
  console.log('Testing fetchAllUsersFromDb...');
  const res1 = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`, {
    headers: getHeaders()
  });
  console.log('Profiles res.status:', res1.status);
  const data1 = await res1.json();
  console.log('Profiles count:', Array.isArray(data1) ? data1.length : data1);

  console.log('\nTesting fetchAllAdminTransactions...');
  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*&order=created_at.desc`, {
    headers: getHeaders()
  });
  console.log('Transactions res.status:', res2.status);
  const data2 = await res2.json();
  console.log('Transactions count:', Array.isArray(data2) ? data2.length : data2);

  console.log('\nTesting fetchAllAdminPackages...');
  const res3 = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?select=*&order=created_at.desc`, {
    headers: getHeaders()
  });
  console.log('Packages res.status:', res3.status);
  const data3 = await res3.json();
  console.log('Packages count:', Array.isArray(data3) ? data3.length : data3);

  console.log('\nTesting fetchAllAdminKyc...');
  const res4 = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?select=*&order=created_at.desc`, {
    headers: getHeaders()
  });
  console.log('KYC res.status:', res4.status);
  const data4 = await res4.json();
  console.log('KYC count:', Array.isArray(data4) ? data4.length : data4);
}

testFetch();
