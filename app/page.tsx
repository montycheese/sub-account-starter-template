'use client';
import { useCoinbaseWallet } from './context/CoinbaseWalletContext';
export default function Home() {
  const { isConnected, connect, disconnect, address } = useCoinbaseWallet();
  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected address: {address}</p>
          <button onClick={disconnect}>Disconnect Wallet</button>
        </div>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
