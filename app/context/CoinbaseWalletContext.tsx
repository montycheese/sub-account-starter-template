'use client';

import { createCoinbaseWalletSDK, getCryptoKeyAccount, ProviderInterface } from '@coinbase/wallet-sdk';
import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { Address, createPublicClient, createWalletClient, custom, http, parseEther, toHex, WalletClient } from 'viem';
import { eip5792Actions } from 'viem/experimental';
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
  spendPermission: SpendPermission | null;
  spendPermissionSignature: `0x${string}` | null;
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
  spendPermission: null,
  spendPermissionSignature: null,
});

export type SpendPermission = {
    account: Address;
    spender: Address;
    token: Address;
    allowance: string;
    period: number;
    start: number;
    end: number;
    salt: bigint;
    extraData: string;
};

export function CoinbaseWalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ProviderInterface | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [subAccount, setSubAccount] = useState<Address | null>(null);
  const [subAccountWalletClient, setSubAccountWalletClient] = useState<WalletClient | null>(null);
  const [spendPermission, setSpendPermission] = useState<SpendPermission | null>(null);
  const [spendPermissionSignature, setSpendPermissionSignature] = useState<`0x${string}` | null>(null);

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
      transport: custom(provider),
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
            addSubAccount: {
              account: {
                type: 'create',
                keys: [
                  {
                    type: 'webauthn-p256',
                    key: signer.account?.publicKey,
                  },
                ],
              },
            },
            spendPermissions: {
                token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                allowance: toHex(parseEther('0.001')),
                period: 86400,
                salt: '0x1',
                extraData: '0x',
            }
          },
        }],
    })as {
      accounts: {
        address: Address;
        capabilities: {
          addSubAccount: {
            address: Address;
          };
          spendPermissions: {
            permission: SpendPermission;
            signature: `0x${string}`;
          };
        };
      }[];
    };
  
    const { addSubAccount, spendPermissions } = walletConnectResponse.accounts[0].capabilities;
  
    const subAccount = addSubAccount.address;
    const { permission, signature } = spendPermissions;
    console.log('subAccount', subAccount);
    console.log('permission', permission);
    console.log('signature', signature);
    setSpendPermission(permission);
    setSpendPermissionSignature(signature);
    setSubAccount(subAccount);

    return subAccount;
  }, [provider, address, setSpendPermission, setSpendPermissionSignature]);

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

        const client = createWalletClient({
          account: {
            address: subAccount,
          },
          chain: baseSepolia,
          transport: custom(provider),
        }).extend(eip5792Actions());

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
        subAccountWalletClient,
        spendPermission,
        spendPermissionSignature,
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
