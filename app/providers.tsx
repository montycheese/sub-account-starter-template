'use client';

import { CoinbaseWalletProvider } from './context/CoinbaseWalletContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CoinbaseWalletProvider>{children}</CoinbaseWalletProvider>;
}