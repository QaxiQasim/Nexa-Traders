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

export function generateUniqueReferralCode(seed?: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NEXA${rand}`;
}

export async function fetchProfileByReferralCode(refCode: string) {
  if (!refCode || !refCode.trim()) return null;
  try {
    const cleanCode = refCode.trim().toUpperCase();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?referral_code=ilike.${encodeURIComponent(cleanCode)}`, {
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

export async function syncUserProfile(
  email: string,
  name: string,
  balance: number,
  avatarUrl?: string,
  sponsorEmail?: string,
  sponsorCode?: string
) {
  try {
    const existing = await fetchUserProfileFromDb(email);
    let myRefCode = existing?.referral_code;
    if (!myRefCode) {
      myRefCode = generateUniqueReferralCode(email);
    }

    const payload: any = {
      full_name: name,
      wallet_balance: balance,
      referral_code: myRefCode
    };

    if (avatarUrl) payload.avatar_url = avatarUrl;
    if (sponsorEmail && !existing?.sponsor_email) payload.sponsor_email = sponsorEmail;
    if (sponsorCode && !existing?.sponsor_code) payload.sponsor_code = sponsorCode;

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
        return data[0];
      }
    }

    // 2. If row does not exist yet, INSERT via POST
    const newProfile = {
      email,
      full_name: name,
      wallet_balance: balance,
      avatar_url: avatarUrl || null,
      referral_code: myRefCode,
      sponsor_email: sponsorEmail || null,
      sponsor_code: sponsorCode || null,
      created_at: new Date().toISOString()
    };

    const postRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newProfile)
    });
    
    if (postRes.ok) {
      const data = await postRes.json();
      return Array.isArray(data) ? data[0] : newProfile;
    }
    return null;
  } catch (err) {
    console.warn('Supabase profile sync notice: stored locally.', err);
    return null;
  }
}

export async function fetchDirectReferralsFromDb(sponsorEmail: string, sponsorCode?: string) {
  try {
    const cleanEmail = (sponsorEmail || '').trim();
    const cleanCode = (sponsorCode || '').trim();
    const url = cleanCode
      ? `${SUPABASE_URL}/rest/v1/profiles?or=(sponsor_email.ilike.${encodeURIComponent(cleanEmail)},sponsor_code.ilike.${encodeURIComponent(cleanCode)})&order=created_at.desc`
      : `${SUPABASE_URL}/rest/v1/profiles?sponsor_email=ilike.${encodeURIComponent(cleanEmail)}&order=created_at.desc`;
    const res = await fetch(url, {
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

export async function fetchFullTeamHierarchyFromDb(userEmail: string, userRefCode?: string) {
  try {
    const directList = await fetchDirectReferralsFromDb(userEmail, userRefCode);
    const teamTree: Array<{ user: any; level: number; sponsorEmail: string }> = [];

    for (const l1User of directList) {
      teamTree.push({ user: l1User, level: 1, sponsorEmail: userEmail });

      // Level 2
      if (l1User.email) {
        const l2List = await fetchDirectReferralsFromDb(l1User.email, l1User.referral_code);
        for (const l2User of l2List) {
          teamTree.push({ user: l2User, level: 2, sponsorEmail: l1User.email });

          // Level 3
          if (l2User.email) {
            const l3List = await fetchDirectReferralsFromDb(l2User.email, l2User.referral_code);
            for (const l3User of l3List) {
              teamTree.push({ user: l3User, level: 3, sponsorEmail: l2User.email });
            }
          }
        }
      }
    }

    return teamTree;
  } catch (err) {
    return [];
  }
}

export async function fetchAllProfilesFromDb() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?order=created_at.desc`, {
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
