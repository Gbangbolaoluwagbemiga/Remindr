const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying Remindr contract with account:", deployer.address);
  console.log(
    "Account balance:",
    (await hre.ethers.provider.getBalance(deployer.address)).toString()
  );

  const Remindr = await hre.ethers.getContractFactory("Remindr");
  const remindr = await Remindr.deploy();

  await remindr.waitForDeployment();

  const address = await remindr.getAddress();
  console.log("Remindr deployed to:", address);
  console.log("Network:", hre.network.name);

  // Wait for a few block confirmations before verifying
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await remindr.deploymentTransaction().wait(5);

    console.log("\nTo verify the contract, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
