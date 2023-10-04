// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./StakingPlatform.sol";

contract OneDayStakingContract {
    
    StakingPlatform public stakingPlatform;
    
    constructor(address _stakingPlatform) {
        stakingPlatform = StakingPlatform(_stakingPlatform);
    }
    
    function stake(uint256 amount) external payable {
        // Logic for token transfer from user to this contract could go here

        // Define pool type and end timestamp for one-day staking
        uint256 poolType = 0;
        uint256 duration = 1 days;

        // Call the stakeTokens function in the StakingPlatform
        stakingPlatform.stakeTokens{value: msg.value}(msg.sender, amount, poolType, duration);

        // Further logic like emitting events could go here
    }
}
