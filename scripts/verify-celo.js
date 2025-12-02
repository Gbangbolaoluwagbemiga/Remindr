const hre = require("hardhat");

async function main() {
  // Try to get address from command line args or environment variable
  const contractAddress = process.argv[2] || process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("❌ Please provide a contract address");
    console.log(
      "Usage: CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify-celo.js --network celoAlfajores"
    );
    console.log(
      "   OR: npx hardhat verify --network celoAlfajores <CONTRACT_ADDRESS>"
    );
    process.exit(1);
  }

  console.log("Verifying Remindr contract on Celo Alfajores...");
  console.log("Contract Address:", contractAddress);
  console.log(
    "Explorer:",
    `https://alfajores.celoscan.io/address/${contractAddress}#code`
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
      console.log("\nMake sure you have:");
      console.log("1. CELO_ETHERSCAN_API_KEY set in your .env file");
      console.log("2. The API key is valid");
      console.log("3. Network connectivity is working");
      console.log("\nYou can also verify manually at:");
      console.log(
        `https://alfajores.celoscan.io/address/${contractAddress}#code`
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
