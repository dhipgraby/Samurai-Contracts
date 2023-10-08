// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./AdminContract.sol";
import "./PoolTypes.sol";

/// @title StakingRewardManager
/// @notice Manages the distribution of staking rewards based on predefined pool types.
/// @dev Inherits from the PoolTypes contract and integrates with AdminContract for role-based permissions.
contract StakingRewardManager is PoolTypes {
    string private constant NOT_OPERATOR_ERROR = "Caller is not an operator";
    
    /// @notice AdminContract instance for role-based access control.
    AdminContract public _adminContract;

    /// @notice Mapping to hold the reward percentages for each type of staking pool.
    mapping(PoolType => uint256) public poolRewardRates;

    /// @dev Modifier to restrict function access to Operator roles only.
    modifier onlyOperator() {
        require(
            _adminContract.hasRole(_adminContract.OPERATOR_ROLE(), msg.sender),
            NOT_OPERATOR_ERROR
        );
        _;
    }

    /// @notice Emitted when the reward rate for a specific pool type is updated.
    /// @param poolType The pool type for which the reward rate was updated.
    /// @param newRate The new reward rate.
    event RewardRateUpdated(
        PoolType indexed poolType, 
        uint256 newRate
    );

    /// @notice Emitted when the AdminContract address is updated.
    /// @param AdminContract The new AdminContract address.
    event AdminContractUpdated(address indexed AdminContract);

    /// @notice Initializes the contract with default reward rates and AdminContract.
    /// @param adminContract The address of the AdminContract for role-based access control.
    constructor(address adminContract) {
        _adminContract = AdminContract(adminContract);
        // Initialize default reward rates for each pool type
        poolRewardRates[PoolType.OneDay] = 5;
        poolRewardRates[PoolType.OneWeek] = 7;
        poolRewardRates[PoolType.OneMonth] = 10;
        poolRewardRates[PoolType.SixMonths] = 30;
        poolRewardRates[PoolType.OneYear] = 50;
        poolRewardRates[PoolType.Custom] = 5;
        poolRewardRates[PoolType.Special0] = 5;
        poolRewardRates[PoolType.Special1] = 5;
    }

    /// @notice Computes the reward for a given staking amount and pool type.
    /// @dev This method can be overridden by inheriting contracts for custom reward logic.
    /// @param amount The staking amount in tokens.
    /// @param poolType The type of staking pool.
    /// @return Calculated reward amount in tokens.
    function computeStakingReward(
        uint256 amount,
        PoolType poolType
    ) external view returns (uint256) {
        uint256 rate = poolRewardRates[poolType];
        return (amount * rate) / 100;
    }

    /// @notice Modifies the reward rate for a given pool type.
    /// @dev Access restricted to operator roles.
    /// @param poolType The type of staking pool.
    /// @param newRate The new reward rate to set.
    function setRewardRate(
        PoolType poolType,
        uint256 newRate
    ) external onlyOperator {
        poolRewardRates[poolType] = newRate;
        emit RewardRateUpdated(poolType, newRate);
    }

    /// @notice Updates the AdminContract address for role-based access control.
    /// @dev Access restricted to operator roles.
    /// @param adminContract The new AdminContract address.
    function setAdminContract(address adminContract) external onlyOperator {
        _adminContract = AdminContract(adminContract);
        emit AdminContractUpdated(adminContract);
    }
}
