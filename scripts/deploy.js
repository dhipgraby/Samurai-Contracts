const hre = require("hardhat");

async function main() {
  const [deployer,receiver] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Deploying contracts with the account:", receiver.address);
//   console.log("Account balance:", (await deployer.getBalance()).toString());

  const Samurai = await hre.ethers.getContractFactory("Samurai");
  const samurai = await Samurai.deploy(receiver.address);  

  console.log("Samurai deployed to:", samurai.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
