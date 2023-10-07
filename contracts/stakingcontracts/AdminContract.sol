// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/// @title Admin and Operator Role Management
/// @notice This contract manages admin and operator roles.
/// @dev It uses OpenZeppelin's AccessControlEnumerable for role-based access control.
contract AdminContract is Context, AccessControlEnumerable {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    /// @notice Initializes the admin role to the address deploying the contract.
    constructor() {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(OPERATOR_ROLE, _msgSender());
    }


}
