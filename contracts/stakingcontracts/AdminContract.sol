// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AdminContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    constructor() {
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    // Additional admin and operator functions here
    // pause(), unpause(), resetPool(), reloadRewards()
}
