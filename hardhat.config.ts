import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import 'solidity-coverage';
import 'hardhat-docgen';


/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  },
  gasReporter: {
    coinmarketcap: '82c3ceca-d368-4e32-9296-e0ee96c95272',
    gasPriceApi: 'https://api.etherscan.io/api?module=proxy&action=eth_gasPrice',
    currency: 'EUR',
    gasPrice: 6,
    enabled: true,
  },
  networks: {
    hardhat: {
      
    },
  },
};

import { task } from "hardhat/config";
import { ethers } from "ethers";
import { parseEther } from "ethers";

task("stakeForUser", "Stakes a specified amount for a user")
  .addParam("user", "The user's address")
  .addParam("amount", "The amount to stake")
  .addParam("contract", "The staking contract address")
  .setAction(async (taskArgs, hre) => {
    const { user, amount, contract } = taskArgs;

    // Get the ContractFactory for the Staking contract
    const Staking = await hre.ethers.getContractFactory("OneDayStakingContract"); // Replace with your contract name

    // Attach to the deployed contract
    const stakingContract = Staking.attach(contract);

    // Create a signer
    const [deployer, user1, user2, user3] = await hre.ethers.getSigners();

    // Stake the amount for the user
    const tx = await stakingContract.connect(user1).stake(parseEther(amount));

    // Wait for the transaction to be mined
    await tx.wait();

    console.log(`Staked ${amount} tokens for ${user}`);
  });



export default config;

