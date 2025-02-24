export const spendPermissionManagerAbi = [
    {
        type: 'function',
        name: 'approveWithSignature',
        inputs: [
          {
            name: 'spendPermission',
            type: 'tuple',
            internalType: 'struct SpendPermissionManager.SpendPermission',
            components: [
              { name: 'account', type: 'address', internalType: 'address' },
              { name: 'spender', type: 'address', internalType: 'address' },
              { name: 'token', type: 'address', internalType: 'address' },
              {
                name: 'allowance',
                type: 'uint160',
                internalType: 'uint160',
              },
              { name: 'period', type: 'uint48', internalType: 'uint48' },
              { name: 'start', type: 'uint48', internalType: 'uint48' },
              { name: 'end', type: 'uint48', internalType: 'uint48' },
              { name: 'salt', type: 'uint256', internalType: 'uint256' },
              { name: 'extraData', type: 'bytes', internalType: 'bytes' },
            ],
          },
          { name: 'signature', type: 'bytes', internalType: 'bytes' },
        ],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'nonpayable',
      },
      {
        type: 'function',
        name: 'spend',
        inputs: [
          {
            name: 'spendPermission',
            type: 'tuple',
            internalType: 'struct SpendPermissionManager.SpendPermission',
            components: [
              { name: 'account', type: 'address', internalType: 'address' },
              { name: 'spender', type: 'address', internalType: 'address' },
              { name: 'token', type: 'address', internalType: 'address' },
              {
                name: 'allowance',
                type: 'uint160',
                internalType: 'uint160',
              },
              { name: 'period', type: 'uint48', internalType: 'uint48' },
              { name: 'start', type: 'uint48', internalType: 'uint48' },
              { name: 'end', type: 'uint48', internalType: 'uint48' },
              { name: 'salt', type: 'uint256', internalType: 'uint256' },
              { name: 'extraData', type: 'bytes', internalType: 'bytes' },
            ],
          },
          { name: 'value', type: 'uint160', internalType: 'uint160' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
      },
]