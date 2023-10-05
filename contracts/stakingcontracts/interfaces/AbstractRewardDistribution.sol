// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../PoolTypes.sol";

// @title AbstractRewardDistribution
// @dev An abstract contract that provides an internal function for reward calculation.
abstract contract AbstractRewardDistribution is PoolTypes {

    /// @notice Internal function to calculate rewards based on staking amount, dayId, and poolId.
    /// @dev This function is meant to be overridden in derived contracts.
    /// @param amount The amount of tokens being staked.
    /// @param poolType The type of the pool.
    /// @return The calculated reward amount.
    function _calculateRewards(
        uint256 amount,
        PoolType poolType
    ) internal virtual returns (uint256);

}
