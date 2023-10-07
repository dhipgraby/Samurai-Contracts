// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./AdminContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SamuraiStakingPlatform.sol";

/// @title Escrow Contract for Staking Platform
/// @notice This contract handles the deposit and withdrawal of staked tokens.
/// @dev It uses the AdminContract for role-based access control.
contract EscrowContract {
    string private constant NOT_ADMIN_ERROR = "Caller is not an admin";
    string private constant NOT_STAKINGPLATFORM_ERROR = "Caller is not the staking platform";
    string private constant TRANSFER_ERROR = "Transfer failed";
    string private constant BALANCE_ERROR = "Insufficient balance";
    string private constant NO_FUNDS_TO_WITHDRAW = "No funds to withdraw";

    AdminContract private _adminContract;
    SamuraiStakingPlatform public _stakingPlatform;

    /// @notice Mapping of user stake balances.
    mapping(address => mapping(uint256 => uint256)) public userStakeBalances;
    mapping(address => mapping(uint256 => uint256)) public userStakeRewards;


    /// @notice Total balance of the Reward amount.
    uint256 private totalRewardBalance;

    /// @dev Modifier to check if the caller is an admin.
    modifier onlyAdmin() {
        require(
            _adminContract.hasRole(_adminContract.ADMIN_ROLE(), msg.sender),
            NOT_ADMIN_ERROR
        );
        _;
    }

    /// @dev Modifier to check if the caller is the stakingPlatform.
    modifier onlyStakingPlatform() {
        require(msg.sender == address(_stakingPlatform), 
            NOT_STAKINGPLATFORM_ERROR
        );
        _;
    }

    /// @notice Event emitted when the admin contract is updated.
    /// @param AdminContract The new admin contract address.
    event AdminContractUpdated(address indexed AdminContract);

    /// @notice Event emitted when the staking platform is updated.
    /// @param StakingPlatform The new staking platform address.
    event StakingPlatformUpdated(address indexed StakingPlatform);

    /// @notice Event emitted when a user deposits tokens.
    /// @param user the address of the user.
    /// @param stakeId the unique stake ID.
    /// @param amount the amount of tokens.
    event UserDeposited(
        address indexed user,
        uint256 indexed stakeId,
        uint256 amount
    );

    /// Event emitted when a user withdraws tokens.
    /// @param user the address of the user.
    /// @param stakeId the unique stake ID.
    /// @param amount the amount of tokens.
    event UserWithdrawn(
        address indexed user,
        uint256 indexed stakeId,
        uint256 amount
    );

    /// Event emitted when rewards are deposited.
    /// @param admin the address of the admin.
    /// @param amount the amount of rewards 
    event RewardsDeposited(address indexed admin, uint256 amount);

    /// @notice Initializes the contract with the admin contract address.
    /// @param adminContract The address of the admin contract.
    constructor(address adminContract) {
        _adminContract = AdminContract(adminContract);
    }

    /// @notice Returns the total reward balance.
    /// @return The total reward balance.
    function getRewardBalance() external view returns (uint256) {
        return totalRewardBalance;
    }

    /// @notice Deposits tokens on behalf of a user.
    /// @dev Can only be called by the staking platform.
    /// @param user The address of the user depositing tokens.
    /// @param stakeId The unique stake ID.
    /// @param amount The amount of tokens to be deposited.
    /// @param reward The amount of tokens to be rewarded.
    /// @param token The ERC20 token contract address.
    function userDeposit(
        address user,
        uint256 stakeId,
        uint256 amount,
        uint256 reward,
        address token
    ) external onlyStakingPlatform {
        _userDeposit(user, stakeId, amount, reward, token);
    }

    /// @notice Withdraws tokens on behalf of a user.
    /// @dev Can only be called by the staking platform.
    /// @param user The address of the user withdrawing tokens.
    /// @param stakeId The unique stake ID.
    /// @param amount The amount of tokens to be withdrawn.
    /// @param token The ERC20 token contract address.
    function userWithdraw(
        address user,
        uint256 stakeId,
        uint256 amount,
        address token
    ) external onlyStakingPlatform {
        _userWithdraw(user, stakeId, amount, token);
    }

    /// @dev Internal function to deposit users' staked tokens into the escrow.
    /// @param user The address of the user depositing tokens.
    /// @param stakeId The unique stake ID.
    /// @param amount The amount of tokens to be deposited.
    /// @param reward The amount of tokens to be rewarded.
    /// @param token The ERC20 token contract address
    function _userDeposit(
        address user,
        uint256 stakeId,
        uint256 amount,
        uint256 reward,
        address token
    ) private {
        IERC20 erc20Token = IERC20(token);
        userStakeBalances[user][stakeId] += amount;
        userStakeRewards[user][stakeId] += reward;
        require(
            erc20Token.transferFrom(user, address(this), amount),
            TRANSFER_ERROR
        );

        emit UserDeposited(user, stakeId, amount);
    }

    /// @dev Internal function to withdraw users' staked tokens from the escrow.
    /// @param user The address of the user withdrawing tokens.
    /// @param stakeId The unique stake ID.
    /// @param amount The amount of tokens to be withdrawn.
    /// @param token The ERC20 token contract address
    function _userWithdraw(
        address user,
        uint256 stakeId,
        uint256 amount,
        address token
    ) private {
        require(userStakeBalances[user][stakeId] >= amount, BALANCE_ERROR);
        uint256 _reward = userStakeRewards[user][stakeId];
        userStakeBalances[user][stakeId] = 0;
        userStakeRewards[user][stakeId] = 0;

        require(IERC20(token).transfer(user, amount + _reward), TRANSFER_ERROR);
        emit UserWithdrawn(user, stakeId, amount);
    }

    /// @notice Updates the admin contract address.
    /// @dev Can only be called by an admin.
    /// @param adminContract The new admin contract address.
    function updateAdminContract(address adminContract) external onlyAdmin {
        _adminContract = AdminContract(adminContract);
        emit AdminContractUpdated(adminContract);
    }

    /// @notice Updates the samurai staking platform address.
    /// @dev Can only be called by an admin.
    /// @param stakingPlatform The new samurai staking platform address.
    function updateStakingPlatform(address stakingPlatform) external onlyAdmin {
        _stakingPlatform = SamuraiStakingPlatform(stakingPlatform);
        emit StakingPlatformUpdated(stakingPlatform);
    }

    /// @notice Allows the admin to deposit rewards into the contract.
    /// @dev Can only be called by an admin.
    /// @param amount The amount of tokens to be deposited as rewards.
    /// @param token The ERC20 token contract address.
    function depositRewards(uint256 amount, address token) external onlyAdmin {
        IERC20 erc20Token = IERC20(token);
        require(
            erc20Token.transferFrom(msg.sender, address(this), amount),
            TRANSFER_ERROR
        );

        // Update the total reward balance
        totalRewardBalance += amount;

        emit RewardsDeposited(msg.sender, amount);
    }

    /// @notice Allows the admin to withdraw any Ether balance from the contract.
    /// @dev Can only be called by an admin. The function will revert if there are no fees to withdraw.
    function withdraw() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, NO_FUNDS_TO_WITHDRAW);

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, TRANSFER_ERROR);
    }

    /// @notice Function to safely recover any stuck ERC20 tokens.
    /// @param token The address of the token to recover.
    /// @param amount The amount of tokens to recover.
    function recoverStuckTokens(
        address token,
        uint256 amount
    ) external onlyAdmin {
        IERC20(token).transfer(msg.sender, amount);
    }

}