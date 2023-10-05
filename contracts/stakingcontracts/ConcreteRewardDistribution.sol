// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/AbstractRewardDistribution.sol";
import "./EscrowContract.sol";

/// @title ConcreteRewardDistribution
/// @dev This contract extends the AbstractRewardDistribution to provide a concrete implementation for reward distribution.
contract ConcreteRewardDistribution is AbstractRewardDistribution {
    EscrowContract public escrow;

    mapping(PoolType => uint256) public rewardPercentages;

    /// @notice Mapping to keep track of user rewards
    mapping(address => uint256) public rewards;

    event RewardPercentageUpdated(
        PoolType indexed poolType, 
        uint256 newPercentage
    );

    constructor(address _escrowAddress) {
        escrow = EscrowContract(_escrowAddress);
        rewardPercentages[PoolType.OneDay] = 5;
        rewardPercentages[PoolType.OneWeek] = 7;
        rewardPercentages[PoolType.OneMonth] = 10;
        rewardPercentages[PoolType.SixMonths] = 30;
        rewardPercentages[PoolType.OneYear] = 50;
    }

    /// @notice Internal function to calculate rewards based on staking amount, dayId, and poolId.
    /// @dev This function is meant to be overridden in derived contracts.
    /// @param amount The amount of tokens being staked.
    /// @param poolType The type of the pool.
    /// @return The calculated reward amount.
    function _calculateRewards(
        uint256 amount,
        PoolType poolType
    ) internal view override returns (uint256) {
        uint256 percentage = rewardPercentages[poolType];
        return (amount * percentage) / 100;
    }

    function calculateRewards(
        uint256 amount,
        PoolType poolType
    ) external view onlyAdmin returns (uint256) {
        return _calculateRewards(amount, poolType);
    }

    /// @dev Function to update reward percentages, only callable by admin.
    /// @param poolType The type of the pool.
    /// @param newPercentage The new reward percentage.
    function updateRewardPercentage(
        PoolType poolType,
        uint256 newPercentage
    ) external onlyAdmin {
        rewardPercentages[poolType] = newPercentage;
        emit RewardPercentageUpdated(poolType, newPercentage);
    }

}
