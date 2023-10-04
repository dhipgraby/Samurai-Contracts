# Staking Platform

## Table of Contents

- [Staking Platform](#staking-platform)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Modules](#modules)
    - [Core Contracts](#core-contracts)
    - [Additional Contracts](#additional-contracts)
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

The Staking Platform is a decentralized application that allows users to stake tokens and earn rewards. It is designed to be secure, flexible, and efficient, with features like dynamic reward adjustment, daily reward caps, and variable interest rates based on staking duration.

## Features

- **Reusable Staking Pools**: Pools can be reused for multiple staking rounds.
- **Escrow Mechanism**: Securely holds rewards and user funds.
- **Staking Durations**: Offers one-day, one-week, one-month, six-month, and one-year staking options.
- **Roles and Permissions**: Admin and Operator roles with specific permissions.
- **Fees**: Dynamic fee structure for staking and claiming rewards, including deposit and withdrawal fees.
- **Reward Logic**: Dynamic reward adjustment with a fixed daily cap.
- **Resettable Pools**: Pools can be reset by the admin.
- **Stoppable Function**: Allows the admin to pause and resume the contract.
- **Reload Staking Rewards**: Admin can reload the staking rewards.

## Modules

### Core Contracts

1. **Admin Contract**: Manages roles and permissions.
2. **Escrow Contract**: Holds and distributes rewards and user funds.
3. **One-Day Staking Contract**: Manages one-day staking.
4. **One-Week Staking Contract**: Manages one-week staking.
5. **One-Month Staking Contract**: Manages one-month staking.
6. **Six-Month Staking Contract**: Manages six-month staking.
7. **One-Year Staking Contract**: Manages one-year staking.

### Additional Contracts

1. **Fee Contract**: manages the fee calculations  for the stakingpools
2. **Reward Distribution Contract**: Handles reward distribution logic.

## Data Structures

- `UserStake`: Holds user-specific staking information, including staking duration and interest rate.
- `DayStake`: Holds daily staking information, including a mapping of user addresses to their respective `UserStake` structs.

## Core Functions

- `stake(uint256 amount, uint256 dayId, uint256 duration)`: For staking tokens.
- `claimReward(uint256 dayId)`: For claiming rewards.
- `updateRewardRate()`: For dynamic reward rate adjustment.
- `calculateReward(uint256 stakedAmount, uint256 duration)`: For calculating rewards.
- `resetPool()`: For resetting the staking pool.
- `pause()`: For pausing the contract.
- `unpause()`: For resuming the contract.
- `reloadRewards(uint256 amount)`: For reloading staking rewards.

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
- **Chainlink**: Oracle Services for fee management
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
