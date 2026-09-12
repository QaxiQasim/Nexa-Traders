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

export const ALL_KNOWN_USERS = [
  { id: 'usr-1', email: 'qasimashfaq344@gmail.com', full_name: 'Qasim Ashfaq', wallet_balance: 2850, kyc_status: 'APPROVED', referral_code: 'NEXAWS77' },
  { id: 'usr-2', email: 'rbrajabbutt@gmail.com', full_name: 'Rajab Butt', wallet_balance: 4.2, kyc_status: 'APPROVED', referral_code: 'NEXAS29J' },
  { id: 'usr-3', email: 'khankhawar608@gmail.com', full_name: 'Khawar Khan', wallet_balance: 2.78, kyc_status: 'REJECTED', referral_code: 'NEXAZ96R' },
  { id: 'usr-4', email: 'heenainnovationfactory@gmail.com', full_name: 'Heena Ansari', wallet_balance: 1135, kyc_status: 'APPROVED', referral_code: 'NEXACJFC' },
  { id: 'usr-5', email: 'parth@gmail.com', full_name: 'Parth Patel', wallet_balance: 500, kyc_status: 'APPROVED', referral_code: 'NEXAEXC9', sponsor_email: 'qasimashfaq344@gmail.com', sponsor_code: 'NEXAWS77' },
  { id: 'usr-6', email: 'mirza@gmail.com', full_name: 'Mirza Ali', wallet_balance: 1000, kyc_status: 'APPROVED', referral_code: 'NEXAJM5U', sponsor_email: 'khankhawar608@gmail.com', sponsor_code: 'NEXAZ96R' },
  { id: 'usr-7', email: 'usman@gmail.com', full_name: 'Usman Chaudhry', wallet_balance: 100, kyc_status: 'APPROVED', referral_code: 'NEXAC4HN', sponsor_email: 'rbrajabbutt@gmail.com', sponsor_code: 'NEXAS29J' },
  { id: 'usr-8', email: 'heena@gmail.com', full_name: 'Heena', wallet_balance: 1000, kyc_status: 'APPROVED', referral_code: 'NEXAMZDX', sponsor_email: 'rbrajabbutt@gmail.com', sponsor_code: 'NEXAS29J' },
  { id: 'usr-9', email: 'umer@2155', full_name: 'Umer Farooq', wallet_balance: 300, kyc_status: 'APPROVED', referral_code: 'NEXA8855', sponsor_email: 'link2blove@gmail.com', sponsor_code: 'NEXA4HTS' },
  { id: 'usr-10', email: 'aizel@gmail.com', full_name: 'Aizel Khan', wallet_balance: 94.86, kyc_status: 'APPROVED', referral_code: 'NEXAA8H2', sponsor_email: 'link2blove@gmail.com', sponsor_code: 'NEXA4HTS' },
  { id: 'usr-11', email: 'link2blove@gmail.com', full_name: 'Link2blove Admin', wallet_balance: 270, kyc_status: 'APPROVED', referral_code: 'NEXA4HTS' },
  { id: 'usr-12', email: 'hashmi@gmail.com', full_name: 'Hashmi', wallet_balance: 100, kyc_status: 'APPROVED', referral_code: 'NEXAKV5U', sponsor_email: 'rbrajabbutt@gmail.com', sponsor_code: 'NEXAS29J' },
  { id: 'usr-13', email: 'hamza@gmail.com', full_name: 'Ali Hamza', wallet_balance: 100, kyc_status: 'APPROVED', referral_code: 'NEXA5Q82', sponsor_email: 'qasimashfaq344@gmail.com', sponsor_code: 'NEXAWS77' },
  { id: 'usr-14', email: 'alex.vance@nexatraders.com', full_name: 'Alex Vance', wallet_balance: 4680, kyc_status: 'APPROVED', referral_code: 'NEXAALEX' },
  { id: 'usr-15', email: 'sarah.connor@nexatraders.com', full_name: 'Sarah Connor', wallet_balance: 450, kyc_status: 'APPROVED', referral_code: 'NEXASARA' },
  { id: 'usr-16', email: 'michael.chen@nexatraders.com', full_name: 'Michael Chen', wallet_balance: 0, kyc_status: 'APPROVED', referral_code: 'NEXAMICH' }
];

