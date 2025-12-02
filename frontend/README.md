# Remindr Frontend

Next.js frontend for the Remindr on-chain reminder system, integrated with Reown (WalletConnect) for wallet connections.

## Features

- ✅ Wallet connection via Reown/WalletConnect
- ✅ Create on-chain reminders
- ✅ View all your reminders
- ✅ Edit reminders
- ✅ Mark reminders as completed
- ✅ Delete reminders
- ✅ Beautiful, modern UI with Tailwind CSS
- ✅ Real-time transaction status

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment variables**:
   The `.env.local` file is already configured with the Reown project ID.

3. **Run development server**:

   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Contract Details

- **Contract Address**: `0xfe4a4d81E4f0F17CA959b07D39Ab18493efc4B0C`
- **Network**: Base Mainnet (Chain ID: 8453)
- **Explorer**: https://basescan.org/address/0xfe4a4d81E4f0F17CA959b07D39Ab18493efc4B0C

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Reown AppKit** - Wallet connection
- **Wagmi** - Ethereum React hooks
- **Viem** - Ethereum library
- **date-fns** - Date formatting

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Main page with reminder UI
├── lib/
│   ├── contract.ts     # Contract ABI and configuration
│   └── wagmi.ts        # Wagmi and Reown setup
└── .env.local          # Environment variables
```

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button and select your preferred wallet
2. **Create Reminder**: Fill in the form with title, description, and date/time
3. **Manage Reminders**: View, edit, complete, or delete your reminders
4. **Track Status**: See which reminders are pending, overdue, or completed

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
