// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./TokenStakingPlatform.sol";
import "./AdminContract.sol";
import "./FeeManagement.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title One Day Staking Contract
/// @notice This contract allows users to stake tokens for a one-day duration.
/// @dev It interacts with the SamuraiStakingPlatform, AdminContract, and FeeContract for staking and fee calculations.
contract OneDayStakingContract is Pausable {
    string private constant NOT_ADMIN_ERROR = "Caller is not an admin";
    string private constant INCORRECT_FEE_AMOUNT = "Incorrect fee sent";
    string private constant INCORRECT_AMOUNT = "Amount must be greater than zero";

    /// @notice The SamuraiStakingPlatform contract for staking operations.
    TokenStakingPlatform public stakingPlatform;

    /// @notice The AdminContract for role-based access control.
    AdminContract public adminContract;

    /// @notice The FeeContract for calculating the staking fee.
    FeeManagement public feeContract;

    /// @notice Event emitted when the staking platform is updated.
    event StakingPlatformUpdated(address stakingPlatform);

    /// @notice Event emitted when the admin contract is updated.
    event AdminContractUpdated(address adminContract);

    /// @dev Modifier to check if the caller is an admin.
    modifier onlyAdmin() {
        require(
            adminContract.hasRole(adminContract.ADMIN_ROLE(), msg.sender),
            NOT_ADMIN_ERROR
        );
        _;
    }

    /// @notice Initializes the contract with the AdminContract, SamuraiStakingPlatform, and FeeContract addresses.
    /// @param _adminContract The address of the AdminContract.
    /// @param _stakingPlatform The address of the SamuraiStakingPlatform.
    /// @param _feeContract The address of the FeeContract.
    constructor(
        address _adminContract,
        address _stakingPlatform,
        address _feeContract
    ) {
        adminContract = AdminContract(_adminContract);
        stakingPlatform = TokenStakingPlatform(_stakingPlatform);
        feeContract = FeeManagement(_feeContract);
    }

    /// @notice Allows a user to stake tokens for one day.
    /// @dev The function requires the correct fee amount to be sent along with the transaction.
    /// @param amount The amount of tokens to stake.
    function stake(uint256 amount) external payable whenNotPaused() {
        uint256 _feeAmount = feeContract.fetchCurrentFee();
        require(msg.value == _feeAmount, INCORRECT_FEE_AMOUNT);
        require(amount > 0, INCORRECT_AMOUNT);

        // Define pool type and end timestamp for one-day staking
        uint256 poolType = 0;
        uint256 duration = 3 days;

        // Call the stakeTokens function in the StakingPlatform
        stakingPlatform.initiateStake{value: msg.value}(
            msg.sender,
            amount,
            poolType,
            duration
        );
    }

    /// @notice Updates the SamuraiStakingPlatform contract address.
    /// @dev Can only be called by an admin.
    /// @param newStakingPlatform The new SamuraiStakingPlatform contract address.
    function updateStakingPlatform(address newStakingPlatform) external onlyAdmin whenPaused(){
        stakingPlatform = TokenStakingPlatform(newStakingPlatform);
        emit StakingPlatformUpdated(newStakingPlatform);
    }

    /// @notice Updates the admin contract address.
    /// @dev Can only be called by an admin.
    /// @param newAdminContract The new admin contract address.
    function updateAdminContract(address newAdminContract) external onlyAdmin {
        adminContract = AdminContract(newAdminContract);
        emit AdminContractUpdated(newAdminContract);
    }

    /// @notice Updates the PoolStatus to PAUSED.
    /// @dev Can only be called by an admin.
    function pausePool() external onlyAdmin whenNotPaused() {
        super._pause();
    }

    /// @notice Updates the PoolStatus to UNPAUSED.
    /// @dev Can only be called by an admin.
    function unPausePool() external onlyAdmin whenPaused() {
        super._unpause();
    }

    /// @notice Returns the PoolStatus.
    function getPoolStatus() external view returns(bool) {
        return super.paused();
    }
}