// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/AbstractRewardDistribution.sol";
import "./AdminContract.sol";

/// @title ConcreteRewardDistribution
/// @dev This contract extends the AbstractRewardDistribution to provide a concrete implementation for reward distribution.
contract ConcreteRewardDistribution is AbstractRewardDistribution {
    string private constant NOT_ADMIN_ERROR = "Caller is not an admin";
    AdminContract private _adminContract;

    /// @notice Mapping to keep track of reward percentages
    mapping(PoolType => uint256) public rewardPercentages;

     /// @dev Modifier to check if the caller is an admin.
     modifier onlyAdmin() {
        require(
            _adminContract.hasRole(_adminContract.ADMIN_ROLE(), msg.sender),
            NOT_ADMIN_ERROR
        );
        _;
    }

    /// @dev Event emitted when the admin contract is updated.
    /// @param poolType The type of the pool.
    /// @param newPercentage The new reward percentage.
    event RewardPercentageUpdated(
        PoolType indexed poolType, 
        uint256 newPercentage
    );

    /// @notice Event emitted when the admin contract is updated.
    /// @param AdminContract The new admin contract address.
    event AdminContractUpdated(address indexed AdminContract);

    constructor() {
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
    ) external view returns (uint256) {
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

    /// @notice Updates the admin contract address.
    /// @dev Can only be called by an admin.
    /// @param adminContract The new admin contract address.
    function updateAdminContract(address adminContract) external onlyAdmin {
        _adminContract = AdminContract(adminContract);
        emit AdminContractUpdated(adminContract);
    }

}
