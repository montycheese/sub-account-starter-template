'use client';

import { createCoinbaseWalletSDK, getCryptoKeyAccount, ProviderInterface } from '@coinbase/wallet-sdk';
import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { Address, createPublicClient, createWalletClient, custom, http, WalletClient } from 'viem';
import { toCoinbaseSmartAccount, WebAuthnAccount } from 'viem/account-abstraction';
import { baseSepolia } from 'viem/chains';
interface CoinbaseWalletContextType {
  provider: ProviderInterface | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  address: Address | null;
  subAccount: Address | null;
  createSubAccount: () => Promise<Address | null>;
  subAccountWalletClient: WalletClient | null;
}

const CoinbaseWalletContext = createContext<CoinbaseWalletContextType>({
  provider: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  address: null,
  subAccount: null,
  createSubAccount: async () => null,
  subAccountWalletClient: null,
});

export function CoinbaseWalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ProviderInterface | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [subAccount, setSubAccount] = useState<Address | null>(null);
  const [subAccountWalletClient, setSubAccountWalletClient] = useState<WalletClient | null>(null);

  useEffect(() => {
    // Initialize Coinbase Wallet SDK
    const coinbaseWalletSDK = createCoinbaseWalletSDK({
        appName: 'Coinbase Wallet demo',
        appChainIds: [baseSepolia.id],
        preference: {
          options: "smartWalletOnly",
          keysUrl: 'https://keys-dev.coinbase.com/connect',
        },
        subaccount: {
            getSigner: getCryptoKeyAccount,
        }
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
  
  const createSubAccount = useCallback(async () => {
    if (!provider || !address) {
        throw new Error('Address or provider not found');
    };
    const signer = await getCryptoKeyAccount();
    const walletConnectResponse = await provider.request({
        method: 'wallet_connect',
        params: [{
          version: '1',
          capabilities: {
            addAddress: {
              chainId: baseSepolia.id,
              createAccount: {
                signer: signer.account?.publicKey,
              },
              address
            },
          },
        }],
    });

    const subAccount = walletConnectResponse?.accounts[0].capabilities?.addAddress?.address;
    setSubAccount(subAccount);
    return subAccount;
  }, [provider, address]);

  const publicClient = useMemo(() => {
    if (!provider) return null;
    return createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });
  }, [provider]);


  useEffect(() => {
    async function initializeSubAccountClient() {
      if (!subAccount || !provider || !publicClient) {
        setSubAccountWalletClient(null);
        return;
      }

      try {
        const signer = await getCryptoKeyAccount();
        if (!signer) {
          throw new Error('Signer not found');
        }
        const account = await toCoinbaseSmartAccount({
          client: publicClient,
          owners: [signer.account as WebAuthnAccount],
          address: subAccount,
        });

        const client = createWalletClient({
          account,
          chain: baseSepolia,
          transport: custom({
            async request({ method, params }) {
              const response = await provider.request({ method, params });
              return response;
            }
          }),
        });

        setSubAccountWalletClient(client);
      } catch (error) {
        console.error('Failed to initialize subAccount wallet client:', error);
        setSubAccountWalletClient(null);
      }
    }

    initializeSubAccountClient();
  }, [subAccount, provider, publicClient]);
  

  return (
    <CoinbaseWalletContext.Provider
      value={{
        provider,
        connect,
        disconnect,
        isConnected,
        address,
        subAccount,
        createSubAccount,
        subAccountWalletClient
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
