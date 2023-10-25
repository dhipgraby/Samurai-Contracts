// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./YenToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./stakingcontracts/FeeManagement.sol";
import "./stakingcontracts/FeeTreasury.sol";

/// @title Faucet for YenToken
/// @notice This contract allows users to request tokens from a faucet with a cooldown period.
/// @dev The contract uses YenToken as its ERC20 token.
contract Faucet is Ownable {
    // String constants for error messages
    string private constant INCORRECT_FEE = "Incorrect fee sent";
    string private constant COOLDOWN_NOT_OVER = "Cooldown not over";
    string private constant INSUFFICIENT_FAUCET_BALANCE = "Not enough tokens in faucet";
    string private constant TRANSFER_FAILED = "Transfer failed";

    YenToken public yenToken;
    FeeManagement public feeContract;
    address payable public feeTreasury;

    mapping(address => uint256) public lastAccessTime;
    uint256 public cooldownTime = 300 seconds; // 1 days;
    uint256 public maxAmount = 1000 * 10 ** 18;
    uint256 public totalClaimed = 0;
    uint256 public remainingTokens;

    event TokensRequested(address indexed user, uint256 amount);
    event UpdatedMaxAmount(uint256 newMaxAmount);

    modifier canRequestTokens() {
        require(
            block.timestamp >= lastAccessTime[msg.sender] + cooldownTime,
            COOLDOWN_NOT_OVER
        );
        _;
    }

    receive() external payable {}

    constructor(address _yenToken, address _feeContract, address payable _feeTreasury) {
        yenToken = YenToken(_yenToken);
        feeContract = FeeManagement(_feeContract);
        feeTreasury = _feeTreasury;
        remainingTokens = yenToken.balanceOf(address(this));
    }

    /// @notice Request tokens from the faucet.
    /// @dev This function checks for cooldown and fee before transferring tokens.
    function requestTokens() external payable canRequestTokens {
        uint256 feeAmount = feeContract.fetchCurrentFee();
        require(msg.value == feeAmount, INCORRECT_FEE);
        require(remainingTokens >= maxAmount, INSUFFICIENT_FAUCET_BALANCE);

        lastAccessTime[msg.sender] = block.timestamp;
        require(yenToken.transfer(msg.sender, maxAmount), TRANSFER_FAILED);

        totalClaimed += maxAmount;
        remainingTokens -= maxAmount;
        (bool success, ) = payable(feeTreasury).call{value: msg.value}("");
        require(success, TRANSFER_FAILED);

        emit TokensRequested(msg.sender, maxAmount);
    }

    /// @notice Deposit tokens to replenish the faucet.
    /// @param amount The amount of tokens to deposit.
    function replenishFaucet(uint256 amount) external onlyOwner {
        require(
            yenToken.transferFrom(msg.sender, address(this), amount),
            TRANSFER_FAILED
        );
        remainingTokens += amount;
    }

    /// @notice Update the cooldown time between faucet requests.
    /// @param newCooldownTime The new cooldown time in seconds.
    function setCooldownTime(uint256 newCooldownTime) external onlyOwner {
        cooldownTime = newCooldownTime;
    }

    /// @notice Update the maximum amount of tokens that can be requested from the faucet.
    /// @param newMaxAmount The new maximum amount in tokens.
    function setMaxRequestAmount(uint256 newMaxAmount) external onlyOwner {
        maxAmount = newMaxAmount;
        emit UpdatedMaxAmount(newMaxAmount);
    }

    /// @notice Withdraw stuck ERC20 tokens from the contract.
    /// @param tokenAddress The address of the ERC20 token to withdraw.
    /// @param to The destination address for the withdrawn tokens.
    function recoverStuckTokens(address tokenAddress, address to) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 amount = token.balanceOf(address(this));
        require(token.transfer(to, amount), TRANSFER_FAILED);
    }

    /// @notice Withdraw stuck Ether from the contract.
    /// @param to The destination address for the withdrawn Ether.
    function recoverStuckEther(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = to.call{value: balance}("");
        require(success, TRANSFER_FAILED);
    }
}
