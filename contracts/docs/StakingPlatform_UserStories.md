# Staking Platform User Stories

## Table of Contents

- [General Users](#general-users)
- [Admin Users](#admin-users)
- [Operators](#operators)

---

## General Users

### 1. Staking Tokens

- **User Story**: As a user, I want to stake my tokens so that I can earn rewards over time.
- **Acceptance Criteria**:
  - The user can select the amount of tokens to stake.
  - The user can choose the staking duration (one-week or one-month).
  - The user receives a confirmation upon successful staking. (off-chain)

### 2. Claiming Rewards

- **User Story**: As a user, I want to claim my stake and earned rewards so that I can enjoy the benefits of staking.
- **Acceptance Criteria**:
  - The user can view their pending rewards.
  - The user can claim rewards after the staking period has ended.

### 3. Viewing Staking History

- **User Story**: As a user, I want to view my staking history so that I can keep track of my investments.
- **Acceptance Criteria**:
  - The user can view a list of all their past and current stakes.
  - The list includes the amount staked, duration, and rewards earned.

### 4. Transparent Fees

- **User Story**: As a user, I want to be charged a fair fee that adjusts according to the announcement.
- **Acceptance Criteria**:
  - The user is informed of the fee before confirming the transaction.
  - Fee changes are announced in advance

### 5. Terminate Staking Round

- **User Story**: As a user, I want to claim my tokens after the unstaking timestamp have passed so that the staking round can be terminated and rewards can be distributed.
- **Acceptance Criteria**:
  - The user can view the `unstakingTimestamp` for each staking round they have participated in.
  - The user can initiate the unstaking process only after the `unstakingTimestamp` has passed.

---

## Admin Users

### 1. Withdraw Funds

- **User Story**: As an admin, I want to withdraw the fees from the fee treasury
- **Acceptance Criteria**:
  - The admin can execute functions to withdraw the fee amount

### 2. Adjust Reward Rates

- **User Story**: As an admin, I want to adjust the reward percentage.
- **Acceptance Criteria**:
  - The admin can update the reward automatically applied to future stakes.

### 3. Role Management

- **User Story**: As an admin, I want to assign operators roles and permissions for better platform management.
- **Acceptance Criteria**:
  - The admin can assign and revoke `OPERATOR_ROLE` permissions.

---

## Operators

### 1. Monitor Staking Pools

- **User Story**: As an operator, I want to monitor staking pools' health and status to ensure they operate correctly.
- **Acceptance Criteria**:
  - The operator has access to real-time analytics and status reports of staking pools.


### 2. Emergency Shutdown

- **User Story**: As an operator, I want to have the ability to perform an emergency shutdown of a staking pool in case of any security threats.
- **Acceptance Criteria**:
  - The operator can initiate an emergency shutdown, freezing all staking and reward activities.
