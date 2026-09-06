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
 * Verifies a BEP20 USDT transaction strictly live on BNB Smart Chain.
 * Ensures destination address matches receiverWallet and contract is USDT_BEP20_CONTRACT.
 */
export async function verifyBep20Transaction(
  txHash: string,
  receiverWallet: string = DEFAULT_DEPOSIT_WALLET
): Promise<Bep20TxVerification> {
  const cleanTxHash = txHash.trim().toLowerCase();
  if (!cleanTxHash || !cleanTxHash.startsWith('0x') || cleanTxHash.length !== 66) {
    return {
      success: false,
      message: 'Invalid BEP20 TxHash format. Must start with 0x and be exactly 66 characters long.'
    };
  }

  const targetWallet = (receiverWallet || DEFAULT_DEPOSIT_WALLET).trim().toLowerCase();
  const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  // --------------------------------------------------------------------------
  // Step 1: Query BscScan API tokentx (Direct indexed token transfers)
  // --------------------------------------------------------------------------
  try {
    const bscUrl = `https://api.bscscan.com/api?module=account&action=tokentx&address=${targetWallet}&contractaddress=${USDT_BEP20_CONTRACT}&page=1&offset=100&sort=desc&apikey=${BSCSCAN_API_KEY}`;
    const bscRes = await fetch(bscUrl);
    if (bscRes.ok) {
      const bscData = await bscRes.json();
      if (bscData && bscData.status === '1' && Array.isArray(bscData.result)) {
        const match = bscData.result.find((tx: any) => tx.hash && tx.hash.toLowerCase() === cleanTxHash);
        if (match) {
          // Verify recipient
          if (match.to && match.to.toLowerCase() !== targetWallet) {
            return {
              success: false,
              message: `Transaction destination (${match.to.substring(0, 10)}...) does not match official deposit wallet.`
            };
          }
          // Verify token contract
          if (match.contractAddress && match.contractAddress.toLowerCase() !== USDT_BEP20_CONTRACT.toLowerCase()) {
            return {
              success: false,
              message: 'Transaction is not a USDT (BEP20) token transfer.'
            };
          }
          // Calculate amount
          let amountUsdt = 0;
          try {
            const decimals = parseInt(match.tokenDecimal || '18', 10);
            const rawStr = (match.value || '0').replace(/[^0-9]/g, '');
            const rawVal = rawStr ? BigInt(rawStr) : 0n;
            amountUsdt = Number(rawVal) / Math.pow(10, decimals);
          } catch (e) {
            amountUsdt = 0;
          }

          if (amountUsdt <= 0) {
            return {
              success: false,
              message: 'Verified transaction value is 0 USDT.'
            };
          }

          return {
            success: true,
            message: `Verified On-Chain via BscScan! Received $${amountUsdt.toFixed(2)} USDT on BEP20.`,
            txHash: cleanTxHash,
            from: match.from,
            to: match.to,
            amountUsdt: amountUsdt
          };
        }
      }
    }
  } catch (err) {
    console.warn('BscScan tokentx check failed, falling back to RPC receipt check:', err);
  }

  // --------------------------------------------------------------------------
  // Step 2: Query Public BNB Smart Chain RPC Nodes (eth_getTransactionReceipt)
  // --------------------------------------------------------------------------
  const rpcEndpoints = [
    'https://bsc-dataseed.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
    'https://bsc.publicnode.com'
  ];

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
        );

        if (!usdtLog) {
          return {
            success: false,
            message: 'No valid USDT (BEP20) transfer found in this transaction receipt.'
          };
        }

        let toAddr = '';
        if (usdtLog.topics && usdtLog.topics[2]) {
          toAddr = '0x' + usdtLog.topics[2].replace('0x', '').slice(-40);
        }

        if (!toAddr || toAddr.toLowerCase() !== targetWallet) {
          return {
            success: false,
            message: `Transaction destination (${toAddr ? toAddr.substring(0, 10) : 'unknown'}...) does not match official deposit wallet.`
          };
        }

        let amountUsdt = 0;
        if (usdtLog.data && usdtLog.data !== '0x') {
          try {
            const rawHex = usdtLog.data.replace('0x', '');
            const rawVal = BigInt('0x' + (rawHex || '0'));
            amountUsdt = Number(rawVal) / 1e18; // 18 decimals for USDT BEP20
          } catch (e) {
            amountUsdt = 0;
          }
        }

        if (amountUsdt <= 0) {
          return {
            success: false,
            message: 'On-chain verified transfer amount is 0 USDT.'
          };
        }

        return {
          success: true,
          message: `Verified On-Chain via BNB Smart Chain Node! Received $${amountUsdt.toFixed(2)} USDT on BEP20.`,
          txHash: cleanTxHash,
          from: usdtLog.topics && usdtLog.topics[1] ? '0x' + usdtLog.topics[1].slice(-40) : '',
          to: toAddr,
          amountUsdt: amountUsdt
        };
      }
    } catch (e) {
      // Try next RPC endpoint
    }
  }

  return {
    success: false,
    message: 'Transaction not found on BNB Smart Chain mainnet or payment not sent to official deposit wallet.'
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
