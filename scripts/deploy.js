const hre = require("hardhat");

async function main() {
  const [deployer, receiver, feeTreasury] = await hre.ethers.getSigners();

  console.log("Royalty Receiver account:", receiver.address);
  
  const Samurai = await hre.ethers.getContractFactory("Samurai");
  const samurai = await Samurai.connect(deployer).deploy(receiver.address);  
  
  const Admin = await hre.ethers.getContractFactory("AdminContract");
  const adminContract = await Admin.connect(deployer).deploy();
 
  const Fee = await hre.ethers.getContractFactory("FeeManagement");
  const feeContract = await Fee.connect(deployer).deploy(adminContract.target);

  const Yen = await hre.ethers.getContractFactory("YenToken");
  const yentoken = await Yen.connect(deployer).deploy();

  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.connect(deployer).deploy(yentoken.target, feeContract.target, feeTreasury.address);
  
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Samurai deployed to:", samurai.target);
  console.log("YenToken deployed to:", yentoken.target);
  console.log("Faucet deployed to:", faucet.target);
  console.log("FeeTreasury address:", feeTreasury.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