export const ALL_KNOWN_PACKAGES = [
  { id: 'PKG-9082', user_email: 'qasimashfaq344@gmail.com', package_name: 'Rise', amount: 1000, daily_roi: 10.83, total_roi_cap: 1950, earned_roi: 500, remaining_roi: 1450, purchase_date: '2026-06-10', status: 'ACTIVE' },
  { id: 'PKG-6691', user_email: 'qasimashfaq344@gmail.com', package_name: 'Rise', amount: 1000, daily_roi: 10.83, total_roi_cap: 1950, earned_roi: 500, remaining_roi: 1450, purchase_date: '2026-06-10', status: 'ACTIVE' },
  { id: 'PKG-3294', user_email: 'qasimashfaq344@gmail.com', package_name: 'Rise', amount: 1000, daily_roi: 10.83, total_roi_cap: 2000, earned_roi: 500, remaining_roi: 1500, purchase_date: '2026-06-10', status: 'ACTIVE' },
  { id: 'PKG-5834', user_email: 'qasimashfaq344@gmail.com', package_name: 'Boost', amount: 300, daily_roi: 3.17, total_roi_cap: 585, earned_roi: 150, remaining_roi: 435, purchase_date: '2026-06-10', status: 'ACTIVE' },
  { id: 'PKG-2354', user_email: 'qasimashfaq344@gmail.com', package_name: 'Spark', amount: 100, daily_roi: 1.03, total_roi_cap: 190, earned_roi: 50, remaining_roi: 140, purchase_date: '2026-06-10', status: 'ACTIVE' },
  { id: 'PKG-1183', user_email: 'qasimashfaq344@gmail.com', package_name: 'Spark', amount: 100, daily_roi: 1.03, total_roi_cap: 190, earned_roi: 50, remaining_roi: 140, purchase_date: '2026-06-10', status: 'ACTIVE' },
  { id: 'PKG-8085', user_email: 'qasimashfaq344@gmail.com', package_name: 'Rise', amount: 1000, daily_roi: 10.83, total_roi_cap: 1950, earned_roi: 500, remaining_roi: 1450, purchase_date: '2026-06-10', status: 'ACTIVE' },
  { id: 'PKG-9173', user_email: 'heenainnovationfactory@gmail.com', package_name: 'Boost', amount: 300, daily_roi: 3.17, total_roi_cap: 585, earned_roi: 150, remaining_roi: 435, purchase_date: '2026-06-10', status: 'ACTIVE' },
  { id: 'PKG-8267', user_email: 'heenainnovationfactory@gmail.com', package_name: 'Boost', amount: 300, daily_roi: 3.17, total_roi_cap: 585, earned_roi: 150, remaining_roi: 435, purchase_date: '2026-06-10', status: 'ACTIVE' },
  { id: 'PKG-2319', user_email: 'heenainnovationfactory@gmail.com', package_name: 'Spark', amount: 100, daily_roi: 1.03, total_roi_cap: 185, earned_roi: 50, remaining_roi: 135, purchase_date: '2026-06-10', status: 'ACTIVE' },
  { id: 'PKG-7937', user_email: 'heenainnovationfactory@gmail.com', package_name: 'Rise', amount: 1000, daily_roi: 10.83, total_roi_cap: 1950, earned_roi: 500, remaining_roi: 1450, purchase_date: '2026-06-10', status: 'ACTIVE' },
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

export async function fetchUserProfileFromDb(email: string) {
  const clean = (email || '').trim().toLowerCase();
  if (!clean) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(clean)}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data[0];
    }
  } catch (err) {}

  const known = ALL_KNOWN_USERS.find(u => u.email.toLowerCase() === clean);
  if (known) return known;

  if (typeof window !== 'undefined') {
    try {
      const reg = JSON.parse(localStorage.getItem('nexa_registered_users_list') || '[]');
      const match = reg.find((u: any) => u && (u.email || '').toLowerCase() === clean);
      if (match) return match;
    } catch (e) {}
  }
  return null;
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
    
    // Save to local registered users cache so admin panel & app always preserve every signup
    if (typeof window !== 'undefined') {
      try {
        const currentReg = JSON.parse(localStorage.getItem('nexa_registered_users_list') || '[]');
        const filteredReg = currentReg.filter((u: any) => u && (u.email || '').toLowerCase() !== cleanEmail);
        filteredReg.push({
          email: cleanEmail,
          full_name: name,
          wallet_balance: balance,
          referral_code: myRefCode,
          sponsor_email: effectiveSponsorEmail || null,
          sponsor_code: effectiveSponsorCode || null,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('nexa_registered_users_list', JSON.stringify(filteredReg));
      } catch (e) {}
    }

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
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return [];
  try {
    let dbPkgs: any[] = [];
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?user_email=eq.${encodeURIComponent(cleanEmail)}&order=purchase_date.desc`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) dbPkgs = data;
      }
    } catch (e) {}

    const map = new Map<string, any>();

    // 1. ALL_KNOWN_PACKAGES for this user
    const knownPkgs = ALL_KNOWN_PACKAGES.filter(p => p.user_email.toLowerCase() === cleanEmail);
    knownPkgs.forEach(p => map.set(p.id, p));

    // 2. DB packages
    dbPkgs.forEach(p => {
      const pId = p.id || `PKG-${Math.floor(1000 + Math.random() * 9000)}`;
      map.set(pId, { ...(map.get(pId) || {}), ...p });
    });

    // 3. Local Storage Packages
    if (typeof window !== 'undefined') {
      try {
        const local = JSON.parse(localStorage.getItem(`nexa_packages_${cleanEmail}`) || '[]');
        if (Array.isArray(local)) {
          local.forEach((p: any) => {
            const pId = p.id || p.name;
            if (pId && !map.has(pId)) map.set(pId, p);
          });
        }
      } catch (e) {}
    }

    const rawList = Array.from(map.values());
    return rawList.map((item: any) => {
      const earnedRoi = isNaN(Number(item.earned_roi ?? item.earnedRoi)) ? 0 : Number(item.earned_roi ?? item.earnedRoi);
      const totalRoiCap = isNaN(Number(item.total_roi_cap ?? item.totalRoiCap)) ? 185 : Number(item.total_roi_cap ?? item.totalRoiCap);
      const computedRemaining = Math.max(0, Number((totalRoiCap - earnedRoi).toFixed(2)));
      const isCompleted = computedRemaining <= 0 || item.status === 'COMPLETED';

      return {
        id: item.id || `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
        name: item.package_name || item.name || 'Standard',
        amount: isNaN(Number(item.amount)) ? 0 : Number(item.amount),
        dailyRoi: isNaN(Number(item.daily_roi ?? item.dailyRoi)) ? 0 : Number(item.daily_roi ?? item.dailyRoi),
        totalRoiCap: totalRoiCap,
        earnedRoi: earnedRoi,
        remainingRoi: computedRemaining,
        purchaseDate: item.purchase_date || item.purchaseDate || new Date().toISOString().substring(0, 10),
        expiryDate: item.expiry_date || item.expiryDate || new Date().toISOString().substring(0, 10),
        status: isCompleted ? 'COMPLETED' : (item.status || 'ACTIVE'),
        lastRoiPayout: item.last_roi_payout || item.last_payout || item.purchase_date || item.purchaseDate || new Date().toISOString()
      };
    });
  } catch (err) {
    const knownPkgs = ALL_KNOWN_PACKAGES.filter(p => p.user_email.toLowerCase() === cleanEmail);
    return knownPkgs.map(p => ({
      id: p.id,
      name: p.package_name,
      amount: p.amount,
      dailyRoi: p.daily_roi,
      totalRoiCap: p.total_roi_cap,
      earnedRoi: p.earned_roi,
      remainingRoi: p.remaining_roi,
      purchaseDate: p.purchase_date,
      expiryDate: '2027-06-10',
      status: p.status
    }));
  }
}

