const hre = require("hardhat");

async function main() {
  // Try to get address from command line args or environment variable
  const contractAddress = process.argv[2] || process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("❌ Please provide a contract address");
    console.log(
      "Usage: CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify-celo-mainnet.js --network celo"
    );
    console.log("   OR: npx hardhat verify --network celo <CONTRACT_ADDRESS>");
    process.exit(1);
  }

  console.log("Verifying Remindr contract on Celo Mainnet...");
  console.log("Contract Address:", contractAddress);
  console.log(
    "Explorer:",
    `https://celoscan.io/address/${contractAddress}#code`
  );

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // Remindr has no constructor parameters
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      console.log(
        "\n⚠️  Automated verification is having API compatibility issues."
      );
      console.log("📝 Please verify manually at:");
      console.log(`   https://celoscan.io/address/${contractAddress}#code`);
      console.log("\nManual verification steps:");
      console.log("1. Go to the contract address on Celoscan");
      console.log("2. Click 'Contract' tab");
      console.log("3. Click 'Verify and Publish'");
      console.log(
        "4. Select 'Solidity (Single file)' or 'Solidity (Standard JSON Input)'"
      );
      console.log("5. Enter compiler version: 0.8.20");
      console.log("6. Enter optimization: Yes, 200 runs");
      console.log("7. Paste your contract code");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
