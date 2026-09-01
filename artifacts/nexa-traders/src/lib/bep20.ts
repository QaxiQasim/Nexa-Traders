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
  receiverWallet: string = DEFAULT_DEPOSIT_WALLET
): Promise<Bep20TxVerification> {
  const cleanTxHash = txHash.trim();
  if (!cleanTxHash || !cleanTxHash.startsWith('0x') || cleanTxHash.length !== 66) {
    return {
      success: false,
      message: 'Invalid BEP20 TxHash format. Must start with 0x and be exactly 66 characters long.'
    };
  }

  try {
    const url = `https://api.bscscan.com/api?module=account&action=tokentx&txhash=${cleanTxHash}&apikey=${BSCSCAN_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== '1' || !data.result || data.result.length === 0) {
      // Secondary check: query token transfers to receiver address
      const targetAddr = receiverWallet || DEFAULT_DEPOSIT_WALLET;
      const addrUrl = `https://api.bscscan.com/api?module=account&action=tokentx&address=${targetAddr}&contractaddress=${USDT_BEP20_CONTRACT}&page=1&offset=50&sort=desc&apikey=${BSCSCAN_API_KEY}`;
      const addrRes = await fetch(addrUrl);
      const addrData = await addrRes.json();

      if (addrData.status === '1' && Array.isArray(addrData.result)) {
        const found = addrData.result.find((t: any) => t.hash.toLowerCase() === cleanTxHash.toLowerCase());
        if (found) {
          const decimals = parseInt(found.tokenDecimal || '18', 10);
          const rawStr = (found.value || '0').replace(/[^0-9]/g, '');
          const rawValue = rawStr ? BigInt(rawStr) : 0n;
          const amount = Number(rawValue) / Math.pow(10, decimals);
          return {
            success: true,
            message: `On-chain BEP20 Transfer Verified! Received ${amount.toFixed(2)} USDT.`,
            txHash: cleanTxHash,
            from: found.from,
            to: found.to,
            amountUsdt: amount
          };
        }
      }

      return {
        success: false,
        message: 'Transaction not found on BNB Smart Chain mainnet. Please verify the TxHash on BscScan.'
      };
    }

    // Filter for USDT token transfer
    const usdtTx = data.result.find((t: any) => 
      t.contractAddress.toLowerCase() === USDT_BEP20_CONTRACT.toLowerCase() ||
      t.tokenSymbol.toUpperCase() === 'USDT'
    ) || data.result[0];

    const decimals = parseInt(usdtTx.tokenDecimal || '18', 10);
    const rawStr = (usdtTx.value || '0').replace(/[^0-9]/g, '');
    const rawValue = rawStr ? BigInt(rawStr) : 0n;
    const amountUsdt = Number(rawValue) / Math.pow(10, decimals);

    // Verify recipient wallet matches official deposit wallet (if provided)
    const targetWallet = (receiverWallet || DEFAULT_DEPOSIT_WALLET).toLowerCase();
    if (usdtTx.to && usdtTx.to.toLowerCase() !== targetWallet) {
      return {
        success: false,
        message: `Transaction destination (${usdtTx.to.substring(0, 10)}...) does not match official NexaTrades deposit wallet.`
      };
    }

    return {
      success: true,
      message: `Verified on-chain! Received ${amountUsdt.toFixed(2)} USDT via BEP20.`,
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
      message: `BscScan network error: ${err.message || 'Unable to connect to BNB Smart Chain RPC'}`
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
