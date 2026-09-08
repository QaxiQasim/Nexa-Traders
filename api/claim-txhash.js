// Vercel Serverless Function: Global TxHash Anti-Replay Protection
const SUPABASE_URL = 'https://lgveupchdsgzoyumrofj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hLwz5RxhL_olEQNyc2zRCg_vVFSg4EN';

// Global In-Memory Cache across warm serverless instances
const globalClaimedSet = new Set();

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const { txHash, email } = body || {};
    if (!txHash || typeof txHash !== 'string') {
      return res.status(400).json({ claimed: true, error: 'TxHash is required.' });
    }

    const cleanHash = txHash.trim().toLowerCase();
    if (!cleanHash.startsWith('0x') || cleanHash.length !== 66) {
      return res.status(400).json({ claimed: true, error: 'Invalid BEP20 TxHash format.' });
    }

    // 1. Check server in-memory set
    if (globalClaimedSet.has(cleanHash)) {
      return res.status(200).json({
        claimed: true,
        error: `TxHash (${cleanHash.substring(0, 10)}...) has ALREADY been claimed on this platform. Duplicate claims are strictly prohibited.`
      });
    }

    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };

    // 2. Query Supabase transactions table by title containing cleanHash
    const searchUrl1 = `${SUPABASE_URL}/rest/v1/transactions?select=id,user_email,title&title=ilike.%25${encodeURIComponent(cleanHash)}%25`;
    const dbRes1 = await fetch(searchUrl1, { headers });
    if (dbRes1.ok) {
      const data1 = await dbRes1.json();
      if (Array.isArray(data1) && data1.length > 0) {
        globalClaimedSet.add(cleanHash);
        return res.status(200).json({
          claimed: true,
          userEmail: data1[0].user_email,
          error: `TxHash has ALREADY been claimed by registered user (${data1[0].user_email}). Replay usage is strictly blocked.`
        });
      }
    }

    // 3. Query Supabase transactions table by tx_hash column
    const searchUrl2 = `${SUPABASE_URL}/rest/v1/transactions?select=id,user_email,tx_hash&tx_hash=eq.${encodeURIComponent(cleanHash)}`;
    const dbRes2 = await fetch(searchUrl2, { headers });
    if (dbRes2.ok) {
      const data2 = await dbRes2.json();
      if (Array.isArray(data2) && data2.length > 0) {
        globalClaimedSet.add(cleanHash);
        return res.status(200).json({
          claimed: true,
          userEmail: data2[0].user_email,
          error: `TxHash has ALREADY been claimed by registered user (${data2[0].user_email}). Replay usage is strictly blocked.`
        });
      }
    }

    // Hash is clean! Mark in memory set
    globalClaimedSet.add(cleanHash);

    return res.status(200).json({
      claimed: false,
      message: 'TxHash is clean and unclaimed.'
    });
  } catch (err) {
    console.error('API claim-txhash error:', err);
    return res.status(500).json({ claimed: false, error: 'Internal Server Error checking TxHash.' });
  }
}
