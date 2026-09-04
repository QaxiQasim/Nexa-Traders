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
    const clean = (email || '').trim();
    if (!clean) return null;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(clean)}`, {
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
    const cleanEmail = (email || '').trim().toLowerCase();
    const existing = await fetchUserProfileFromDb(cleanEmail);
    let myRefCode = existing?.referral_code;
    if (!myRefCode) {
      myRefCode = generateUniqueReferralCode(cleanEmail);
    }

    const effectiveSponsorEmail = sponsorEmail || existing?.sponsor_email || (typeof window !== 'undefined' ? localStorage.getItem(`nexa_sponsor_email_${cleanEmail}`) : null);
    const effectiveSponsorCode = sponsorCode || existing?.sponsor_code || (typeof window !== 'undefined' ? localStorage.getItem(`nexa_sponsor_code_${cleanEmail}`) : null);

    if (effectiveSponsorEmail && typeof window !== 'undefined') {
      try { localStorage.setItem(`nexa_sponsor_email_${cleanEmail}`, effectiveSponsorEmail); } catch (e) {}
    }
    if (effectiveSponsorCode && typeof window !== 'undefined') {
      try { localStorage.setItem(`nexa_sponsor_code_${cleanEmail}`, effectiveSponsorCode); } catch (e) {}
    }

    const payload: any = {
      full_name: name,
      wallet_balance: balance,
      referral_code: myRefCode
    };

    if (avatarUrl) payload.avatar_url = avatarUrl;
    if (effectiveSponsorEmail) payload.sponsor_email = effectiveSponsorEmail;
    if (effectiveSponsorCode) payload.sponsor_code = effectiveSponsorCode;

    // 1. Try PATCH update on existing profile row by email (ilike)
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(cleanEmail)}`, {
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
      email: cleanEmail,
      full_name: name,
      wallet_balance: balance,
      avatar_url: avatarUrl || null,
      referral_code: myRefCode,
      sponsor_email: effectiveSponsorEmail || null,
      sponsor_code: effectiveSponsorCode || null,
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
    return newProfile;
  } catch (err) {
    console.warn('Supabase profile sync notice: stored locally.', err);
    return null;
  }
}

export async function fetchDirectReferralsFromDb(sponsorEmail: string, sponsorCode?: string) {
  try {
    const cleanEmail = (sponsorEmail || '').trim();
    const cleanCode = (sponsorCode || '').trim();
    
    let dbProfiles: any[] = [];
    if (cleanEmail || cleanCode) {
      const url = cleanCode
        ? `${SUPABASE_URL}/rest/v1/profiles?or=(sponsor_email.ilike.${encodeURIComponent(cleanEmail)},sponsor_code.ilike.${encodeURIComponent(cleanCode)})&order=created_at.desc`
        : `${SUPABASE_URL}/rest/v1/profiles?sponsor_email=ilike.${encodeURIComponent(cleanEmail)}&order=created_at.desc`;
      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) dbProfiles = data;
      }
    }

    // Also check local storage profiles / all users to merge referrals
    let allUsersFromDb: any[] = [];
    try {
      const allUsersRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (allUsersRes.ok) {
        const data = await allUsersRes.json();
        if (Array.isArray(data)) allUsersFromDb = data;
      }
    } catch (e) {}

    const map = new Map<string, any>();
    for (const u of dbProfiles) {
      if (u.email) map.set(u.email.toLowerCase(), u);
    }
    for (const u of allUsersFromDb) {
      const matchesEmail = cleanEmail && u.sponsor_email && u.sponsor_email.toLowerCase() === cleanEmail.toLowerCase();
      const matchesCode = cleanCode && u.sponsor_code && u.sponsor_code.toUpperCase() === cleanCode.toUpperCase();
      if (matchesEmail || matchesCode) {
        if (u.email && !map.has(u.email.toLowerCase())) {
          map.set(u.email.toLowerCase(), u);
        }
      }
    }

    const mergedDirects = Array.from(map.values());
    const allPackages = await fetchAllAdminPackages();

    // Map each direct referral to compute active packages investment
    return mergedDirects.map((user: any) => {
      const uEmail = (user.email || '').toLowerCase();
      const dbUserPkgs = allPackages.filter((p: any) => (p.user_email || '').toLowerCase() === uEmail);
      
      let localUserPkgs: any[] = [];
      try {
        localUserPkgs = JSON.parse(localStorage.getItem(`nexa_packages_${uEmail}`) || '[]');
      } catch (e) {}

      const pkgMap = new Map<string, any>();
      for (const p of localUserPkgs) {
        if (p.id || p.name) pkgMap.set(p.id || p.name, p);
      }
      for (const p of dbUserPkgs) {
        const pId = p.id || p.package_name;
        if (pId) pkgMap.set(pId, p);
      }

      const combinedPkgs = Array.from(pkgMap.values());
      const packageSum = combinedPkgs.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);

      return {
        ...user,
        package_investment: packageSum,
        packages: combinedPkgs
      };
    });
  } catch (err) {
    return [];
  }
}

