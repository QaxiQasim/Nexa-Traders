-- =========================================================
-- NEXATRADES SUPABASE DATABASE SCHEMA SETUP
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/lgveupchdsgzoyumrofj/sql)
-- =========================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  wallet_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PURCHASED PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.purchased_packages (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  package_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  daily_roi NUMERIC NOT NULL,
  total_roi_cap NUMERIC NOT NULL,
  earned_roi NUMERIC DEFAULT 0,
  remaining_roi NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. KYC VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  dob DATE NOT NULL,
  country TEXT NOT NULL,
  id_type TEXT NOT NULL,
  id_number TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  submitted_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TRANSACTIONS LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'COMPLETED',
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and public policies for quick access
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public select packages" ON public.purchased_packages FOR SELECT USING (true);
CREATE POLICY "Allow public insert packages" ON public.purchased_packages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select kyc" ON public.kyc_verifications FOR SELECT USING (true);
CREATE POLICY "Allow public upsert kyc" ON public.kyc_verifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
