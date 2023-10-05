// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./AdminContract.sol";
import "./FeeTreasury.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/// @title FeeContract
/// @dev This contract sets a fee and provides a mechanism to incorporate the fee in derived contracts.
contract FeeContract {
    string private constant NOT_ADMIN_ERROR = "Caller is not an admin";

    uint256 private fee = 0.0009 ether;
    
    AdminContract private _adminContract;
    FeeTreasury public feeTreasury;

    /// @notice Event emitted when the fee is updated.
    /// @param newFee The new fee amount in wei.
    event FeeUpdated(uint256 newFee);
    
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

    constructor(address payable _feeTreasury, address adminContract) {
        feeTreasury = FeeTreasury(_feeTreasury);
        _adminContract = AdminContract(adminContract);
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

    /// @notice Updates the admin contract address.
    /// @dev Can only be called by an admin.
    /// @param adminContract The new admin contract address.
    function updateAdminContract(address adminContract) external onlyAdmin {
        _adminContract = AdminContract(adminContract);
        emit AdminContractUpdated(adminContract);
    }

}