const hre = require("hardhat");

async function main() {
  const [deployer, receiver] = await hre.ethers.getSigners();

  console.log("Royalty Receiver account:", receiver.address);
  
  const Samurai = await hre.ethers.getContractFactory("Samurai");
  const samurai = await Samurai.connect(deployer).deploy(receiver.address);  
  
  const Yen = await hre.ethers.getContractFactory("YenToken");
  const yentoken = await Yen.connect(deployer).deploy();

  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.connect(deployer).deploy(yentoken.target);
  
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Samurai deployed to:", samurai.target);
  console.log("YenToken deployed to:", yentoken.target);
  console.log("Faucet deployed to:", faucet.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
