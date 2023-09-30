require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  allowUnlimitedContractSize: true,
  networks: {
    ganache: {
      url: 'http://127.0.0.1:8545',
      gasPrice: "auto",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
      accountsBalance: "10000000000000000000000",
    },
  },
};
