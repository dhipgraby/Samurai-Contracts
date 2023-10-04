# Staking Pool Platform Overview

## Introduction

This document outlines the architecture and logic of our Staking Pool Platform. The platform allows users to stake tokens and earn rewards. It is designed to be flexible, secure, and efficient, with features like dynamic reward adjustment, daily reward caps, and variable staking durations.

## Key Features

### Reusable Staking Pools

- Pools can be reused for multiple staking rounds.

### Escrow Contract

- Upon completion of a staking round, rewards and user funds are moved to a secure escrow contract.

### Staking Durations

- Users can choose between one-day, one-week, one-month, six-month, and one-year staking options.

### Roles and Permissions

- Two types of roles: `ADMIN_ROLE` and `OPERATOR_ROLE`, each with different permissions.

### Fees

- Staking Fee: 0.0009 in Ethereum
- Claiming Fee: 0.0009 in Ethereum

### Dynamic Reward Adjustment

- The system adjusts the reward rate based on the total amount staked in the pool.

### Fixed Daily Reward Cap

- A maximum daily reward that any single user can receive.

### Resettable Pools

- Pools can be reset by the admin.

### Stoppable Function

- Allows the admin to pause and resume the contract.

### Reload Staking Rewards

- Admin can reload the staking rewards.

### Modular Contract Structure

- The contract is modular, allowing for easy upgrades and extensions.

## Data Structures

### UserStake

- `amount`: The amount staked by the user.
- `reward`: The reward earned by the user.
- `duration`: The staking duration chosen by the user.
- `dayId`: The day identifier when the user staked.

### DayStake

- `dayId`: Identifier for each day, starting at 00:01 and ending at 00:00.
- `totalAmount`: The total amount staked on a particular day.
- `totalReward`: The total reward earned on a particular day.
- `userStakes`: A mapping of user addresses to their respective `UserStake` structs, identified by `dayId`.

## Functions

- `stake(uint256 amount, uint256 dayId, uint256 duration)`: Allows a user to stake a certain amount of tokens for a specific duration. The `dayId` is used to group stakes made on the same day.
- `claimReward(uint256 dayId)`: Allows a user to claim their earned rewards based on the `dayId`.
- `updateRewardRate()`: Dynamically adjusts the reward rate based on the total amount staked.
- `calculateReward(uint256 stakedAmount, uint256 duration, uint256 dayId)`: Calculates the reward based on the staked amount, the chosen duration, and the `dayId`.
- `resetPool()`: Resets the staking pool.
- `pause()`: Pauses the contract.
- `unpause()`: Resumes the contract.
- `reloadRewards(uint256 amount)`: Reloads staking rewards.

## Reward Logic

The reward rate is dynamically adjusted based on the total amount staked in the pool. The daily reward cap ensures that rewards are distributed equitably among users. The reward rate also considers the staking duration chosen by the user. The `dayId` is used to manage and distribute rewards for stakes made on the same day.

## Conclusion

This Staking Pool Platform is designed to be robust, secure, and flexible, meeting the needs of both users and administrators. It offers a range of features to make staking both rewarding and fair for all participants.
