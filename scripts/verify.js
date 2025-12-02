const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8Eec6d38AB8fd67A13787C7dF79B953d4FD1810C";

  console.log("Verifying Remindr contract on Base Sepolia...");
  console.log("Contract Address:", contractAddress);

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
      console.log("\nTrying alternative verification method...");

      // Try with explicit network configuration
      try {
        await hre.run(
          "verify:verify",
          {
            address: contractAddress,
            constructorArguments: [],
          },
          {
            network: "baseSepolia",
          }
        );
        console.log("✅ Contract verified successfully!");
      } catch (err) {
        console.error("❌ Alternative verification also failed:", err.message);
        console.log("\nMake sure you have:");
        console.log("1. BASE_ETHERSCAN_API_KEY set in your .env file");
        console.log("2. The API key is valid");
        console.log("3. Network connectivity is working");
        console.log("\nYou can also verify manually at:");
        console.log(
          `https://sepolia.basescan.org/address/${contractAddress}#code`
        );
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