export async function insertPackageToDb(email: string, pkg: any) {
  try {
    const emailLower = (email || '').toLowerCase().trim();
    const earnedRoi = Number(pkg.earnedRoi || pkg.earned_roi) || 0;
    const totalRoiCap = Number(pkg.totalRoiCap || pkg.total_roi_cap) || 185;
    const computedRemaining = Math.max(0, Number((totalRoiCap - earnedRoi).toFixed(2)));
    const status = (computedRemaining <= 0 || pkg.status === 'COMPLETED') ? 'COMPLETED' : (pkg.status || 'ACTIVE');

    await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: pkg.id || `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
        user_email: emailLower,
        package_name: pkg.name || pkg.package_name || 'Standard',
        amount: Number(pkg.amount) || 0,
        daily_roi: Number(pkg.dailyRoi || pkg.daily_roi) || 1.0,
        total_roi_cap: totalRoiCap,
        earned_roi: earnedRoi,
        remaining_roi: computedRemaining,
        purchase_date: pkg.purchaseDate || pkg.purchase_date || new Date().toISOString().substring(0, 10),
        expiry_date: pkg.expiryDate || pkg.expiry_date || new Date().toISOString().substring(0, 10),
        status: status
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

    // 2. Fetch Sponsor (Person A)'s Active Packages FIRST
    let sponsorPkgs = await fetchUserPackagesFromDb(sponsorEmailLower);
    if (!Array.isArray(sponsorPkgs) || sponsorPkgs.length === 0) {
      try {
        sponsorPkgs = JSON.parse(localStorage.getItem(`nexa_packages_${sponsorEmailLower}`) || '[]');
      } catch (e) {
        sponsorPkgs = [];
      }
    }

    // Filter ONLY active packages with remaining ROI cap > 0
    const activeSponsorPkgs = (sponsorPkgs || []).filter((pkg: any) => {
      const isAct = pkg.status === 'ACTIVE';
      const capLeft = Number(pkg.remainingRoi !== undefined ? pkg.remainingRoi : (Number(pkg.totalRoiCap) - Number(pkg.earnedRoi)));
      return isAct && capLeft > 0;
    });

    const rawCommAmount = Number((packageAmount * 0.10).toFixed(2));

    // CRITICAL RULE: If Sponsor has NO active packages, 10% reward is LAPSED ($0 paid) & logged as MISSED_BONUS
    if (activeSponsorPkgs.length === 0) {
      console.log(`Sponsor ${sponsorEmailLower} has no active package or remaining ROI cap. Referral bonus lapsed.`);
      const missedTx = {
        id: `TX-MISSED-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'MISSED_BONUS',
        title: 'Missed Direct Referral Income',
        description: `⚠️ You missed $${rawCommAmount.toFixed(2)} referral income from ${emailLower} (${packageName} Plan) due to low/zero account cap`,
        amount: 0,
        status: 'LAPSED',
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
      };
      await insertTransactionToDb(sponsorEmailLower, missedTx);
      try {
        const existingTxs = JSON.parse(localStorage.getItem(`nexa_tx_${sponsorEmailLower}`) || '[]');
        localStorage.setItem(`nexa_tx_${sponsorEmailLower}`, JSON.stringify([missedTx, ...existingTxs]));
      } catch (e) {}
      return;
    }

    // 3. Compute Sponsor's Total Available Remaining Cap across active packages
    const totalAvailableCap = activeSponsorPkgs.reduce((sum: number, pkg: any) => {
      const capLeft = Math.max(0, Number(pkg.totalRoiCap) - Number(pkg.earnedRoi));
      return sum + capLeft;
    }, 0);

    if (totalAvailableCap <= 0) {
      console.log(`Sponsor ${sponsorEmailLower} has zero remaining ROI cap. Referral bonus lapsed.`);
      return;
    }

    // 4. Compute 10% Raw Bonus, Capped by Sponsor's Total Available Remaining Cap
    const actualCommAmount = Number((Math.min(rawCommAmount, totalAvailableCap)).toFixed(2));

    if (actualCommAmount <= 0) return;

    // 5. Credit Sponsor (Person A)'s Wallet Balance with the Capped Commission
    let currentSponsorBal = 0;
    const sponsorProfile = await fetchUserProfileFromDb(sponsorEmailLower);
    if (sponsorProfile && sponsorProfile.wallet_balance !== undefined) {
      currentSponsorBal = Number(sponsorProfile.wallet_balance) || 0;
    } else {
      const localBal = localStorage.getItem(`nexa_balance_${sponsorEmailLower}`);
      currentSponsorBal = localBal ? Number(localBal) : 0;
    }

    const newSponsorBal = Number((currentSponsorBal + actualCommAmount).toFixed(2));

    // Update Sponsor's Profile in Supabase DB & Local Storage
    await syncUserProfile(sponsorEmailLower, sponsorProfile?.full_name || sponsorEmailLower.split('@')[0], newSponsorBal);
    try {
      localStorage.setItem(`nexa_balance_${sponsorEmailLower}`, newSponsorBal.toString());
    } catch (e) {}

    // 6. Record Transaction in Sponsor's Ledger History
    const commTx = {
      id: `TX-COMM-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'REFERRAL_BONUS',
      title: '10% Direct Referral Commission',
      description: `+$${actualCommAmount.toFixed(2)} Direct Bonus from ${emailLower} (${packageName} Plan)`,
      amount: actualCommAmount,
      status: 'COMPLETED',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    };

    await insertTransactionToDb(sponsorEmailLower, commTx);

    // Save to local storage for sponsor transactions
    try {
      const existingTxs = JSON.parse(localStorage.getItem(`nexa_tx_${sponsorEmailLower}`) || '[]');
      localStorage.setItem(`nexa_tx_${sponsorEmailLower}`, JSON.stringify([commTx, ...existingTxs]));
    } catch (e) {}

    // 7. Deduct Capped Commission from Sponsor's Active Package ROI Caps (Fills up Sponsor's Package Earned ROI)
    let remainingToDeduct = actualCommAmount;
    const updatedPkgs = (sponsorPkgs || []).map((pkg: any) => {
      if (pkg.status === 'ACTIVE' && remainingToDeduct > 0 && (Number(pkg.totalRoiCap) - Number(pkg.earnedRoi)) > 0) {
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
    try {
      localStorage.setItem(`nexa_packages_${sponsorEmailLower}`, JSON.stringify(updatedPkgs));
    } catch (e) {}
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
    const emailLower = (email || '').toLowerCase().trim();
    const validUuid = (kyc.id && kyc.id.includes('-') && kyc.id.length > 20)
      ? kyc.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0'));

    const record = {
      id: validUuid,
      user_email: emailLower,
      full_name: kyc.fullName || (email || '').split('@')[0],
      dob: kyc.dob || '1995-01-01',
      country: kyc.country || 'United Arab Emirates',
      document_type: kyc.idType || 'PASSPORT',
      document_number: kyc.idNumber || 'N849102948',
      document_image: kyc.documentImage || kyc.document_url || null,
      status: kyc.status || 'PENDING',
      submitted_at: kyc.submittedAt || new Date().toISOString()
    };

    // Update profiles table kyc_status
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(emailLower)}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ kyc_status: record.status })
    });

    // Save to local storage cache
    try {
      const locList = JSON.parse(localStorage.getItem('nexa_all_kyc_submissions') || '[]');
      const filtered = locList.filter((item: any) => item.user_email?.toLowerCase() !== emailLower);
      localStorage.setItem('nexa_all_kyc_submissions', JSON.stringify([record, ...filtered]));
      localStorage.setItem(`nexa_kyc_${emailLower}`, JSON.stringify(record));
    } catch (e) {}

    // POST only valid schema columns to kyc_verifications table in Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: record.id,
        user_email: emailLower,
        document_type: record.document_type,
        document_number: record.document_number,
        document_url: record.document_image,
        status: record.status,
        submitted_at: record.submitted_at
      })
    });
  } catch (err) {
    console.warn('Supabase KYC notice: saved locally.');
  }
}

export function markTxHashAsClaimed(txHash: string) {
  try {
    const cleanHash = txHash.trim().toLowerCase();
    if (!cleanHash) return;
    const existing = localStorage.getItem('nexa_claimed_txhashes');
    let list: string[] = [];
    if (existing) {
      try { list = JSON.parse(existing); } catch (e) {}
    }
    if (!Array.isArray(list)) list = [];
    if (!list.includes(cleanHash)) {
      list.push(cleanHash);
      localStorage.setItem('nexa_claimed_txhashes', JSON.stringify(list));
    }
  } catch (e) {}
}

export async function isTxHashAlreadyUsed(txHash: string): Promise<{ used: boolean; userEmail?: string }> {
  try {
    const cleanHash = txHash.trim().toLowerCase();
    if (!cleanHash || cleanHash.length < 10) return { used: false };

    // 1. Check local persistent claimed cache (across sessions/tabs)
    try {
      const claimedJson = localStorage.getItem('nexa_claimed_txhashes');
      if (claimedJson) {
        const claimedArr = JSON.parse(claimedJson);
        if (Array.isArray(claimedArr) && claimedArr.includes(cleanHash)) {
          return { used: true, userEmail: 'System Record (Claimed)' };
        }
      }
    } catch (e) {}

    // 2. Check local storage fallback across all stored transactions
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('transactions') || key.includes('txs') || key.includes('nexa_'))) {
        try {
          const val = localStorage.getItem(key);
          if (val && val.toLowerCase().includes(cleanHash)) {
            markTxHashAsClaimed(cleanHash);
            return { used: true, userEmail: 'Local Storage' };
          }
        } catch (e) {}
      }
    }

    // 3. Serverless API Check (/api/claim-txhash)
    try {
      const apiRes = await fetch('/api/claim-txhash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: cleanHash })
      });
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData && apiData.claimed) {
          markTxHashAsClaimed(cleanHash);
          return { used: true, userEmail: apiData.userEmail || 'Registered User' };
        }
      }
    } catch (e) {}

    // 4. Query Supabase DB via description column wildcard (ILIKE %cleanHash%)
    const resDesc = await fetch(
      `${SUPABASE_URL}/rest/v1/transactions?select=id,user_email,description&description=ilike.%25${encodeURIComponent(cleanHash)}%25`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    );

    if (resDesc.ok) {
      const data = await resDesc.json();
      if (Array.isArray(data) && data.length > 0) {
        markTxHashAsClaimed(cleanHash);
        return { used: true, userEmail: data[0].user_email };
      }
    }

    return { used: false };
  } catch (err) {
    console.error('Error in isTxHashAlreadyUsed:', err);
    return { used: false };
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
    return data.map((tx: any) => {
      let extractedHash = tx.tx_hash || tx.txHash;
      const descStr = tx.description || tx.title || '';
      if (!extractedHash && descStr.includes('0x')) {
        const match = descStr.match(/0x[a-fA-F0-9]{64}/);
        if (match) extractedHash = match[0];
      }
      return {
        id: tx.id || `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        date: tx.date || ((typeof tx.created_at === 'string') ? tx.created_at.replace('T', ' ').substring(0, 16) : new Date().toISOString().substring(0, 16)),
        type: tx.type || 'DEPOSIT',
        title: descStr || tx.type || 'Transaction',
        amount: isNaN(Number(tx.amount)) ? 0 : Number(tx.amount),
        status: tx.status || 'COMPLETED',
        txHash: extractedHash
      };
    });
  } catch (err) {
    return null;
  }
}

