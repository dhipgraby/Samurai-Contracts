// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

/// @title Admin and Operator Role Management
/// @notice This contract manages admin and operator roles.
/// @dev It uses OpenZeppelin's AccessControlEnumerable for role-based access control.
contract AdminContract is AccessControlEnumerable {
    // Declare state variables for roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    /// @notice Event emitted when any role is granted.
    event GrantedRole(bytes32 indexed role, address indexed account);

    /// @dev Throws if called by any account other than admin.
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }

    /// @dev Throws if called by any account other than operator.
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "Caller is not an operator");
        _;
    }

    /// @notice Initializes the admin role to the address deploying the contract.
    constructor() {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(OPERATOR_ROLE, msg.sender);
    }

    /// @notice Grants the operator role to a specific account.
    /// @dev Can only be called by an admin.
    /// @param account The address of the account to grant the operator role.
    function grantOperatorRole(address account) external onlyAdmin {
        grantRole(OPERATOR_ROLE, account);
        emit GrantedRole(OPERATOR_ROLE, account);
    }

    /// @notice Revokes the operator role from a specific account.
    /// @dev Can only be called by an admin.
    /// @param account The address of the account to revoke the operator role.
    function revokeOperatorRole(address account) external onlyAdmin {
        revokeRole(OPERATOR_ROLE, account);
    }
}
