// NEXATRADES Supabase Lightweight REST Client (Zero-dependency)
export const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

const getHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

// ----------------------------------------------------
// SUPABASE REST DATABASE OPERATIONS
// ----------------------------------------------------

export async function syncUserProfile(email: string, name: string, balance: number) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        email,
        full_name: name,
        wallet_balance: balance
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Supabase profile sync notice: stored locally.');
  }
}

export async function fetchUserPackagesFromDb(email: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?user_email=eq.${encodeURIComponent(email)}&order=purchase_date.desc`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      name: item.package_name,
      amount: item.amount,
      dailyRoi: item.daily_roi,
      totalRoiCap: item.total_roi_cap,
      earnedRoi: item.earned_roi,
      remainingRoi: item.remaining_roi,
      purchaseDate: item.purchase_date,
      expiryDate: item.expiry_date,
      status: item.status
    }));
  } catch (err) {
    return null;
  }
}

export async function insertPackageToDb(email: string, pkg: any) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        id: pkg.id,
        user_email: email,
        package_name: pkg.name,
        amount: pkg.amount,
        daily_roi: pkg.dailyRoi,
        total_roi_cap: pkg.totalRoiCap,
        earned_roi: pkg.earnedRoi,
        remaining_roi: pkg.remainingRoi,
        purchase_date: pkg.purchaseDate,
        expiry_date: pkg.expiryDate,
        status: pkg.status
      })
    });
  } catch (err) {
    console.warn('Supabase package notice: saved locally.');
  }
}

export async function fetchKycFromDb(email: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?user_email=eq.${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const item = data[0];
    return {
      status: item.status,
      fullName: item.full_name,
      dob: item.dob,
      country: item.country,
      idType: item.id_type,
      idNumber: item.id_number,
      submittedAt: item.submitted_at
    };
  } catch (err) {
    return null;
  }
}

export async function upsertKycToDb(email: string, kyc: any) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_email: email,
        full_name: kyc.fullName,
        dob: kyc.dob,
        country: kyc.country,
        id_type: kyc.idType,
        id_number: kyc.idNumber,
        status: kyc.status,
        submitted_at: kyc.submittedAt || new Date().toISOString().split('T')[0]
      })
    });
  } catch (err) {
    console.warn('Supabase KYC notice: saved locally.');
  }
}

export async function fetchTransactionsFromDb(email: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(email)}&order=date.desc`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.map((tx: any) => ({
      id: tx.id,
      date: tx.date,
      type: tx.type,
      title: tx.title,
      amount: tx.amount,
      status: tx.status,
      txHash: tx.tx_hash
    }));
  } catch (err) {
    return null;
  }
}

export async function insertTransactionToDb(email: string, tx: any) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        id: tx.id,
        user_email: email,
        date: tx.date,
        type: tx.type,
        title: tx.title,
        amount: tx.amount,
        status: tx.status,
        tx_hash: tx.txHash
      })
    });
  } catch (err) {
    console.warn('Supabase transaction notice: saved locally.');
  }
}
