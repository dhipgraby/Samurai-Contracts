// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AdminContract is AccessControl {
    // Define roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    constructor() {
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    // Modifier to check if caller is admin
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }

    // Function to grant operator role
    function grantOperatorRole(address account) external onlyAdmin {
        grantRole(OPERATOR_ROLE, account);
    }

    // Function to revoke operator role
    function revokeOperatorRole(address account) external onlyAdmin {
        revokeRole(OPERATOR_ROLE, account);
    }
}
