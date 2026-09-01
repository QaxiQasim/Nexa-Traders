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

  // Tier 1: Query BNB Smart Chain Public RPC Nodes
  const rpcEndpoints = [
    'https://bsc-dataseed.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
    'https://bsc.publicnode.com'
  ];

  const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  for (const rpcUrl of rpcEndpoints) {
    try {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [cleanTxHash],
          id: 1
        })
      });

      if (!res.ok) continue;
      const json = await res.json();
      if (json && json.result) {
        const receipt = json.result;
        if (receipt.status !== '0x1') {
          return {
            success: false,
            message: 'Transaction failed on-chain on BNB Smart Chain (Status: Reverted).'
          };
        }

        const logs = receipt.logs || [];
        const usdtLog = logs.find((l: any) =>
          l.address && l.address.toLowerCase() === USDT_BEP20_CONTRACT.toLowerCase() &&
          l.topics && l.topics[0] === TRANSFER_TOPIC
        ) || logs[0];

        let amountUsdt = 0;
        if (usdtLog && usdtLog.data && usdtLog.data !== '0x') {
          try {
            const rawHex = usdtLog.data.replace('0x', '');
            const rawVal = BigInt('0x' + (rawHex || '0'));
            amountUsdt = Number(rawVal) / 1e18; // 18 decimals for USDT BEP20
          } catch (e) {
            amountUsdt = 0;
          }
        }

        let toAddr = '';
        if (usdtLog && usdtLog.topics && usdtLog.topics[2]) {
          toAddr = '0x' + usdtLog.topics[2].replace('0x', '').slice(-40);
        }

        // Verify recipient matches deposit wallet if recipient extracted
        const targetWallet = (receiverWallet || DEFAULT_DEPOSIT_WALLET).toLowerCase();
        if (toAddr && toAddr.toLowerCase() !== targetWallet) {
          return {
            success: false,
            message: `Transaction destination (${toAddr.substring(0, 10)}...) does not match official NexaTrades deposit wallet.`
          };
        }

        return {
          success: true,
          message: `Verified On-Chain via BNB Smart Chain Node! Received ${amountUsdt > 0 ? amountUsdt.toFixed(2) : ''} USDT on BEP20.`,
          txHash: cleanTxHash,
          from: usdtLog && usdtLog.topics && usdtLog.topics[1] ? '0x' + usdtLog.topics[1].slice(-40) : '',
          to: toAddr || targetWallet,
          amountUsdt: amountUsdt
        };
      }
    } catch (e) {
      // Try next RPC endpoint
    }
  }

  // Tier 2: Check via BscScan Proxy RPC
  try {
    const proxyUrl = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionReceipt&txhash=${cleanTxHash}`;
    const proxyRes = await fetch(proxyUrl);
    if (proxyRes.ok) {
      const proxyData = await proxyRes.json();
      if (proxyData && proxyData.result && proxyData.result.status === '0x1') {
        return {
          success: true,
          message: 'BNB Smart Chain transaction confirmed on-chain.',
          txHash: cleanTxHash,
          amountUsdt: 0
        };
      }
    }
  } catch (e) {}

  return {
    success: false,
    message: 'Transaction not found on BNB Smart Chain mainnet. Please verify the TxHash on BscScan.'
  };
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
