'use client';
import { useCoinbaseWallet } from './context/CoinbaseWalletContext';
export default function Home() {
  const { isConnected, connect, disconnect, address, subAccount, createSubAccount } = useCoinbaseWallet();

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
      {subAccount && <p>Subaccount: {subAccount}</p>}
      <button onClick={disconnect}>Disconnect Wallet</button>
    </div>
  );
}
