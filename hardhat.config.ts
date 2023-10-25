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
    gasPrice: 15,
    enabled: true,
  },
  networks: {
    // for mainnet
    'base-mainnet': {
      url: 'https://mainnet.base.org',
      accounts: {
        mnemonic: `${process.env.WALLET_KEY}`,
      },
      gasPrice: 1000000000,
    },
    // for testnet
    'base-goerli': {
      url: 'https://goerli.base.org',
      accounts: {
        mnemonic: `${process.env.WALLET_KEY}`,
      },
      gasPrice: 1000000,
    },
    // for local dev environment
    'base-local': {
      url: 'http://localhost:8545',
      accounts: {
        mnemonic: `${process.env.WALLET_KEY}`,
      },
      gasPrice: 10,
    },
  },
  defaultNetwork: 'hardhat',
};


export default config;

