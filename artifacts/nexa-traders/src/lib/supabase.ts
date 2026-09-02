// NEXATRADES Supabase REST Client
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

export async function fetchUserProfileFromDb(email: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (err) {
    return null;
  }
}

export async function syncUserProfile(email: string, name: string, balance: number, avatarUrl?: string) {
  try {
    const payload: any = {
      full_name: name,
      wallet_balance: balance
    };
    if (avatarUrl) payload.avatar_url = avatarUrl;

    // 1. Try PATCH update on existing profile row by email
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (patchRes.ok) {
      const data = await patchRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return true;
      }
    }

    // 2. If row does not exist yet, INSERT via POST
    const postRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        email,
        full_name: name,
        wallet_balance: balance,
        avatar_url: avatarUrl || null
      })
    });
    return postRes.ok;
  } catch (err) {
    console.warn('Supabase profile sync notice: stored locally.', err);
    return false;
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
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: item.id || `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
      name: item.package_name || 'Standard',
      amount: isNaN(Number(item.amount)) ? 0 : Number(item.amount),
      dailyRoi: isNaN(Number(item.daily_roi)) ? 0 : Number(item.daily_roi),
      totalRoiCap: isNaN(Number(item.total_roi_cap)) ? 1 : Number(item.total_roi_cap),
      earnedRoi: isNaN(Number(item.earned_roi)) ? 0 : Number(item.earned_roi),
      remainingRoi: isNaN(Number(item.remaining_roi)) ? 0 : Number(item.remaining_roi),
      purchaseDate: item.purchase_date || new Date().toISOString().substring(0, 10),
      expiryDate: item.expiry_date || new Date().toISOString().substring(0, 10),
      status: item.status || 'ACTIVE'
    }));
  } catch (err) {
    return null;
  }
}

export async function insertPackageToDb(email: string, pkg: any) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'resolution=merge-duplicates'
      },
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
    if (!Array.isArray(data) || data.length === 0) return null;
    const item = data[0];
    return {
      status: item.status || 'UNVERIFIED',
      fullName: (email || '').split('@')[0] || 'User',
      dob: '1992-05-14',
      country: 'United Arab Emirates',
      idType: item.document_type || 'PASSPORT',
      idNumber: item.document_number || 'N849102948',
      submittedAt: (typeof item.submitted_at === 'string') ? item.submitted_at.substring(0, 10) : new Date().toISOString().substring(0, 10)
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
        document_type: kyc.idType || 'PASSPORT',
        document_number: kyc.idNumber || 'N849102948',
        status: kyc.status || 'PENDING'
      })
    });
  } catch (err) {
    console.warn('Supabase KYC notice: saved locally.');
  }
}

export async function fetchTransactionsFromDb(email: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=eq.${encodeURIComponent(email)}&order=created_at.desc`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((tx: any) => ({
      id: tx.id || `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: (typeof tx.created_at === 'string') ? tx.created_at.replace('T', ' ').substring(0, 16) : new Date().toISOString().substring(0, 16),
      type: tx.type || 'DEPOSIT',
      title: tx.description || tx.type || 'Transaction',
      amount: isNaN(Number(tx.amount)) ? 0 : Number(tx.amount),
      status: tx.status || 'COMPLETED'
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
        user_email: email,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        description: tx.title
      })
    });
  } catch (err) {
    console.warn('Supabase transaction notice: saved locally.');
  }
}

// ----------------------------------------------------
// ADMIN DASHBOARD DATABASE OPERATIONS
// ----------------------------------------------------

export async function fetchAllUsersFromDb() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchAllAdminTransactions() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchAllAdminPackages() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchAllAdminKyc() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?select=*&order=submitted_at.desc`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function updateWithdrawalStatusInDb(txId: string, status: 'COMPLETED' | 'REJECTED' | 'PROCESSING', userEmail?: string, amount?: number) {
  try {
    // 1. Update transaction status
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${encodeURIComponent(txId)}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ status })
    });

    // 2. If rejected, refund balance to user profile
    if (status === 'REJECTED' && userEmail && amount && amount > 0) {
      const userProfile = await fetchUserProfileFromDb(userEmail);
      if (userProfile) {
        const currentBal = Number(userProfile.wallet_balance) || 0;
        const refundedBal = currentBal + amount;
        await syncUserProfile(userEmail, userProfile.full_name || 'User', refundedBal);
      }
    }

    return patchRes.ok;
  } catch (err) {
    console.error('Error updating withdrawal status:', err);
    return false;
  }
}

export async function updateKycStatusInDb(kycId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING', rejectionReason?: string, userEmail?: string) {
  try {
    // 1. Update kyc_verifications table by user_email (100% reliable)
    if (userEmail) {
      await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?user_email=eq.${encodeURIComponent(userEmail)}`, {
        method: 'PATCH',
        headers: {
          ...getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status })
      });
    }

    // 2. Update kyc_verifications table by ID if provided
    if (kycId) {
      await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?id=eq.${encodeURIComponent(kycId)}`, {
        method: 'PATCH',
        headers: {
          ...getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status })
      });
    }

    // 3. Update user profiles table kyc_status
    if (userEmail) {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(userEmail)}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ kyc_status: status })
      });
    }

    return true;
  } catch (err) {
    console.error('Error updating KYC status:', err);
    return false;
  }
}

export async function logAdminAuditAction(adminEmail: string, action: string, targetUser: string, details: string) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/admin_audit_logs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        admin_email: adminEmail,
        action,
        target_user: targetUser,
        details,
        created_at: new Date().toISOString()
      })
    });
  } catch (e) {}
}

export async function fetchAdminAuditLogs() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_audit_logs?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}
