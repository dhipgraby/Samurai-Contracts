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
    gasPrice: 10,
    enabled: true,
  },
  networks: {
    hardhat: {
      
    },
  },
};
export default config;