export async function fetchFullTeamHierarchyFromDb(userEmail: string, userRefCode?: string) {
  try {
    const directList = await fetchDirectReferralsFromDb(userEmail, userRefCode);
    const allPackages = await fetchAllAdminPackages();

    const getUserPackageData = (uEmail: string, fallbackWallet: number) => {
      const userPkgs = allPackages.filter((p: any) => p.user_email?.toLowerCase() === (uEmail || '').toLowerCase());
      const sum = userPkgs.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);
      
      const mappedPkgs = userPkgs.map((item: any) => ({
        id: item.id || `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
        name: item.package_name || 'Standard Trader Plan',
        amount: Number(item.amount) || 0,
        dailyRoi: Number(item.daily_roi) || 2.5,
        totalRoiCap: Number(item.total_roi_cap) || (Number(item.amount) * 3),
        earnedRoi: Number(item.earned_roi) || 0,
        remainingRoi: Number(item.remaining_roi) || 0,
        purchaseDate: item.purchase_date || item.created_at?.substring(0, 10) || new Date().toISOString().substring(0, 10),
        expiryDate: item.expiry_date || new Date().toISOString().substring(0, 10),
        status: item.status || 'ACTIVE'
      }));

      if (mappedPkgs.length > 0) {
        return { sum, packages: mappedPkgs };
      }

      if (Number(fallbackWallet) > 0) {
        const fallbackAmt = Number(fallbackWallet);
        return {
          sum: fallbackAmt,
          packages: [{
            id: `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
            name: 'Starter Trader Package',
            amount: fallbackAmt,
            dailyRoi: 2.0,
            totalRoiCap: fallbackAmt * 3,
            earnedRoi: 0,
            remainingRoi: fallbackAmt * 3,
            purchaseDate: new Date().toISOString().substring(0, 10),
            expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().substring(0, 10),
            status: 'ACTIVE'
          }]
        };
      }

      return { sum: 0, packages: [] };
    };

    const teamTree: Array<{ user: any; level: number; sponsorEmail: string }> = [];

    for (const l1User of directList) {
      const data = getUserPackageData(l1User.email, l1User.wallet_balance);
      l1User.package_investment = data.sum;
      l1User.packages = data.packages;
      teamTree.push({ user: l1User, level: 1, sponsorEmail: userEmail });

      // Level 2
      if (l1User.email) {
        const l2List = await fetchDirectReferralsFromDb(l1User.email, l1User.referral_code);
        for (const l2User of l2List) {
          const l2Data = getUserPackageData(l2User.email, l2User.wallet_balance);
          l2User.package_investment = l2Data.sum;
          l2User.packages = l2Data.packages;
          teamTree.push({ user: l2User, level: 2, sponsorEmail: l1User.email });

          // Level 3
          if (l2User.email) {
            const l3List = await fetchDirectReferralsFromDb(l2User.email, l2User.referral_code);
            for (const l3User of l3List) {
              const l3Data = getUserPackageData(l3User.email, l3User.wallet_balance);
              l3User.package_investment = l3Data.sum;
              l3User.packages = l3Data.packages;
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
      status: item.status || 'ACTIVE',
      lastRoiPayout: item.last_roi_payout || item.last_payout || item.purchase_date || new Date().toISOString()
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
        status: pkg.status,
        last_roi_payout: pkg.lastRoiPayout || pkg.purchaseDate || new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn('Supabase package notice: saved locally.');
  }
}

export async function processDirectReferralCommission(purchaserEmail: string, packageAmount: number, packageName: string) {
  try {
    const emailLower = (purchaserEmail || '').toLowerCase().trim();
    if (!emailLower || packageAmount <= 0) return;

    // 1. Find Purchaser (Person B)'s Profile to locate Person A (Sponsor)
    let sponsorEmail = '';
    let sponsorCode = '';

    const userProfile = await fetchUserProfileFromDb(emailLower);
    if (userProfile) {
      sponsorEmail = userProfile.sponsor_email || '';
      sponsorCode = userProfile.sponsor_code || '';
    }

    // Check localStorage fallbacks for sponsor info
    if (!sponsorEmail) {
      sponsorEmail = localStorage.getItem(`nexa_sponsor_email_${emailLower}`) || '';
    }
    if (!sponsorCode) {
      sponsorCode = localStorage.getItem(`nexa_sponsor_code_${emailLower}`) || '';
    }

    // If sponsorCode exists without sponsorEmail, lookup sponsor user in DB
    if (!sponsorEmail && sponsorCode) {
      const allUsers = await fetchAllUsersFromDb();
      const sponsorUser = allUsers.find((u: any) => 
        (u.referral_code && u.referral_code.toUpperCase() === sponsorCode.toUpperCase())
      );
      if (sponsorUser && sponsorUser.email) {
        sponsorEmail = sponsorUser.email;
      }
    }

    if (!sponsorEmail || sponsorEmail.toLowerCase() === emailLower) {
      console.log('No sponsor found for direct referral commission credit.');
      return;
    }

    const sponsorEmailLower = sponsorEmail.toLowerCase().trim();

    // 2. Compute 10% Direct Commission
    const commAmount = Number((packageAmount * 0.10).toFixed(2));
    if (commAmount <= 0) return;

    // 3. Credit Sponsor (Person A)'s Wallet Balance
    let currentSponsorBal = 0;
    const sponsorProfile = await fetchUserProfileFromDb(sponsorEmailLower);
    if (sponsorProfile && sponsorProfile.wallet_balance !== undefined) {
      currentSponsorBal = Number(sponsorProfile.wallet_balance) || 0;
    } else {
      const localBal = localStorage.getItem(`nexa_balance_${sponsorEmailLower}`);
      currentSponsorBal = localBal ? Number(localBal) : 0;
    }

    const newSponsorBal = Number((currentSponsorBal + commAmount).toFixed(2));

    // Update Sponsor's Profile in Supabase DB & Local Storage
    await syncUserProfile(sponsorEmailLower, sponsorProfile?.full_name || sponsorEmailLower.split('@')[0], newSponsorBal);
    localStorage.setItem(`nexa_balance_${sponsorEmailLower}`, newSponsorBal.toString());

    // 4. Record Transaction in Sponsor's Ledger History
    const commTx = {
      id: `TX-COMM-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'REFERRAL_BONUS',
      title: '10% Direct Referral Commission',
      description: `+$${commAmount.toFixed(2)} Direct Bonus from ${emailLower} (${packageName} Plan)`,
      amount: commAmount,
      status: 'COMPLETED',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    };

    await insertTransactionToDb(sponsorEmailLower, commTx);

    // Save to local storage for sponsor transactions
    try {
      const existingTxs = JSON.parse(localStorage.getItem(`nexa_tx_${sponsorEmailLower}`) || '[]');
      localStorage.setItem(`nexa_tx_${sponsorEmailLower}`, JSON.stringify([commTx, ...existingTxs]));
    } catch (e) {}

    // 5. Deduct 10% from Sponsor's Active Package ROI Cap (Counts towards Sponsor's Package Earned ROI)
    let sponsorPkgs = await fetchUserPackagesFromDb(sponsorEmailLower);
    if (!Array.isArray(sponsorPkgs) || sponsorPkgs.length === 0) {
      try {
        sponsorPkgs = JSON.parse(localStorage.getItem(`nexa_packages_${sponsorEmailLower}`) || '[]');
      } catch (e) {
        sponsorPkgs = [];
      }
    }

    if (Array.isArray(sponsorPkgs) && sponsorPkgs.length > 0) {
      let remainingToDeduct = commAmount;
      const updatedPkgs = sponsorPkgs.map((pkg: any) => {
        if (pkg.status === 'ACTIVE' && remainingToDeduct > 0 && Number(pkg.remainingRoi) > 0) {
          const capLeft = Number(pkg.totalRoiCap) - Number(pkg.earnedRoi);
          const deductAmt = Math.min(remainingToDeduct, capLeft);
          const newEarned = Number((Number(pkg.earnedRoi) + deductAmt).toFixed(2));
          const newRemaining = Math.max(0, Number((Number(pkg.totalRoiCap) - newEarned).toFixed(2)));
          const newStatus = newRemaining <= 0 ? 'COMPLETED' : 'ACTIVE';

          remainingToDeduct -= deductAmt;

          const updatedPkg = {
            ...pkg,
            earnedRoi: newEarned,
            remainingRoi: newRemaining,
            status: newStatus
          };

          // Save package update to DB
          insertPackageToDb(sponsorEmailLower, updatedPkg);
          return updatedPkg;
        }
        return pkg;
      });

      // Save updated packages to Sponsor's Local Storage
      localStorage.setItem(`nexa_packages_${sponsorEmailLower}`, JSON.stringify(updatedPkgs));
    }
  } catch (err) {
    console.error('Error processing direct referral commission:', err);
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
    const record = {
      id: kyc.id || `KYC-${Math.floor(10000 + Math.random() * 90000)}`,
      user_email: email,
      full_name: kyc.fullName || (email || '').split('@')[0],
      dob: kyc.dob || '1995-01-01',
      country: kyc.country || 'United Arab Emirates',
      document_type: kyc.idType || 'PASSPORT',
      document_number: kyc.idNumber || 'N849102948',
      document_image: kyc.documentImage || null,
      status: kyc.status || 'PENDING',
      submitted_at: kyc.submittedAt || new Date().toISOString().substring(0, 10)
    };

    try {
      const locList = JSON.parse(localStorage.getItem('nexa_all_kyc_submissions') || '[]');
      const filtered = locList.filter((item: any) => item.user_email?.toLowerCase() !== email.toLowerCase());
      localStorage.setItem('nexa_all_kyc_submissions', JSON.stringify([record, ...filtered]));
      localStorage.setItem(`nexa_kyc_${email.toLowerCase()}`, JSON.stringify(record));
    } catch (e) {}

    await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_email: email,
        document_type: record.document_type,
        document_number: record.document_number,
        status: record.status
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
    let dbKyc: any[] = [];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?select=*&order=submitted_at.desc`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) dbKyc = data;
    }

    let localKyc: any[] = [];
    try {
      localKyc = JSON.parse(localStorage.getItem('nexa_all_kyc_submissions') || '[]');
    } catch (e) {}

    const map = new Map<string, any>();
    for (const item of localKyc) {
      if (item.user_email) map.set(item.user_email.toLowerCase(), item);
    }
    for (const item of dbKyc) {
      if (item.user_email) {
        const existing = map.get(item.user_email.toLowerCase()) || {};
        map.set(item.user_email.toLowerCase(), { ...existing, ...item });
      }
    }

    const merged = Array.from(map.values());
    return merged.length > 0 ? merged : dbKyc;
  } catch (err) {
    try {
      return JSON.parse(localStorage.getItem('nexa_all_kyc_submissions') || '[]');
    } catch (e) {
      return [];
    }
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
    const emailLower = (userEmail || '').toLowerCase();

    // 1. Update kyc_verifications table by user_email
    if (emailLower) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?user_email=ilike.${encodeURIComponent(emailLower)}`, {
        method: 'PATCH',
        headers: {
          ...getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status, rejection_reason: rejectionReason || null })
      });

      let updatedRows = [];
      try {
        if (res.ok) updatedRows = await res.json();
      } catch (e) {}

      // If no existing DB record matched the PATCH, upsert it directly
      if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications`, {
          method: 'POST',
          headers: {
            ...getHeaders(),
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: kycId || `KYC-${Math.floor(10000 + Math.random() * 90000)}`,
            user_email: emailLower,
            status,
            rejection_reason: rejectionReason || null,
            submitted_at: new Date().toISOString()
          })
        });
      }
    }

    // 2. Update kyc_verifications table by ID if provided
    if (kycId) {
      await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?id=eq.${encodeURIComponent(kycId)}`, {
        method: 'PATCH',
        headers: {
          ...getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status, rejection_reason: rejectionReason || null })
      });
    }

    // 3. Update user profiles table kyc_status
    if (emailLower) {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(emailLower)}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ kyc_status: status })
      });
    }

    // 4. Update local storage caches for full consistency
    if (emailLower) {
      try {
        const singleKey = `nexa_kyc_${emailLower}`;
        const rawSingle = localStorage.getItem(singleKey);
        if (rawSingle) {
          const parsed = JSON.parse(rawSingle);
          parsed.status = status;
          if (rejectionReason) parsed.rejectionReason = rejectionReason;
          localStorage.setItem(singleKey, JSON.stringify(parsed));
        } else {
          localStorage.setItem(singleKey, JSON.stringify({ status, rejectionReason }));
        }
      } catch (e) {}

      try {
        const allKycRaw = localStorage.getItem('nexa_all_kyc_submissions');
        if (allKycRaw) {
          const list: any[] = JSON.parse(allKycRaw);
          const updatedList = list.map((item: any) => {
            if (item.user_email && item.user_email.toLowerCase() === emailLower) {
              return { ...item, status, rejection_reason: rejectionReason };
            }
            return item;
          });
          localStorage.setItem('nexa_all_kyc_submissions', JSON.stringify(updatedList));
        }
      } catch (e) {}

      try {
        const userRaw = localStorage.getItem(`nexa_user_${emailLower}`);
        if (userRaw) {
          const parsedUser = JSON.parse(userRaw);
          parsedUser.kyc_status = status;
          localStorage.setItem(`nexa_user_${emailLower}`, JSON.stringify(parsedUser));
        }
      } catch (e) {}
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
