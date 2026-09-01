const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation, resolution=merge-duplicates'
};

async function createAndPopulate() {
  console.log('⚡ Initializing Supabase Tables & Initial Data...');

  // 1. Sync Profile
  try {
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: 'alex.vance@nexatraders.com',
        full_name: 'Alex Vance',
        wallet_balance: 4680.00
      })
    });
    console.log('Profiles Status:', profileRes.status);
  } catch (e) {
    console.error('Profile error:', e.message);
  }

  // 2. Insert Purchased Packages
  try {
    const pkgRes = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages`, {
      method: 'POST',
      headers,
      body: JSON.stringify([
        {
          id: 'PKG-8921',
          user_email: 'alex.vance@nexatraders.com',
          package_name: 'Rise',
          amount: 1000,
          daily_roi: 1.8,
          total_roi_cap: 2000,
          earned_roi: 480.00,
          remaining_roi: 1520.00,
          purchase_date: '2026-08-12',
          expiry_date: '2026-11-12',
          status: 'ACTIVE'
        },
        {
          id: 'PKG-9403',
          user_email: 'alex.vance@nexatraders.com',
          package_name: 'Supreme',
          amount: 10000,
          daily_roi: 3.5,
          total_roi_cap: 30000,
          earned_roi: 4200.00,
          remaining_roi: 25800.00,
          purchase_date: '2026-08-20',
          expiry_date: '2027-02-20',
          status: 'ACTIVE'
        }
      ])
    });
    console.log('Packages Status:', pkgRes.status);
  } catch (e) {
    console.error('Package error:', e.message);
  }

  // 3. Insert KYC
  try {
    const kycRes = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_email: 'alex.vance@nexatraders.com',
        document_type: 'PASSPORT',
        document_number: 'N849102948',
        status: 'APPROVED'
      })
    });
    console.log('KYC Status:', kycRes.status);
  } catch (e) {
    console.error('KYC error:', e.message);
  }

  // 4. Insert Transactions
  try {
    const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify([
        {
          user_email: 'alex.vance@nexatraders.com',
          type: 'DAILY_ROI',
          description: 'Daily ROI Payout (Supreme Plan)',
          amount: 350.00,
          status: 'COMPLETED'
        },
        {
          user_email: 'alex.vance@nexatraders.com',
          type: 'DAILY_ROI',
          description: 'Daily ROI Payout (Rise Plan)',
          amount: 18.00,
          status: 'COMPLETED'
        },
        {
          user_email: 'alex.vance@nexatraders.com',
          type: 'PACKAGE_PURCHASE',
          description: 'Activated Supreme Package',
          amount: -10000.00,
          status: 'COMPLETED'
        }
      ])
    });
    console.log('Transactions Status:', txRes.status);
  } catch (e) {
    console.error('Transactions error:', e.message);
  }
}

createAndPopulate();
