'use client';

import { createCoinbaseWalletSDK, ProviderInterface } from '@coinbase/wallet-sdk';
import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { Address, createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
interface CoinbaseWalletContextType {
  provider: ProviderInterface | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  address: Address | null;
}

const CoinbaseWalletContext = createContext<CoinbaseWalletContextType>({
  provider: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  address: null,
});

export function CoinbaseWalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ProviderInterface | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);

  useEffect(() => {
    // Initialize Coinbase Wallet SDK
    const coinbaseWalletSDK = createCoinbaseWalletSDK({
        appName: 'Coinbase Wallet demo',
        appChainIds: [baseSepolia.id],
        preference: {
          options: "smartWalletOnly",
          keysUrl: 'https://keys-dev.coinbase.com/connect',
        },
    });

    setProvider(coinbaseWalletSDK.getProvider());
  }, []);

  const walletClient = useMemo(() => {
    if (!provider) return null;
    return createWalletClient({
      chain: baseSepolia,
      transport: custom({
        async request({ method, params }) {
          const response = await provider.request({ method, params });
          return response;
        }
      }),
    });
  }, [provider]);

  const connect = useCallback(async () => {
    if (!walletClient || !provider) return;
    walletClient
      .requestAddresses()
      .then(async (addresses) => {
          if (addresses.length > 0) {
            setAddress(addresses[0])
            setIsConnected(true);
          }
    });
  }, [walletClient, provider]);

  const disconnect = () => {
    if (!provider) return;
    
    try {
      provider.disconnect();
      setIsConnected(false);
      setAddress(null);
    } catch (error) {
      console.error('Failed to disconnect from Coinbase Wallet:', error);
    }
  };

  return (
    <CoinbaseWalletContext.Provider
      value={{
        provider,
        connect,
        disconnect,
        isConnected,
        address,
      }}
    >
      {children}
    </CoinbaseWalletContext.Provider>
  );
}

export function useCoinbaseWallet() {
  const context = useContext(CoinbaseWalletContext);
  if (context === undefined) {
    throw new Error('useCoinbaseWallet must be used within a CoinbaseWalletProvider');
  }
  return context;
}
