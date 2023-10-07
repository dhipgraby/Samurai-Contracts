// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./AdminContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title FeeTreasury
/// @notice This contract serves as the treasury for collecting fees.
/// @dev It integrates with AdminContract for role-based access control.
contract FeeTreasury {
    string private constant NOT_ADMIN_ERROR = "Caller is not an admin";
    string private constant NOTHING_TO_WITHDRAW = "No fees to withdraw";
    string private constant WITHDRAWAL_FAILED = "Fee withdrawal failed";

    AdminContract public _adminContract;

    /// @notice Event emitted when fees are withdrawn.
    /// @param admin The admin who withdrew the fees.
    /// @param amount The amount of fees withdrawn.
    event FeesWithdrawn(address indexed admin, uint256 amount);

    /// @notice Event emitted when stuck tokens are recovered.
    /// @param admin The admin who recovered the tokens.
    /// @param token The address of the recovered token.
    /// @param amount The amount of tokens recovered.
    event TokensRecovered(address indexed admin, address token, uint256 amount);

    /// @notice Event emitted when Ether is received.
    /// @param sender The address of the sender.
    /// @param amount The amount of Ether received.
    event EtherReceived(address indexed sender, uint256 amount);

    /// @notice Event emitted when the admin contract is updated.
    /// @param AdminContract The new admin contract address.
    event AdminContractUpdated(address indexed AdminContract);

    /// @dev Modifier to check if the caller is an admin.
    modifier onlyAdmin() {
        require(
            _adminContract.hasRole(_adminContract.ADMIN_ROLE(), msg.sender),
            NOT_ADMIN_ERROR
        );
        _;
    }

    /// @notice Fallback function to receive Ether.
    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    /// @notice Initializes the contract with the AdminContract address.
    /// @param adminContract The address of the AdminContract.
    constructor(address payable adminContract) {
        _adminContract = AdminContract(adminContract);
    }

    /// @notice Allows an admin to withdraw accumulated fees.
    /// @dev Can only be called by an admin.
    function withdrawAccumulatedFees() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, NOTHING_TO_WITHDRAW);

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, WITHDRAWAL_FAILED);
        emit FeesWithdrawn(msg.sender, balance);
    }

    /// @notice Allows an admin to recover stuck ERC20 tokens.
    /// @dev Can only be called by an admin.
    /// @param token The address of the token to recover.
    function recoverStuckERC20Tokens(
        address token
    ) external onlyAdmin {
        uint256 _amount = IERC20(token).balanceOf(address(this));
        require(_amount > 0, NOTHING_TO_WITHDRAW);
        IERC20(token).transfer(msg.sender, _amount);
        emit TokensRecovered(msg.sender, token, _amount);
    }

    /// @notice Updates the admin contract address for role-based access control.
    /// @dev Can only be called by an admin.
    /// @param adminContract The new admin contract address.
    function updateAdminAccessControl(address adminContract) external onlyAdmin {
        _adminContract = AdminContract(adminContract);
        emit AdminContractUpdated(adminContract);
    }
}