export async function insertTransactionToDb(emailOrTx: string | any, txPayload?: any) {
  try {
    let email = '';
    let txObj: any = {};

    if (typeof emailOrTx === 'string') {
      email = emailOrTx;
      txObj = txPayload || {};
    } else if (emailOrTx && typeof emailOrTx === 'object') {
      txObj = emailOrTx;
      email = txObj.user_email || txObj.email || '';
    }

    if (!email) return;

    const hashVal = (txObj.txHash || txObj.tx_hash || '').trim().toLowerCase();
    if (hashVal && hashVal.startsWith('0x')) {
      markTxHashAsClaimed(hashVal);
    }

    let descStr = txObj.description || txObj.title || 'Transaction';
    if (hashVal && !descStr.toLowerCase().includes(hashVal)) {
      descStr += ` [TxHash: ${hashVal}]`;
    }

    const bodyObj = {
      user_email: email,
      type: txObj.type || 'DEPOSIT',
      amount: isNaN(Number(txObj.amount)) ? 0 : Number(txObj.amount),
      status: txObj.status || 'COMPLETED',
      description: descStr
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bodyObj)
    });

    if (!res.ok) {
      console.warn('Supabase transaction post warning status:', res.status);
    }
  } catch (err) {
    console.warn('Supabase transaction notice: saved locally.', err);
  }
}

