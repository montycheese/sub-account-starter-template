'use client';
import { useCallback, useState } from 'react';
import { useCoinbaseWallet } from './context/CoinbaseWalletContext';
import { baseSepolia } from 'viem/chains';

export default function Home() {
  const { isConnected, connect, disconnect, address, subAccount, createSubAccount, subAccountWalletClient, provider } = useCoinbaseWallet();

  const [signature, setSignature] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const signMessage = useCallback(async () => {
    if (!subAccountWalletClient || !subAccount) {
        throw new Error('Subaccount wallet client or subaccount not found');
    }

    const message = "Hello, world!";
    const signature = await subAccountWalletClient.signMessage({ message, account: subAccount });
    setSignature(signature);
    return signature;
  }, [subAccountWalletClient, subAccount]);


  const sendTransaction = useCallback(async () => {
    if (!provider) {
        throw new Error('Provider not found');
    }

    const txHash = await provider.request({
      method: 'wallet_sendCalls',
      params: [
        {
          chainId: baseSepolia.id,
          calls: [{
            to: subAccount,
            data: '0x',
            value: 0,
          }],
          from: subAccount,
          version: '1',
          capabilities: {
            paymasterService: {
              url: 'YOUR_PAYMASTER_URL'
            }
          }

        }
      ],
    });
    setTxHash(txHash as string);
    return txHash;
  }, [provider, subAccount]);

  if (!isConnected) {
    return (
      <div>
        <button onClick={connect}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p>Connected address: {address}</p>
      {!subAccount && <button onClick={createSubAccount}>Create Subaccount</button>}
      {subAccount && (
        <div>
          <p>Subaccount: {subAccount}</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => signMessage()}>Sign Message</button>
            {signature && <div style={{ overflowWrap: 'break-word' }}>Signature: {signature}</div>}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={sendTransaction}>Send Transaction</button>
            {txHash && (
              <div style={{ overflowWrap: 'break-word' }}>
                Transaction Hash:{' '}
                <a 
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`https://sepolia.basescan.org/tx/${txHash}`}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <button onClick={disconnect}>Disconnect Wallet</button>
    </div>
  );
}
