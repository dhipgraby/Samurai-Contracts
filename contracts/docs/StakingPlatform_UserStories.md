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
  - The user receives a confirmation upon successful staking.

### 2. Claiming Rewards

- **User Story**: As a user, I want to claim my earned rewards so that I can enjoy the benefits of staking.
- **Acceptance Criteria**:
  - The user can view their pending rewards.
  - The user can claim rewards after the staking period has ended.

### 3. Viewing Staking History

- **User Story**: As a user, I want to view my staking history so that I can keep track of my investments.
- **Acceptance Criteria**:
  - The user can view a list of all their past and current stakes.
  - The list includes the amount staked, duration, and rewards earned.

### 4. Multiple Stakes in One Day

- **User Story**: As a user, I want to make multiple stakes in a single day and have them combined so that I don't have to manage multiple transactions.
- **Acceptance Criteria**:
  - The user can make multiple stakes within a single day.
  - These stakes are combined into a single record for that day.

### 5. Dynamic Fees

- **User Story**: As a user, I want to be charged a fair fee that adjusts according to real-time market conditions so that I don't overpay.
- **Acceptance Criteria**:
  - The user is informed of the fee before confirming the transaction.
  - The fee adjusts dynamically based on Chainlink Price Feeds.

### 6. Terminate Staking Round

- **User Story**: As a user, I want to unstake my tokens after the `unstakingTimestamp` has passed so that the staking round can be terminated and rewards can be distributed.
- **Acceptance Criteria**:
  - The user can view the `unstakingTimestamp` for each staking round they have participated in.
  - The user can initiate the unstaking process only after the `unstakingTimestamp` has passed.
  - Initiating the unstaking process will trigger the termination of the staking round and initiate the reward distribution process.

---

## Admin Users

### 1. Initialize Staking Round

- **User Story**: As an admin, I want to initialize a new staking round so that users can start staking tokens.
- **Acceptance Criteria**:
  - The admin can initiate a new staking round from the admin dashboard.
  - A notification is sent to users when a new round is initiated.

### 2. Adjust Reward Rates

- **User Story**: As an admin, I want to adjust the reward rates dynamically based on total staked amounts to ensure fair distribution.
- **Acceptance Criteria**:
  - The admin can update the reward rates, which are then automatically applied to future stakes.

### 3. Role Management

- **User Story**: As an admin, I want to assign roles and permissions to operators for better management of the platform.
- **Acceptance Criteria**:
  - The admin can assign and revoke `OPERATOR_ROLE` permissions.

---

## Operators

### 1. Monitor Staking Pools

- **User Story**: As an operator, I want to monitor the health and status of staking pools to ensure they are operating correctly.
- **Acceptance Criteria**:
  - The operator has access to real-time analytics and status reports of staking pools.

### 2. Generate Reports

- **User Story**: As an operator, I want to generate reports on staking activities and rewards distribution for record-keeping and auditing.
- **Acceptance Criteria**:
  - The operator can generate and export reports in various formats (CSV, PDF).

### 3. Emergency Shutdown

- **User Story**: As an operator, I want to have the ability to perform an emergency shutdown of a staking pool in case of any security threats.
- **Acceptance Criteria**:
  - The operator can initiate an emergency shutdown, freezing all staking and reward activities.
