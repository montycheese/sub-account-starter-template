# Coinbase Wallet SDK Sub Account Example

This is a simple example of how to use the Coinbase Wallet SDK and Coinbase Smart Wallet to create a Sub Account and use it to send a transaction. A more detailed guide of this code can be found in the Coinbase Smart Wallet documentation on Sub Accounts [here](https://docs.base.org/identity/smart-wallet/guides/sub-accounts/overview).

## Getting Started

First, create a `.env` file at the project root and set the `NEXT_PUBLIC_PAYMASTER_URL` environment variable. Sign up or log into Coinbase Developer Platform [here](https://www.coinbase.com/developer-platform/products/paymaster) to create a paymaster and get the URL. Look at the .env.template file for the format.

```bash
NEXT_PUBLIC_PAYMASTER_URL=
```

Then, install the dependencies:

```bash
npm install
```


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
