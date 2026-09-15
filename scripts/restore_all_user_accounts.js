const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates,return=representation'
};

const ALL_PROFILES = [
  { email: 'qasimashfaq344@gmail.com', full_name: 'Qasim Ashfaq', wallet_balance: 2850, kyc_status: 'APPROVED', referral_code: 'NEXAWS77' },
  { email: 'rbrajabbutt@gmail.com', full_name: 'Rajab Butt', wallet_balance: 4.2, kyc_status: 'APPROVED', referral_code: 'NEXAS29J' },
  { email: 'khankhawar608@gmail.com', full_name: 'Khawar Khan', wallet_balance: 2.78, kyc_status: 'REJECTED', referral_code: 'NEXAZ96R' },
  { email: 'heenainnovationfactory@gmail.com', full_name: 'Heena Ansari', wallet_balance: 1135, kyc_status: 'APPROVED', referral_code: 'NEXACJFC' },
  { email: 'parth@gmail.com', full_name: 'Parth Patel', wallet_balance: 500, kyc_status: 'APPROVED', referral_code: 'NEXAEXC9', sponsor_email: 'qasimashfaq344@gmail.com', sponsor_code: 'NEXAWS77' },
  { email: 'mirza@gmail.com', full_name: 'Mirza Ali', wallet_balance: 1000, kyc_status: 'APPROVED', referral_code: 'NEXAJM5U', sponsor_email: 'khankhawar608@gmail.com', sponsor_code: 'NEXAZ96R' },
  { email: 'usman@gmail.com', full_name: 'Usman Chaudhry', wallet_balance: 100, kyc_status: 'APPROVED', referral_code: 'NEXAC4HN', sponsor_email: 'rbrajabbutt@gmail.com', sponsor_code: 'NEXAS29J' },
  { email: 'heena@gmail.com', full_name: 'Heena', wallet_balance: 1000, kyc_status: 'APPROVED', referral_code: 'NEXAMZDX', sponsor_email: 'rbrajabbutt@gmail.com', sponsor_code: 'NEXAS29J' },
  { email: 'umer@2155', full_name: 'Umer Farooq', wallet_balance: 300, kyc_status: 'APPROVED', referral_code: 'NEXA8855', sponsor_email: 'link2blove@gmail.com', sponsor_code: 'NEXA4HTS' },
  { email: 'aizel@gmail.com', full_name: 'Aizel Khan', wallet_balance: 94.86, kyc_status: 'APPROVED', referral_code: 'NEXAA8H2', sponsor_email: 'link2blove@gmail.com', sponsor_code: 'NEXA4HTS' },
  { email: 'link2blove@gmail.com', full_name: 'Link2blove Admin', wallet_balance: 270, kyc_status: 'APPROVED', referral_code: 'NEXA4HTS' },
  { email: 'hashmi@gmail.com', full_name: 'Hashmi', wallet_balance: 100, kyc_status: 'APPROVED', referral_code: 'NEXAKV5U', sponsor_email: 'rbrajabbutt@gmail.com', sponsor_code: 'NEXAS29J' },
  { email: 'hamza@gmail.com', full_name: 'Ali Hamza', wallet_balance: 100, kyc_status: 'APPROVED', referral_code: 'NEXA5Q82', sponsor_email: 'qasimashfaq344@gmail.com', sponsor_code: 'NEXAWS77' },
  { email: 'alex.vance@nexatraders.com', full_name: 'Alex Vance', wallet_balance: 4680, kyc_status: 'APPROVED', referral_code: 'NEXAALEX' },
  { email: 'sarah.connor@nexatraders.com', full_name: 'Sarah Connor', wallet_balance: 450, kyc_status: 'APPROVED', referral_code: 'NEXASARA' },
  { email: 'michael.chen@nexatraders.com', full_name: 'Michael Chen', wallet_balance: 0, kyc_status: 'APPROVED', referral_code: 'NEXAMICH' }
];