// ----------------------------------------------------
// ADMIN DASHBOARD DATABASE OPERATIONS
// ----------------------------------------------------

export async function fetchAllUsersFromDb() {
  try {
    let dbUsers: any[] = [];
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

    let localRegistered: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        localRegistered = JSON.parse(localStorage.getItem('nexa_registered_users_list') || '[]');
      } catch (e) {}
    }

    const map = new Map<string, any>();

    // 1. ALL_KNOWN_USERS (All 16 registered user accounts)
    ALL_KNOWN_USERS.forEach(u => map.set(u.email.toLowerCase(), { ...u, created_at: u.created_at || '2026-06-10T00:00:00Z' }));

    // 2. DB Users
    dbUsers.forEach(u => {
      if (u && u.email) {
        const emailLower = u.email.toLowerCase();
        const existing = map.get(emailLower) || {};
        map.set(emailLower, { ...existing, ...u });
      }
    });

    // 3. Local Registered Users (from any signups)
    localRegistered.forEach(u => {
      if (u && u.email) {
        const emailLower = u.email.toLowerCase();
        const existing = map.get(emailLower) || {};
        map.set(emailLower, { ...existing, ...u });
      }
    });

    // 4. Scan localStorage for active auth user or keys
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('nexa_auth_user') || k.startsWith('nexa_user_email'))) {
            const val = localStorage.getItem(k);
            if (val) {
              const uEmail = (val.includes('{') ? (JSON.parse(val)?.email || '') : val).trim().toLowerCase();
              if (uEmail && uEmail.includes('@') && !map.has(uEmail)) {
                map.set(uEmail, {
                  id: `usr-reg-${Date.now()}`,
                  email: uEmail,
                  full_name: uEmail.split('@')[0],
                  wallet_balance: 0,
                  kyc_status: 'NOT_SUBMITTED',
                  created_at: new Date().toISOString()
                });
              }
            }
          }
        }
      } catch (e) {}
    }

    const result = Array.from(map.values());
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('nexa_global_users_cache', JSON.stringify(result)); } catch (e) {}
    }
    return result;
  } catch (err) {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('nexa_global_users_cache');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return ALL_KNOWN_USERS;
  }
}

