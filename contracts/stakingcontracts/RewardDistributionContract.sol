// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RewardDistributionContract {
    // Define state variables
    address public admin;
    mapping(address => uint256) public rewards;

    // Events
    event RewardDistributed(address indexed user, uint256 rewardAmount);
    event RewardClaimed(address indexed user, uint256 rewardAmount);

    constructor(address _admin) {
        admin = _admin;
    }

    // Modifier to check if caller is admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not an admin");
        _;
    }

    // Function to distribute rewards
    function distributeReward(address user, uint256 amount) external onlyAdmin {
        rewards[user] += amount;
        emit RewardDistributed(user, amount);
    }

    // Function to claim rewards
    function claimReward() external {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards available for this address");

        rewards[msg.sender] = 0;
        // Logic to transfer the reward tokens to the user

        emit RewardClaimed(msg.sender, reward);
    }
}
