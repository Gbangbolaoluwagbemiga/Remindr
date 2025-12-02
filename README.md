# Remindr 🔔

> **On-chain reminder system for wallet users** - Never miss a governance vote, token unlock, or important date again.

Remindr is a decentralized reminder application that stores your reminders on-chain (Base blockchain) and notifies you when it's time. Built with React, Next.js, and Solidity for the Web3 ecosystem.

![Remindr](https://img.shields.io/badge/Status-Live-brightgreen)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0.6-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

### Smart Contract

- ✅ **On-chain Storage** - Reminders stored permanently on Base blockchain
- ✅ **Gas Optimized** - Efficient smart contract design
- ✅ **Full CRUD Operations** - Create, read, update, delete, and complete reminders
- ✅ **Multi-chain Support** - Deployable on Base and Celo networks
- ✅ **Event Logging** - Comprehensive events for all operations

### Frontend Application

- 🎨 **Beautiful UI** - Modern, responsive design with glassmorphism effects
- 🌓 **Theme Toggle** - Seamless light/dark mode switching
- 🔔 **Smart Notifications** - Browser notifications + in-app toast alerts
- 💼 **Wallet Integration** - Reown (WalletConnect) AppKit for easy wallet connection
- ⚡ **Real-time Updates** - Automatic reminder sync with blockchain
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🎭 **Animated UI** - Smooth animations powered by Framer Motion
- 🎯 **Visual Highlights** - Auto-scroll and highlight reminders when due

---

## 🚀 Live Demo

- **Frontend**: Coming soon
- **Contract (Base Mainnet)**: [`0xfe4a4d81E4f0F17CA959b07D39Ab18493efc4B0C`](https://basescan.org/address/0xfe4a4d81E4f0F17CA959b07D39Ab18493efc4B0C)
- **Contract (Base Sepolia)**: [`0x8Eec6d38AB8fd67A13787C7dF79B953d4FD1810C`](https://sepolia.basescan.org/address/0x8Eec6d38AB8fd67A13787C7dF79B953d4FD1810C)

---

## 🛠️ Tech Stack

### Smart Contract

- **Solidity** ^0.8.20
- **Hardhat** - Development environment
- **Ethers.js** - Blockchain interactions

### Frontend

- **Next.js 16** - React framework with Webpack
- **TypeScript** - Type-safe development
- **Wagmi** + **Viem** - Ethereum interaction library
- **Reown AppKit** - Wallet connection (WalletConnect)
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Smooth animations
- **Sonner** - Toast notifications
- **next-themes** - Theme management
- **date-fns** - Date formatting

---

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- A wallet with Base Sepolia testnet ETH (for testing)
- BaseScan API key (optional, for verification)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Base
```

### 2. Install Contract Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Private key for deployment (never commit this!)
PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Optional: For contract verification
BASE_ETHERSCAN_API_KEY=your_basescan_api_key

# Optional: For frontend (Reown/WalletConnect)
NEXT_PUBLIC_REOWN_ID=your_reown_project_id
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## 🏗️ Development

### Compile Smart Contract

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the app.

---

## 🚀 Deployment

### Deploy Smart Contract

#### Base Sepolia (Testnet)

```bash
npm run deploy:base:testnet
```

#### Base Mainnet

```bash
npm run deploy:base:mainnet
```

#### Celo Alfajores (Testnet)

```bash
npm run deploy:celo:testnet
```

#### Celo Mainnet

```bash
npm run deploy:celo:mainnet
```

### Verify Contract

After deployment, verify on BaseScan:

```bash
# Base Sepolia
npm run verify:base:testnet

# Base Mainnet
npm run verify:base:mainnet
```

Or manually:

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

**Note**: The Remindr contract has no constructor parameters, so verification is straightforward.

### Deploy Frontend

Build the production version:

```bash
cd frontend
npm run build
```

Then deploy to Vercel, Netlify, or your preferred hosting:

```bash
npm start
```

---

## 📋 Smart Contract API

### Write Functions

#### `createReminder(title, description, timestamp)`

Create a new reminder on-chain.

- `title` (string): Reminder title
- `description` (string): Optional description
- `timestamp` (uint256): Unix timestamp when reminder should trigger

**Events**: `ReminderCreated`

#### `updateReminder(id, title, description, timestamp)`

Update an existing reminder (only owner can update).

**Events**: `ReminderUpdated`

#### `completeReminder(id)`

Mark a reminder as completed.

**Events**: `ReminderCompleted`

#### `deleteReminder(id)`

Delete a reminder (only owner can delete).

**Events**: `ReminderDeleted`

### Read Functions

#### `getReminder(id)`

Get a specific reminder by ID.

**Returns**: `Reminder` struct

#### `getUserReminders(user)`

Get all reminders for a specific user address.

**Returns**: Array of `Reminder` structs

#### `getPendingReminders(user)`

Get reminders that haven't been completed and aren't due yet.

**Returns**: Array of `Reminder` structs

#### `getUserReminderIds(user)`

Get all reminder IDs for a user.

**Returns**: Array of `uint256`

#### `getTotalReminders()`

Get total count of all reminders created.

**Returns**: `uint256`

### Events

- `ReminderCreated(uint256 indexed id, address indexed owner, string title, uint256 timestamp)`
- `ReminderUpdated(uint256 indexed id, address indexed owner, string title, uint256 timestamp)`
- `ReminderDeleted(uint256 indexed id, address indexed owner)`
- `ReminderCompleted(uint256 indexed id, address indexed owner)`

---

## 🔔 Notification System

Remindr uses a **hybrid notification system** that combines on-chain storage with client-side notifications.

### How It Works

1. **Create Reminder** → Stored on-chain (Base blockchain)

   - Your reminder is permanently stored as a smart contract transaction
   - Includes: title, description, and Unix timestamp

2. **Polling System** → Frontend checks every 30 seconds

   - The app continuously monitors your reminders
   - Checks if any reminder timestamp has passed
   - Works even when the tab is in the background

3. **When Time Comes** → Multiple notification methods:

   **Browser Notification** (if enabled):

   - Shows a native browser notification
   - Works even when the tab is closed (browser-dependent)
   - Includes reminder title and description
   - Auto-closes after 10 seconds

   **Toast Notification** (always active):

   - Appears in the app as a toast message
   - Shows reminder details
   - Has a "View" button to scroll to the reminder card

   **Visual Highlighting**:

   - The reminder card gets a yellow ring highlight
   - Automatically scrolls into view when clicking "View"

### Enabling Notifications

1. Connect your wallet
2. Click "Enable Notifications" when prompted
3. Allow browser notifications when asked
4. You're all set! 🔔

### Limitations

- **Client-side only**: Notifications only work when the browser/app is open
- **Browser dependent**: Native notifications require user permission
- **Polling interval**: Checks every 30 seconds (trade-off for performance)

### Future Enhancements

- Server-side notification service
- Email/SMS notifications
- Push notifications via service workers
- Real-time WebSocket updates

---

## 🎨 Frontend Features

### Wallet Connection

- **Reown AppKit** integration
- Support for multiple wallets (MetaMask, Coinbase Wallet, WalletConnect, etc.)
- Easy connection/disconnection
- Network switching

### Theme System

- **Light/Dark Mode** toggle
- Smooth theme transitions
- Beautiful gradients for both themes
- Glassmorphism effects

### User Interface

- **Animated backgrounds** with floating blobs
- **Smooth transitions** and hover effects
- **Responsive cards** for reminders
- **Color-coded status** (pending, overdue, completed)
- **Time display** with relative formatting ("in 2 hours", "3 days ago")

### Reminder Management

- **Create** new reminders with date/time picker
- **Edit** existing reminders
- **Complete** reminders with one click
- **Delete** reminders
- **Filter** by status (pending, overdue, completed)
- **Auto-refresh** after transactions

---

## 🌐 Network Information

| Network        | Chain ID | Explorer                                            | RPC URL                                  |
| -------------- | -------- | --------------------------------------------------- | ---------------------------------------- |
| Base Mainnet   | 8453     | [BaseScan](https://basescan.org)                    | https://mainnet.base.org                 |
| Base Sepolia   | 84532    | [BaseScan Sepolia](https://sepolia.basescan.org)    | https://sepolia.base.org                 |
| Celo Mainnet   | 42220    | [CeloScan](https://celoscan.io)                     | https://forno.celo.org                   |
| Celo Alfajores | 44787    | [CeloScan Alfajores](https://alfajores.celoscan.io) | https://alfajores-forno.celo-testnet.org |

---

## 📁 Project Structure

```
Base/
├── contracts/
│   └── Remindr.sol          # Main smart contract
├── scripts/
│   ├── deploy.js            # Deployment script
│   ├── verify.js            # Verification script (testnet)
│   └── verify-mainnet.js    # Verification script (mainnet)
├── frontend/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Main application page
│   │   └── globals.css      # Global styles & gradients
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── hooks/
│   │   └── useReminderNotifications.tsx  # Notification hook
│   ├── lib/
│   │   ├── contract.ts      # Contract ABI & address
│   │   └── wagmi.tsx        # Wagmi/Reown configuration
│   └── package.json
├── hardhat.config.js        # Hardhat configuration
├── package.json
└── README.md
```

---

## 🔐 Security Considerations

- ⚠️ **Never commit** your `.env` file or private keys
- ✅ Smart contract uses `require()` statements for access control
- ✅ Only reminder owners can update/delete their reminders
- ✅ Timestamp validation prevents past-dated reminders
- ✅ All functions emit events for transparency

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Base** - For the amazing L2 network
- **Reown** (WalletConnect) - For seamless wallet integration
- **shadcn/ui** - For beautiful UI components
- **Framer Motion** - For smooth animations

---

## 💡 Ideas for Future Enhancements

- 🔔 Server-side notification service
- 📧 Email notifications
- 📱 Mobile app (React Native)
- 🔄 Recurring reminders
- 👥 Shared reminders with other wallets
- 🏷️ Tags/categories for reminders
- 📊 Analytics dashboard
- 🔐 Multi-sig wallet support
- 🌍 Multi-language support
- ⚡ Gasless transactions (meta-transactions)

---

**Built with ❤️ for the Web3 ecosystem**

_Never miss an important date again. Stay organized, stay on-chain._ 🔔
