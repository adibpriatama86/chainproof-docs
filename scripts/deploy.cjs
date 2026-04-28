// Hardhat deployment script for the DocumentRegistry contract.
// Run locally with:  npx hardhat run scripts/deploy.js --network localhost
// Run on Sepolia:    npx hardhat run scripts/deploy.js --network sepolia

const hre = require("hardhat");

async function main() {
  console.log("Deploying DocumentRegistry...");

  const Factory = await hre.ethers.getContractFactory("DocumentRegistry");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ DocumentRegistry deployed to:", address);
  console.log("\nNext steps:");
  console.log("  1. Copy this address.");
  console.log("  2. Paste it into your frontend .env as VITE_CONTRACT_ADDRESS=<address>");
  console.log("  3. Restart the frontend dev server.\n");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