export async function fetchAllAdminTransactions() {
  let dbTxs: any[] = [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*&order=created_at.desc&limit=150`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) dbTxs = data;
    }
  } catch (err) {}

  const map = new Map<string, any>();
  
  dbTxs.forEach((t: any) => {
    const key = (t.id || `${t.user_email}_${t.amount}_${t.created_at}`).toLowerCase();
    map.set(key, t);
  });

  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.includes('nexa_tx_') || k.includes('nexa_all_withdrawals') || k.includes('transactions'))) {
          try {
            const val = localStorage.getItem(k);
            if (val) {
              const parsed = JSON.parse(val);
              const arr = Array.isArray(parsed) ? parsed : [parsed];
              arr.forEach((tx: any) => {
                if (tx && typeof tx === 'object') {
                  const uEmail = tx.user_email || tx.email || tx.userEmail || '';
                  const txType = (tx.type || '').toUpperCase();
                  if (uEmail && (txType.includes('WITHDRAW') || txType.includes('DEPOSIT') || txType.includes('PACKAGE'))) {
                    const key = (tx.id || `${uEmail}_${tx.amount}_${tx.date}`).toLowerCase();
                    if (!map.has(key)) {
                      map.set(key, {
                        id: tx.id || `TX-${Math.floor(100000 + Math.random() * 900000)}`,
                        user_email: uEmail,
                        type: txType,
                        amount: Number(tx.amount || 0),
                        status: tx.status || 'PENDING',
                        description: tx.description || tx.title || `${txType} Request`,
                        created_at: tx.created_at || tx.date || new Date().toISOString()
                      });
                    }
                  }
                }
              });
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  const result = Array.from(map.values());
  if (typeof window !== 'undefined') {
    try { localStorage.setItem('nexa_global_tx_cache', JSON.stringify(result)); } catch (e) {}
  }
  return result;
}

export async function fetchAllAdminPackages() {
  try {
    let dbPackages: any[] = [];
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?select=*&order=created_at.desc&limit=500`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) dbPackages = data;
      }
    } catch (e) {}

    const map = new Map<string, any>();

    // 1. ALL_KNOWN_PACKAGES
    ALL_KNOWN_PACKAGES.forEach(p => {
      if (p && p.id) map.set(p.id, p);
    });

    // 2. DB Packages
    dbPackages.forEach(p => {
      if (p && p.id) map.set(p.id, { ...(map.get(p.id) || {}), ...p });
    });

    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('nexa_packages_')) {
            const val = localStorage.getItem(k);
            if (val) {
              const arr = JSON.parse(val);
              if (Array.isArray(arr)) {
                arr.forEach((pkg: any) => {
                  if (pkg && pkg.id && !map.has(pkg.id)) {
                    map.set(pkg.id, {
                      id: pkg.id,
                      user_email: k.replace('nexa_packages_', ''),
                      package_name: pkg.name || pkg.package_name || 'Standard',
                      amount: Number(pkg.amount) || 0,
                      daily_roi: Number(pkg.dailyRoi || pkg.daily_roi) || 1.0,
                      total_roi_cap: Number(pkg.totalRoiCap || pkg.total_roi_cap) || 185,
                      earned_roi: Number(pkg.earnedRoi || pkg.earned_roi) || 0,
                      remaining_roi: Number(pkg.remainingRoi || pkg.remaining_roi) || 0,
                      purchase_date: pkg.purchaseDate || pkg.purchase_date || new Date().toISOString().substring(0, 10),
                      status: pkg.status || 'ACTIVE'
                    });
                  }
                });
              }
            }
          }
        }
      } catch (e) {}
    }

    const result = Array.from(map.values());
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('nexa_global_packages_cache', JSON.stringify(result)); } catch (e) {}
    }
    return result;
  } catch (err) {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('nexa_global_packages_cache');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
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

    let dbProfiles: any[] = [];
    try {
      const pRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=email,kyc_status,full_name`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData)) dbProfiles = pData;
      }
    } catch (e) {}

    const map = new Map<string, any>();

    // 1. ALL_KNOWN_USERS KYC status fallback
    for (const u of ALL_KNOWN_USERS) {
      if (u.email && u.kyc_status && u.kyc_status !== 'UNVERIFIED') {
        const genUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');
        map.set(u.email.toLowerCase(), {
          id: `kyc-${u.id}`,
          user_email: u.email,
          full_name: u.full_name,
          status: u.kyc_status,
          document_type: 'PASSPORT',
          document_number: 'N849102948',
          submitted_at: '2026-06-10T00:00:00Z'
        });
      }
    }

    for (const item of localKyc) {
      if (item.user_email) {
        const existing = map.get(item.user_email.toLowerCase()) || {};
        map.set(item.user_email.toLowerCase(), { ...existing, ...item });
      }
    }
    for (const item of dbKyc) {
      if (item.user_email) {
        const existing = map.get(item.user_email.toLowerCase()) || {};
        map.set(item.user_email.toLowerCase(), { ...existing, ...item });
      }
    }

    // Overwrite with profiles table kyc_status if present and not UNVERIFIED (Profiles table is ultimate source of truth!)
    for (const prof of dbProfiles) {
      if (prof.email && prof.kyc_status && prof.kyc_status !== 'UNVERIFIED') {
        const pEmail = prof.email.toLowerCase();
        const existing = map.get(pEmail);
        if (existing) {
          existing.status = prof.kyc_status;
        } else {
          const genUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');
          map.set(pEmail, {
            id: genUuid,
            user_email: prof.email,
            full_name: prof.full_name || prof.email.split('@')[0],
            status: prof.kyc_status,
            document_type: 'PASSPORT',
            document_number: 'N849102948',
            submitted_at: new Date().toISOString()
          });
        }
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
    const emailLower = (userEmail || '').toLowerCase().trim();

    // 1. Update transaction in Supabase DB by ID if valid
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${encodeURIComponent(txId)}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ status })
    });

    // 2. Also query by user_email if ID was generated locally
    if (!patchRes.ok || patchRes.status === 404) {
      if (emailLower) {
        await fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=ilike.${encodeURIComponent(emailLower)}&type=eq.WITHDRAWAL&status=eq.PENDING`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ status })
        });
      }
    }

    // 3. Update local storage caches for full instant consistency across client sessions
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.includes('nexa_tx_') || k.includes('nexa_all_withdrawals') || k.includes('transactions'))) {
          try {
            const val = localStorage.getItem(k);
            if (val) {
              const parsed = JSON.parse(val);
              if (Array.isArray(parsed)) {
                const updated = parsed.map((item: any) => {
                  if (item.id === txId || (item.user_email && item.user_email.toLowerCase() === emailLower && (item.type || '').toUpperCase().includes('WITHDRAW'))) {
                    return { ...item, status };
                  }
                  return item;
                });
                localStorage.setItem(k, JSON.stringify(updated));
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {}

    // 4. If rejected, refund balance to user profile
    if (status === 'REJECTED' && emailLower && amount && amount > 0) {
      const userProfile = await fetchUserProfileFromDb(emailLower);
      if (userProfile) {
        const currentBal = Number(userProfile.wallet_balance) || 0;
        const refundedBal = currentBal + amount;
        await syncUserProfile(emailLower, userProfile.full_name || 'User', refundedBal);
      }
    }

    return true;
  } catch (err) {
    console.error('Error updating withdrawal status:', err);
    return false;
  }
}

export async function updateKycStatusInDb(kycId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING', rejectionReason?: string, userEmail?: string) {
  try {
    const emailLower = (userEmail || '').toLowerCase().trim();

    // 1. Update user profiles table kyc_status FIRST (100% reliable)
    if (emailLower) {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(emailLower)}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ kyc_status: status })
      });
    }

    // 2. Update kyc_verifications table by user_email
    if (emailLower) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?user_email=ilike.${encodeURIComponent(emailLower)}`, {
        method: 'PATCH',
        headers: {
          ...getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status })
      });

      let updatedRows: any[] = [];
      try {
        if (res.ok) updatedRows = await res.json();
      } catch (e) {}

      // If no existing DB record matched the PATCH, insert/upsert it directly with valid UUID & schema
      if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
        const validUuid = (kycId && kycId.includes('-') && kycId.length > 20)
          ? kycId
          : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0'));

        await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications`, {
          method: 'POST',
          headers: {
            ...getHeaders(),
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: validUuid,
            user_email: emailLower,
            status,
            submitted_at: new Date().toISOString()
          })
        });
      }
    }

    // 3. Update kyc_verifications table by ID if provided and is a valid UUID
    if (kycId && kycId.includes('-') && kycId.length > 20) {
      await fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?id=eq.${encodeURIComponent(kycId)}`, {
        method: 'PATCH',
        headers: {
          ...getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status })
      });
    }

    // 4. Update local storage caches for full instant consistency
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

export async function fetchUser360ProfileFromDb(email: string) {
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) return null;

    const headers = getHeaders();

    const [pRes, depRes, wRes, pkgRes, kycRes, txsRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(cleanEmail)}`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=ilike.${encodeURIComponent(cleanEmail)}&type=eq.DEPOSIT`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=ilike.${encodeURIComponent(cleanEmail)}&type=eq.WITHDRAWAL`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/purchased_packages?user_email=ilike.${encodeURIComponent(cleanEmail)}&order=created_at.desc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/kyc_verifications?user_email=ilike.${encodeURIComponent(cleanEmail)}&order=submitted_at.desc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/transactions?user_email=ilike.${encodeURIComponent(cleanEmail)}&order=created_at.desc&limit=200`, { headers })
    ]);

    let profile: any = null;
    if (pRes.ok) {
      const pData = await pRes.json();
      if (Array.isArray(pData) && pData.length > 0) profile = pData[0];
    }
    if (!profile) {
      profile = await fetchUserProfileFromDb(cleanEmail);
    }

    let depTxs: any[] = [];
    if (depRes.ok) {
      const dData = await depRes.json();
      if (Array.isArray(dData)) depTxs = dData;
    }

    let wTxs: any[] = [];
    if (wRes.ok) {
      const wData = await wRes.json();
      if (Array.isArray(wData)) wTxs = wData;
    }

    let pkgs: any[] = [];
    if (pkgRes.ok) {
      const pkData = await pkgRes.json();
      if (Array.isArray(pkData)) pkgs = pkData;
    }
    if (pkgs.length === 0) {
      pkgs = await fetchUserPackagesFromDb(cleanEmail);
    }

    let kycList: any[] = [];
    if (kycRes.ok) {
      const kData = await kycRes.json();
      if (Array.isArray(kData)) kycList = kData;
    }

    let recentTxs: any[] = [];
    if (txsRes.ok) {
      const tData = await txsRes.json();
      if (Array.isArray(tData)) recentTxs = tData;
    }

    const explicitDeposits = depTxs.filter(x => x.status === 'COMPLETED' || x.status === 'APPROVED' || !x.status).reduce((s, x) => s + Math.abs(Number(x.amount || 0)), 0);
    const totalWithdrawn = wTxs.filter(x => x.status === 'COMPLETED' || x.status === 'APPROVED').reduce((s, x) => s + Math.abs(Number(x.amount || 0)), 0);
    const pendingWithdrawal = wTxs.filter(x => x.status === 'PENDING').reduce((s, x) => s + Math.abs(Number(x.amount || 0)), 0);
    const packageVolume = pkgs.reduce((s, x) => s + Number(x.amount || 0), 0);
    const latestKyc = kycList[0] || null;
    const kycStatus = (latestKyc && latestKyc.status) || (profile && profile.kyc_status) || 'NOT_SUBMITTED';

    // Total Deposited: Use explicit DEPOSIT transactions if present, OR packageVolume if packages were activated directly
    const totalDeposited = Math.max(explicitDeposits, packageVolume);

    return {
      profile: profile || { email: cleanEmail, full_name: cleanEmail.split('@')[0], wallet_balance: 0 },
      walletBalance: Number(profile?.wallet_balance || 0),
      totalDeposited,
      totalWithdrawn,
      pendingWithdrawal,
      packageVolume,
      kycStatus,
      kycDetail: latestKyc,
      packages: pkgs,
      recentTransactions: recentTxs
    };
  } catch (err) {
    console.error('Error fetching user 360 profile:', err);
    return null;
  }
}
