'use client';
import { useCallback, useState } from 'react';
import { useCoinbaseWallet } from './context/CoinbaseWalletContext';
import { baseSepolia } from 'viem/chains';
import { spendPermissionManagerAbi } from './abi';
import { fromHex, parseEther } from 'viem';

const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
if (!paymasterUrl) {
  throw new Error('NEXT_PUBLIC_PAYMASTER_URL is not set in .env. Follow the instructions in the README to set it up.');
}

export default function Home() {
  const { isConnected, connect, disconnect, address, subAccount, 
    spendPermission, spendPermissionSignature,
    createSubAccount, subAccountWalletClient, provider } = useCoinbaseWallet();

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
    if (!spendPermission || !spendPermissionSignature) {
      throw new Error('Spend permission data not found');
    }

    const ethToSendInWei: bigint = parseEther('0.0001');

    const currentBalance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    if (fromHex(currentBalance as `0x${string}`, 'bigint') < ethToSendInWei) {
      throw new Error(`Unable to send transaction due to insufficient balance in main account ${address}. Please fund it with at least 0.0001 ETH.`);
    }
    
    const txHash = await provider.request({
      method: 'wallet_sendCalls',
      params: [
        {
          chainId: baseSepolia.id,
          calls: [
            {
              to: '0xf85210B21cC50302F477BA56686d2019dC9b67Ad',
              abi: spendPermissionManagerAbi,
              functionName: 'approveWithSignature',
              args: [spendPermission, spendPermissionSignature],
              data: '0x',
          },
          {
              to: '0xf85210B21cC50302F477BA56686d2019dC9b67Ad',
              abi: spendPermissionManagerAbi,
              functionName: 'spend',
              args: [spendPermission, parseEther('0.0001').toString()],
              data: '0x',
          },
          {
            to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
            data: '0x',
            value: parseEther('0.0001').toString(),
          }],
          from: subAccount,
          version: '1',
          capabilities: {
            paymasterService: {
              url: paymasterUrl
            }
          }

        }
      ],
    });
    setTxHash(txHash as string);
    return txHash;
  }, [provider, subAccount, spendPermission, spendPermissionSignature, address]);

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
