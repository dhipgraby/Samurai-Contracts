// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./AdminContract.sol";
import "./FeeTreasury.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title FeeManagement
/// @notice This contract manages the fee structure for the platform.
/// @dev It integrates with AdminContract for role-based access control.
contract FeeManagement {

    string private constant NOT_OPERATOR_ERROR = "Caller is not an operator";

    uint256 private currentFee = 0.0009 ether;
    AdminContract public _adminContract;

    /// @notice Event emitted when the fee is updated.
    /// @param updatedFee The new fee amount in wei.
    event FeeUpdated(uint256 updatedFee);

    /// @notice Event emitted when the admin contract is updated.
    /// @param AdminContract The new admin contract address.
    event AdminContractUpdated(address indexed AdminContract);

    /// @dev Modifier to check if the caller is an operator.
    modifier onlyOperator() {
        require(
            _adminContract.hasRole(_adminContract.OPERATOR_ROLE(), msg.sender),
            NOT_OPERATOR_ERROR
        );
        _;
    }

    /// @param adminContract The address of the AdminContract.
    constructor(address adminContract) {
        _adminContract = AdminContract(adminContract);
    }

    /// @notice Fetches the current fee amount.
    /// @return currentFee The current fee amount in wei.
    function fetchCurrentFee() external view returns (uint256) {
        return currentFee;
    }

    /// @notice Allows an admin to update the fee amount.
    /// @dev Can only be called by an operator.
    /// @param newFee The new fee amount in wei.
    function updateFeeAmount(uint256 newFee) external onlyOperator {
        currentFee = newFee;
        emit FeeUpdated(newFee);
    }

    /// @notice Updates the admin contract address for role-based access control.
    /// @dev Can only be called by an operator.
    /// @param adminContract The new admin contract address.
    function updateAdminAccessControl(address adminContract) external onlyOperator {
        _adminContract = AdminContract(adminContract);
        emit AdminContractUpdated(adminContract);
    }
}