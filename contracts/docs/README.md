# Samurai Staking Platform

## Table of Contents

- [Samurai Staking Platform](#samurai-staking-platform)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Core Contracts](#core-contracts)
  - [Data Structures](#data-structures)
  - [Core Functions](#core-functions)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Development Tools](#development-tools)
  - [Testing](#testing)
  - [Deployment](#deployment)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction

The Staking Platform is a decentralized application built on Ethereum, designed for secure and efficient token staking and reward distribution. It leverages modular smart contracts for various functionalities like fee management, reward calculation, and escrow services.

## Features

- **Modular Architecture**: Separation of concerns through multiple contracts.
- **Dynamic Fee Structure**: Fee calculations are managed by a separate contract.
- **Role-Based Access Control**: Admin roles for contract management.
- **Batch Operations**: Allows users to claim multiple stakes and rewards in a single transaction.
- **Escrow Services**: Secure handling of user deposits and withdrawals.
- **Event Logging**: Detailed event logs for important contract interactions.

## Core Contracts

1. **TokenStakingPlatform**: Main contract for staking and reward distribution.
2. **FeeManagement**: Manages dynamic fee calculations.
3. **StakingRewardManager**: Handles reward distribution logic.
4. **AdminContract**: Manages roles and permissions.
5. **EscrowHandler**: Securely handles user deposits and withdrawals.

## Data Structures

- `StakeInfo`: Holds individual stake data, including user, amount, pool type, and more.
- `PoolType`: Enum for different types of staking pools.

## Core Functions

- `initiateStake()`: Initiates a new stake.
- `claimStakeAndReward()`: Allows users to claim their stake and rewards.
- `batchClaimStakesAndRewards()`: Allows batch claiming of stakes and rewards.
- `getStakeData()`: Fetches stake data based on stake ID.
- `getUserStakeIds()`: Fetches all stake IDs for a user.

## Getting Started

### Prerequisites

- Node.js
- npm
- Hardhat
- Solidity

### Installation

1. Clone the repository
   ```
   git clone https://github.com/******/StakingPlatform.git
   ```
   
2. Navigate to the project directory
   ```
   cd StakingPlatform
   ```
   
3. Install dependencies
   ```
   npm install
   ```

4. Compile the contracts
   ```
   npx hardhat compile
   ```

## Development Tools

- **Solidity**: Smart Contracts
- **Hardhat**: Development Environment
- **OpenZeppelin**: Reusable Smart Contract Libraries

## Testing

Run the test suite using Hardhat:

```
npx hardhat test
```

## Deployment

For deploying to a testnet or mainnet, update the `hardhat.config.js` with appropriate network settings and then run:

```
npx hardhat run --network <network_name> scripts/deploy.js
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on contributions.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
