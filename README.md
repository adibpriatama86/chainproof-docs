# ChainProof 🛡️

Blockchain-based **document integrity verification**. Upload a file → the browser computes its SHA-256 hash → that fingerprint is stored on-chain. Later, anyone can re-upload the file (or paste a hash) and the smart contract proves whether the document matches the original, bit-for-bit.

Built as a beginner-friendly Web3 demo for a Data Security & Blockchain class.

---

## ✨ Features

- 🔐 **Browser-only SHA-256 hashing** via the Web Crypto API — your file never leaves your computer.
- 🦊 **MetaMask wallet** connection with network detection + warnings.
- 📝 **Register** a document hash on-chain with a name and description.
- ✅ **Verify** any file (or pasted hash) against the blockchain record.
- 🕘 **Recent registrations** list pulled live from the contract.
- 🎓 Educational explanations of hashing & blockchain immutability.

## 🧰 Tech Stack

| Layer        | Tech                                    |
| ------------ | --------------------------------------- |
| Frontend     | React + Vite + Tailwind CSS             |
| Web3 client  | ethers.js v6                            |
| Hashing      | Web Crypto API (SHA-256)                |
| Smart contract | Solidity ^0.8.24                      |
| Local chain  | Hardhat                                 |
| Wallet       | MetaMask                                |

## 📁 Folder structure

```
.
├── contracts/
│   └── DocumentRegistry.sol      # Solidity smart contract
├── scripts/
│   └── deploy.js                 # Hardhat deploy script
├── hardhat.config.js             # Hardhat config (localhost + sepolia)
├── src/
│   ├── routes/index.tsx          # Main page
│   ├── components/chainproof/    # UI cards (Wallet, Register, Verify, …)
│   ├── hooks/use-wallet.ts       # MetaMask hook
│   └── lib/chainproof/           # ABI, contract helpers, hashing utils
├── .env.example
└── README.md
```

---

## 🚀 Installation

```bash
# 1. Install dependencies (frontend + Hardhat)
npm install
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

# 2. Copy environment variables
cp .env.example .env
```

## 🏗️ 1) Run a local blockchain

In one terminal:

```bash
npx hardhat node
```

This starts a local chain on `http://127.0.0.1:8545` (chain id **31337**) and prints 20 funded test accounts with their private keys.

## 📦 2) Deploy the contract locally

In a second terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

You'll see something like:

```
✅ DocumentRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Copy that address into `.env`:

```
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_CHAIN_ID=31337
```

## 💻 3) Start the frontend

```bash
npm run dev
```

Open the printed URL (usually `http://localhost:8080`).

## 🦊 4) Connect MetaMask to the local chain

In MetaMask → **Add network manually**:

- Network name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency symbol: `ETH`

Then **import** one of the test accounts printed by `npx hardhat node` using its private key. You now have 10000 fake ETH to play with.

## 🔍 5) Verify a file

1. Click **Connect MetaMask**.
2. In **Register a document**: pick a file → wait for the SHA-256 → add a description → **Register on blockchain** → confirm in MetaMask.
3. In **Verify a document**: pick the same file → instant ✅ "Verified" card with name, owner, timestamp.
4. Modify even one byte of the file and re-verify → the hash changes and you get ⚠️ "Not found".

---

## 🌍 Optional: deploy to Sepolia testnet

1. Get a Sepolia RPC URL (Alchemy / Infura) and a funded test wallet private key.
2. Fill `.env`:

   ```
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/XXX
   PRIVATE_KEY=0xyourPrivateKey
   ```

3. Deploy:

   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. Update `.env`:

   ```
   VITE_CONTRACT_ADDRESS=<the deployed sepolia address>
   VITE_CHAIN_ID=11155111
   ```

5. Switch MetaMask to **Sepolia**, restart the frontend.

---

## 🐛 Common errors & fixes

| Error                                        | Fix                                                                         |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| _MetaMask is not installed_                  | Install the browser extension and refresh.                                  |
| _You are on Chain #5 …_                      | Switch MetaMask to the network matching `VITE_CHAIN_ID`.                    |
| _Contract address not configured_            | Paste the deployed address into `.env` and restart `npm run dev`.           |
| _Document already registered_                | Each file hash can only be registered once — by design (immutability).      |
| _Transaction rejected in MetaMask_           | You hit "Reject" in the popup. Try again and click Confirm.                 |
| _Nonce too high_ after restarting `hardhat node` | In MetaMask: Settings → Advanced → **Clear activity tab data**.         |

---

## 🧠 How the blockchain part works (in 30 seconds)

1. The browser reads your file as bytes and runs `crypto.subtle.digest("SHA-256", …)`. Result: a 32-byte fingerprint like `0x9f86d0…`.
2. We send that fingerprint, the file name, and a description to the `registerDocument` function on the `DocumentRegistry` smart contract via MetaMask.
3. MetaMask asks you to sign the transaction. Once mined, the (hash, name, description, timestamp, your address) are stored in contract storage **forever** and an event is emitted.
4. To verify, anyone hashes the file the same way and calls `verifyDocument(hash)`. If the contract returns `exists = true`, the document is provably the same as the day it was registered.

We never store the file itself — only its hash. That keeps things private, cheap, and tamper-evident.

---

## 🎤 Demo scenario for the lecturer

1. Open ChainProof, connect MetaMask (local Hardhat).
2. Upload `assignment.pdf`. Show the auto-computed SHA-256.
3. Click **Register on blockchain** → MetaMask popup → confirm. Show the success state and the new entry in **Recent registrations**.
4. In the **Verify** card, upload the **same** `assignment.pdf` → green "Verified" card with original name, your address, timestamp.
5. Open the PDF, change one character, save. Re-upload it to **Verify** → amber "Not found on blockchain". Explain: even one byte changed → completely different hash → no match → integrity broken.
6. Bonus: copy the on-chain hash, paste it into the **Paste hash** tab to show direct lookup also works.

---

## 🔮 Future improvements

- Sign the hash with the user's wallet for non-repudiation (EIP-712).
- Allow updating descriptions via a versioned record.
- Pin the file itself to IPFS and store the CID alongside the hash.
- Pagination for very large `allHashes` arrays.
- A subgraph (The Graph) for fast historical queries.
