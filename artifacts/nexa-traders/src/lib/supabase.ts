import { createClient } from '@supabase/supabase-js';

// NEXATRADES Supabase Configuration
export const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types for Supabase DB Tables
export interface DbProfile {
  id?: string;
  email: string;
  full_name: string;
  wallet_balance: number;
  created_at?: string;
}

export interface DbPurchasedPackage {
  id: string;
  user_email: string;
  package_name: string;
  amount: number;
  daily_roi: number;
  total_roi_cap: number;
  earned_roi: number;
  remaining_roi: number;
  purchase_date: string;
  expiry_date: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface DbKyc {
  user_email: string;
  full_name: string;
  dob: string;
  country: string;
  id_type: string;
  id_number: string;
  status: 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  submitted_at: string;
}

export interface DbTransaction {
  id: string;
  user_email: string;
  date: string;
  type: 'DEPOSIT' | 'PACKAGE_PURCHASE' | 'DAILY_ROI' | 'WITHDRAWAL';
  title: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  tx_hash?: string;
}

// ----------------------------------------------------
// SUPABASE DATABASE OPERATIONS
// ----------------------------------------------------

export async function syncUserProfile(email: string, name: string, balance: number) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ email, full_name: name, wallet_balance: balance }, { onConflict: 'email' })
      .select();
    if (error) console.warn('Supabase syncUserProfile error:', error.message);
    return data;
  } catch (err) {
    console.warn('Supabase offline or unreachable, using local storage.');
  }
}

export async function fetchUserPackagesFromDb(email: string) {
  try {
    const { data, error } = await supabase
      .from('purchased_packages')
      .select('*')
      .eq('user_email', email)
      .order('purchase_date', { ascending: false });

    if (error || !data) return null;
    return data.map(item => ({
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
    const { error } = await supabase.from('purchased_packages').insert({
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
    });
    if (error) console.warn('Supabase package insert notice:', error.message);
  } catch (err) {
    console.warn('Saved package locally.');
  }
}

export async function fetchKycFromDb(email: string) {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_email', email)
      .single();

    if (error || !data) return null;
    return {
      status: data.status,
      fullName: data.full_name,
      dob: data.dob,
      country: data.country,
      idType: data.id_type,
      idNumber: data.id_number,
      submittedAt: data.submitted_at
    };
  } catch (err) {
    return null;
  }
}

export async function upsertKycToDb(email: string, kyc: any) {
  try {
    const { error } = await supabase.from('kyc_verifications').upsert({
      user_email: email,
      full_name: kyc.fullName,
      dob: kyc.dob,
      country: kyc.country,
      id_type: kyc.idType,
      id_number: kyc.idNumber,
      status: kyc.status,
      submitted_at: kyc.submittedAt || new Date().toISOString().split('T')[0]
    }, { onConflict: 'user_email' });

    if (error) console.warn('Supabase KYC notice:', error.message);
  } catch (err) {
    console.warn('Saved KYC locally.');
  }
}

export async function fetchTransactionsFromDb(email: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_email', email)
      .order('date', { ascending: false });

    if (error || !data) return null;
    return data.map(tx => ({
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
    const { error } = await supabase.from('transactions').insert({
      id: tx.id,
      user_email: email,
      date: tx.date,
      type: tx.type,
      title: tx.title,
      amount: tx.amount,
      status: tx.status,
      tx_hash: tx.txHash
    });
    if (error) console.warn('Supabase transaction notice:', error.message);
  } catch (err) {
    console.warn('Saved transaction locally.');
  }
}
