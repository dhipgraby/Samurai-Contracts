// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../AdminContract.sol";

// @title AbstractRewardDistribution
// @dev An abstract contract that provides an internal function for reward calculation and inherits from the AdminContract.
abstract contract AbstractRewardDistribution is AdminContract {

    function calculateRewards(uint256 amount, uint256 dayId, uint256 poolId) internal virtual returns (uint256);
}
