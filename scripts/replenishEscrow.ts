const hre = require("hardhat");


const deployer = "0x21Cca084378f8a6F48117A85F25CCfCb040AEffe";
const address = "0xeD102bAB87Fc4E2D21b0Dc59979E4685330a756C"
const escrow = "0x26be59f4A7dB89f1f082bbF0EFe9De41B78cDa86"
const yenToken = ""
const faucet = ""

 async function setupEscrow() {



 }

// async function setupFaucetAndEscrow() {
//     const initialRewardBalance = hre.ethers.parseEther('1000000000');
//     const initialFaucetBalance = hre.ethers.parseEther('1000000000');
//     await escrow.connect(deployer).updateStakingPlatform(address);
//     await yentoken.connect(deployer).mint(deployer.address, (initialRewardBalance + initialFaucetBalance));

//     await yentoken.connect(deployer).increaseAllowance(faucet.target, initialFaucetBalance);
//     await faucet.connect(deployer).replenishFaucet(initialFaucetBalance);

//     await yentoken.connect(deployer).increaseAllowance(escrow.target, initialRewardBalance);
//     await escrow.connect(deployer).replenishRewards(initialRewardBalance, yentoken.target);
//     return true;
// }