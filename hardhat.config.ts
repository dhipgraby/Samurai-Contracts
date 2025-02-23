import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import 'solidity-coverage';
import 'hardhat-docgen';
require('dotenv').config();

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
    gasPrice: 1,
    enabled: true,
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      gas: "auto",
      gasPrice: "auto",
      accounts: [`${process.env.TEST_ACCOUNT_PRIVATE_KEY}`]
    },
    hardhat: {
      gas: "auto",
      gasPrice: "auto",
      accounts: {
        mnemonic: `${process.env.MNEMONIC}`,
        accountsBalance: "10000000000000000000000"
      },
    },
    sepolia: {
      url: `${process.env.ALCHEMY_APIKEY_SEPOLIA}`,
      chainId: 11155111,
      accounts: [`${process.env.TEST_ACCOUNT_PRIVATE_KEY}`]
    },
    base: {
      url: `${process.env.ALCHEMY_BASE_API_KEY}`,
      chainId: 8453,
      accounts: [`${process.env.MAIN_ACCOUNT_PRIVATE_KEY}`]
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  etherscan: {
    apiKey: {
      base: `${process.env.BASE_SCAN_API}`,
    }
  }
};


export default config;

