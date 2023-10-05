// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

/// @title Admin and Operator Role Management
/// @notice This contract manages admin and operator roles.
/// @dev It uses OpenZeppelin's AccessControlEnumerable for role-based access control.
contract AdminContract is AccessControlEnumerable {
    string private constant NOT_ADMIN_ERROR = "Caller is not an admin";
    string private constant NOT_OPERATOR_ERROR = "Caller is not an operator";

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    /// @notice Event emitted when any role is granted.
    /// @param role The role that was granted.
    /// @param account The account that was granted the role.
    event GrantedRole(
        bytes32 indexed role, 
        address indexed account
    );

    /// @dev Throws if called by any account other than admin.
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), NOT_ADMIN_ERROR);
        _;
    }

    /// @dev Throws if called by any account other than operator.
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), NOT_OPERATOR_ERROR);
        _;
    }

    /// @notice Initializes the admin role to the address deploying the contract.
    constructor() {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(OPERATOR_ROLE, msg.sender);
    }


}
