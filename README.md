# Remindr 📅

On-chain reminder system for wallet users. Never miss a governance vote, token unlock, or important date again.

## Features

- ✅ Create reminders tied to your wallet address
- ✅ Update or delete reminders anytime
- ✅ Mark reminders as completed
- ✅ Query pending reminders (not yet due)
- ✅ Gas-optimized and efficient
- ✅ Deployable on Base and Celo networks

## Contract Functions

### Write Functions

- `createReminder(title, description, timestamp)` - Create a new reminder
- `updateReminder(id, title, description, timestamp)` - Update existing reminder
- `completeReminder(id)` - Mark reminder as completed
- `deleteReminder(id)` - Delete a reminder

### Read Functions

- `getReminder(id)` - Get a specific reminder by ID
- `getUserReminders(user)` - Get all reminders for a user
- `getPendingReminders(user)` - Get reminders that haven't been completed and aren't due yet
- `getUserReminderIds(user)` - Get all reminder IDs for a user
- `getTotalReminders()` - Get total count of reminders created

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Add your private key and RPC URLs to `.env`:

```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
```

## Compile

```bash
npm run compile
```

## Deploy

### Base Testnet (Base Sepolia)

```bash
npm run deploy:base:testnet
```

### Base Mainnet

```bash
npm run deploy:base:mainnet
```

### Celo Testnet (Alfajores)

```bash
npm run deploy:celo:testnet
```

### Celo Mainnet

```bash
npm run deploy:celo:mainnet
```

## Verify Contract

After deployment, verify on the block explorer:

```bash
# Base
npx hardhat verify --network base <CONTRACT_ADDRESS>

# Celo
npx hardhat verify --network celo <CONTRACT_ADDRESS>
```

## Network Information

- **Base Mainnet**: Chain ID 8453
- **Base Sepolia**: Chain ID 84532
- **Celo Mainnet**: Chain ID 42220
- **Celo Alfajores**: Chain ID 44787

## License

MIT