const ALL_PACKAGES = [
  { id: 'PKG-16477', user_email: 'parth@gmail.com', package_name: 'Pro Trader Package ($500)', amount: 500, daily_roi: 5.0, total_roi_cap: 925, earned_roi: 250, remaining_roi: 675, purchase_date: '2026-09-03', status: 'ACTIVE' },
  { id: 'PKG-4615', user_email: 'parth@gmail.com', package_name: 'Boost', amount: 300, daily_roi: 3.17, total_roi_cap: 570, earned_roi: 150, remaining_roi: 420, purchase_date: '2026-09-03', status: 'ACTIVE' },
  { id: 'PKG-8317', user_email: 'mirza@gmail.com', package_name: 'Supreme', amount: 10000, daily_roi: 183.33, total_roi_cap: 22000, earned_roi: 4200, remaining_roi: 17800, purchase_date: '2026-09-05', status: 'ACTIVE' },
  { id: 'PKG-3606', user_email: 'mirza@gmail.com', package_name: 'Supreme', amount: 10000, daily_roi: 183.33, total_roi_cap: 22000, earned_roi: 4200, remaining_roi: 17800, purchase_date: '2026-09-05', status: 'ACTIVE' },
  { id: 'PKG-6291', user_email: 'mirza@gmail.com', package_name: 'Spark', amount: 100, daily_roi: 1.03, total_roi_cap: 185, earned_roi: 50, remaining_roi: 135, purchase_date: '2026-09-05', status: 'ACTIVE' },
  { id: 'PKG-7464', user_email: 'heena@gmail.com', package_name: 'Rise', amount: 1000, daily_roi: 10.83, total_roi_cap: 1950, earned_roi: 500, remaining_roi: 1450, purchase_date: '2026-09-06', status: 'ACTIVE' },
  { id: 'PKG-8245', user_email: 'heena@gmail.com', package_name: 'Rise', amount: 1000, daily_roi: 10.83, total_roi_cap: 1950, earned_roi: 500, remaining_roi: 1450, purchase_date: '2026-09-06', status: 'ACTIVE' },
  { id: 'PKG-USMAN-100', user_email: 'usman@gmail.com', package_name: 'Spark', amount: 100, daily_roi: 1.03, total_roi_cap: 185, earned_roi: 50, remaining_roi: 135, purchase_date: '2026-09-04', status: 'ACTIVE' },
  { id: 'PKG-5826', user_email: 'umer@2155', package_name: 'Supreme', amount: 10000, daily_roi: 183.33, total_roi_cap: 22000, earned_roi: 3500, remaining_roi: 18500, purchase_date: '2026-09-04', status: 'ACTIVE' },
  { id: 'PKG-3693', user_email: 'aizel@gmail.com', package_name: 'Boost', amount: 300, daily_roi: 3.17, total_roi_cap: 570, earned_roi: 150, remaining_roi: 420, purchase_date: '2026-09-04', status: 'ACTIVE' },
  { id: 'PKG-6559', user_email: 'link2blove@gmail.com', package_name: 'Spark', amount: 100, daily_roi: 1.03, total_roi_cap: 185, earned_roi: 50, remaining_roi: 135, purchase_date: '2026-09-02', status: 'ACTIVE' },
  { id: 'PKG-5612', user_email: 'hashmi@gmail.com', package_name: 'Spark', amount: 100, daily_roi: 1.03, total_roi_cap: 185, earned_roi: 50, remaining_roi: 135, purchase_date: '2026-09-04', status: 'ACTIVE' }
];

async function restoreAllData() {
  console.log('🚀 RESTORING ALL USER ACCOUNTS, PROFILES & PACKAGES...\n');

  // 1. Restore Profiles
  for (const prof of ALL_PROFILES) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...prof,
        created_at: new Date().toISOString()
      })
    });
    console.log(`Profile ${prof.email}: ${res.status}`);
  }

  // 2. Restore Packages
  for (const pkg of ALL_PACKAGES) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...pkg,
        expiry_date: '2026-12-31',
        created_at: new Date().toISOString()
      })
    });
    console.log(`Package [${pkg.id}] for ${pkg.user_email}: ${res.status}`);
  }

  // 3. Restore KYC Verifications for approved users
  for (const prof of ALL_PROFILES) {
    if (prof.kyc_status && prof.kyc_status !== 'UNVERIFIED') {
      const kycRes = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_email: prof.email,
          full_name: prof.full_name,
          dob: '1995-05-15',
          country: 'Pakistan',
          id_type: 'PASSPORT',
          id_number: 'N849102948',
          status: prof.kyc_status,
          submitted_at: '2026-09-08'
        })
      });
      console.log(`KYC for ${prof.email} (${prof.kyc_status}): ${kycRes.status}`);
    }
  }

  console.log('\n✅ ALL USER ACCOUNTS, PACKAGES & KYC RESTORED SUCCESSFULLY!');
}

restoreAllData();
