const hre = require("hardhat");

async function main() {
  const contractAddress = "0xfe4a4d81E4f0F17CA959b07D39Ab18493efc4B0C";

  console.log("Verifying Remindr contract on Base Mainnet...");
  console.log("Contract Address:", contractAddress);
  console.log(
    "Explorer:",
    `https://basescan.org/address/${contractAddress}#code`
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
      console.log(`   https://basescan.org/address/${contractAddress}#code`);
      console.log("\nSee MANUAL_VERIFY_MAINNET.md for detailed instructions.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
