// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./AdminContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title FeeTreasury
/// @dev This contract receives the fee amounts.
contract FeeTreasury {
    string private constant NOT_ADMIN_ERROR = "Caller is not an admin";

    AdminContract private _adminContract;
    
    /// @dev Event emitted when fees are withdrawn.
    event FeesWithdrawn(address indexed admin, uint256 amount);

    /// @dev Event emitted when stuck tokens are recovered.
    event TokensRecovered(address indexed admin, address token, uint256 amount);
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

    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    constructor(address payable adminContract) {
        _adminContract = AdminContract(adminContract);
    }

    /// @notice Function to withdraw accumulated fees.
    function withdrawFees() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Fee withdrawal failed");
        emit FeesWithdrawn(msg.sender, balance);
    }

    /// @notice Function to safely recover any stuck ERC20 tokens.
    /// @param token The address of the token to recover.
    /// @param amount The amount of tokens to recover.
    function recoverStuckTokens(
        address token,
        uint256 amount
    ) external onlyAdmin {
        IERC20(token).transfer(msg.sender, amount);
        emit TokensRecovered(msg.sender, token, amount);
    }

    /// @notice Updates the admin contract address.
    /// @dev Can only be called by an admin.
    /// @param adminContract The new admin contract address.
    function updateAdminContract(address adminContract) external onlyAdmin {
        _adminContract = AdminContract(adminContract);
        emit AdminContractUpdated(adminContract);
    }
}
