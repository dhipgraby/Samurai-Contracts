// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YenToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 6000000000 * (10 ** 18); // 6,000,000,000 tokens with 18 decimals

    constructor() ERC20("Yen", "YEN") {
        uint256 initialAmount = 1000000 ether;
        _mint(msg.sender, initialAmount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _mint(address account, uint256 amount) internal virtual override {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "YenToken: Cannot mint more than max supply"
        );
        super._mint(account, amount);
    }

}
