require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/**
 * Hardhat configuration for ChainProof.
 *
 * Default network: hardhat (in-memory, throwaway).
 * Local node:      `npx hardhat node` then deploy with --network localhost
 * Sepolia:         set SEPOLIA_RPC_URL and PRIVATE_KEY in .env
 */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
