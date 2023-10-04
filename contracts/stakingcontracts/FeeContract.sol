// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./AdminContract.sol";
import "./FeeTreasury.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/// @title FeeContract
/// @dev This contract sets a fee and provides a mechanism to incorporate the fee in derived contracts.
contract FeeContract is AdminContract {
    uint256 private fee = 0.0009 ether;
    FeeTreasury public feeTreasury;
    
    /// @dev Event emitted when fees are deducted.
    /// @param user The account that paid the fees.
    /// @param feeAmount The fee amount.
    event FeeDeducted(address indexed user, uint256 feeAmount);
    
    event FeeUpdated(uint256 newFee);
    
    /// @dev Event emitted when fees are withdrawn.
    event FeesWithdrawn(address indexed admin, uint256 amount);
    
    /// @dev Event emitted when stuck tokens are recovered.
    event TokensRecovered(address indexed admin, address token, uint256 amount);

    constructor(address payable _feeTreasury) {
        feeTreasury = FeeTreasury(_feeTreasury);
    }

    /// @notice Get the current fee amount.
    /// @return The fee amount.
    function getFee() external view returns (uint256) {
        return fee;
    }

    /// @dev Function to update the fee.
    /// @param newFee The new fee amount in wei.
    function updateFee(uint256 newFee) external onlyAdmin {
        fee = newFee;
        emit FeeUpdated(newFee);
    }

}