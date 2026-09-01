// BSC (BNB Smart Chain) BEP20 USDT Automated Verification Utility
export const BSCSCAN_API_KEY = 'AJM3ZZKFJ5TE8AJZFU9HWE6DWD5UZMZQ9A';
export const USDT_BEP20_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
export const DEFAULT_DEPOSIT_WALLET = '0xa0a5794B0277904f941d436322AeA003cE70e7e2';

export interface Bep20TxVerification {
  success: boolean;
  message: string;
  txHash?: string;
  from?: string;
  to?: string;
  amountUsdt?: number;
  blockNumber?: string;
  timestamp?: string;
}

/**
 * Verifies a BEP20 USDT transaction live on BNB Smart Chain via BscScan API
 */
export async function verifyBep20Transaction(
  txHash: string,
  receiverWallet?: string
): Promise<Bep20TxVerification> {
  const cleanTxHash = txHash.trim();
  if (!cleanTxHash || !cleanTxHash.startsWith('0x') || cleanTxHash.length !== 66) {
    return {
      success: false,
      message: 'Invalid BEP20 TxHash format. Must start with 0x and be 66 characters long.'
    };
  }

  try {
    const url = `https://api.bscscan.com/api?module=account&action=tokentx&txhash=${cleanTxHash}&apikey=${BSCSCAN_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== '1' || !data.result || data.result.length === 0) {
      // Fallback check: Try normal txlist
      const txUrl = `https://api.bscscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${cleanTxHash}&apikey=${BSCSCAN_API_KEY}`;
      const txRes = await fetch(txUrl);
      const txData = await txRes.json();

      if (txData.status === '1' && txData.result && txData.result.status === '1') {
        return {
          success: true,
          message: 'BNB Smart Chain transaction confirmed on-chain.',
          txHash: cleanTxHash,
          amountUsdt: 0
        };
      }

      return {
        success: false,
        message: data.message === 'NOTOK' ? 'Transaction pending or not found on BscScan yet.' : (data.result || 'Transaction not found on BSC mainnet.')
      };
    }

    // Find USDT token transfer inside receipt logs
    const usdtTx = data.result.find((t: any) => 
      t.contractAddress.toLowerCase() === USDT_BEP20_CONTRACT.toLowerCase() ||
      t.tokenSymbol.toUpperCase() === 'USDT'
    ) || data.result[0];

    let amountUsdt = 0;
    try {
      const decimals = parseInt(usdtTx.tokenDecimal || '18', 10);
      const rawStr = (usdtTx.value || '0').replace(/[^0-9]/g, '');
      const rawValue = rawStr ? BigInt(rawStr) : 0n;
      amountUsdt = Number(rawValue) / Math.pow(10, decimals);
    } catch (e) {
      amountUsdt = 0;
    }

    return {
      success: true,
      message: `Verified! Received ${amountUsdt.toFixed(2)} USDT on BEP20 (BNB Smart Chain).`,
      txHash: cleanTxHash,
      from: usdtTx.from,
      to: usdtTx.to,
      amountUsdt,
      blockNumber: usdtTx.blockNumber,
      timestamp: usdtTx.timeStamp ? new Date(parseInt(usdtTx.timeStamp, 10) * 1000).toISOString() : new Date().toISOString()
    };
  } catch (err: any) {
    console.error('BscScan API verification error:', err);
    return {
      success: false,
      message: `Network error verifying BscScan: ${err.message || 'Please try again.'}`
    };
  }
}

/**
 * Checks recent incoming BEP20 USDT payments for a deposit wallet address
 */
export async function getIncomingBep20Deposits(walletAddress: string) {
  try {
    const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${walletAddress}&contractaddress=${USDT_BEP20_CONTRACT}&page=1&offset=20&sort=desc&apikey=${BSCSCAN_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === '1' && Array.isArray(data.result)) {
      return data.result.map((tx: any) => {
        let amountUsdt = 0;
        try {
          const decimals = parseInt(tx.tokenDecimal || '18', 10);
          const rawStr = (tx.value || '0').replace(/[^0-9]/g, '');
          const rawValue = rawStr ? BigInt(rawStr) : 0n;
          amountUsdt = Number(rawValue) / Math.pow(10, decimals);
        } catch (e) {
          amountUsdt = 0;
        }
        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          amountUsdt,
          timestamp: tx.timeStamp ? new Date(parseInt(tx.timeStamp, 10) * 1000).toISOString() : new Date().toISOString(),
          confirmations: parseInt(tx.confirmations || '1', 10)
        };
      });
    }
    return [];
  } catch (err) {
    console.error('Error fetching incoming BEP20 deposits:', err);
    return [];
  }
}
