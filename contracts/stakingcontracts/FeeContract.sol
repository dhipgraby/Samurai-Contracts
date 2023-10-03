// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./AdminContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/// @title FeeContract
/// @dev This contract sets a fee and provides a mechanism to incorporate the fee in derived contracts.
contract FeeContract is AdminContract {
    uint256 private fee = 0.0009 ether;
    
    /// @dev Event emitted when fees are deducted.
    /// @param user The account that paid the fees.
    /// @param feeAmount The fee amount.
    event FeeDeducted(address indexed user, uint256 feeAmount);
    
    /// @dev Event emitted when fees are withdrawn.
    event FeesWithdrawn(address indexed admin, uint256 amount);
    
    /// @dev Event emitted when stuck tokens are recovered.
    event TokensRecovered(address indexed admin, address token, uint256 amount);

    /// @dev Event emitted when the fee is updated.
    /// @param newFee The new fee amount.
    event FeeUpdated(uint256 newFee);

    /// @notice Get the current fee amount.
    /// @return The fee amount.
    function getFee() external view returns (uint256) {
        return fee;
    }

    /// @dev Internal function to handle fee deduction.
    /// @param user The address of the user to deduct the fee from.
    /// @return bool indicating whether the fee was successfully deducted.
    function _deductFee(address user) internal returns (bool) {
        // Logic to actually deduct the fee amount from the user should go here.
        // This can be implemented in the contracts that inherit this FeeContract.

        emit FeeDeducted(user, fee);
        return true;
    }

    /// @dev Function to update the fee.
    /// @param newFee The new fee amount in wei.
    function updateFee(uint256 newFee) external onlyAdmin {
        fee = newFee;
        emit FeeUpdated(newFee);
    }

    /// @notice Function to withdraw accumulated fees.
    function withdrawFees() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");

        payable(msg.sender).transfer(balance);
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

}