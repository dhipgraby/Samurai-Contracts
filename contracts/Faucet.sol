// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./YenToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./stakingcontracts/FeeContract.sol";
import "./stakingcontracts/FeeTreasury.sol";

/// @title Faucet for YenToken
/// @notice This contract allows users to request tokens from a faucet with a cooldown period.
/// @dev The contract uses YenToken as its ERC20 token.
contract Faucet is Ownable {
    /// @notice The YenToken contract.
    YenToken public yenToken;
    FeeContract public feeContract;

    /// @notice Records the last time a user accessed the faucet.
    mapping(address => uint256) public lastAccessTime;

    /// @notice The cooldown time between requests in seconds.
    uint256 public cooldownTime = 1 days;

    /// @notice The maximum amount a user can request at once.
    uint256 public maxAmount = 1000 * 10 ** 18; // 1000 YENTOKENs with 18 decimals

    /// @notice Total tokens claimed from the faucet
    uint256 public totalClaimed = 0;

    /// @notice Remaining tokens that can be requested
    uint256 public remainingTokens;

    /// @notice Emitted when a user requests tokens from the faucet.
    /// @param user The user that claimed from faucet
    /// @param amount The amount of tokens requested
    event TokensRequested(address indexed user, uint256 amount);

    /// @notice Emitted when the maximum amount of tokens that can be requested is updated.
    /// @param newMaxAmount The new maximum amount
    event UpdatedMaxAmount(uint256 newMaxAmount);

    /// @dev Modifier to check if a user can request tokens based on cooldown time.
    modifier canRequestTokens() {
        require(
            block.timestamp >= lastAccessTime[msg.sender] + cooldownTime,
            "Cooldown not over"
        );
        _;
    }

    /// @notice Fallback function to receive Ether.
    /// @dev This function is triggered when Ether is sent to the contract.
    receive() external payable {}

    /// @notice Initializes the contract with the YenToken address.
    /// @param _yenToken The address of the YenToken contract.
    constructor(address _yenToken, address _feeContract, address _feeTreasury) {
        yenToken = YenToken(_yenToken);
        feeContract = FeeContract(_feeContract);
        feeTreasury = FeeTreasury(_feeTreasury);
        remainingTokens = yenToken.balanceOf(address(this));
    }

    /// @notice Request tokens from faucet.
    function requestTokens() external payable canRequestTokens {
        uint256 feeAmount = feeContract.getFee();
        require(msg.value == feeAmount, "incorrect fee!");
        uint256 _maxAmount = maxAmount;
        require(remainingTokens >= _maxAmount, "Not enough tokens in faucet");

        lastAccessTime[msg.sender] = block.timestamp;
        require(yenToken.transfer(msg.sender, _maxAmount), "Transfer failed");

        totalClaimed += _maxAmount;
        remainingTokens -= _maxAmount;
        (bool success, ) = feeTreasury.call{value: msg.value}("");
        require(success, "Transfer failed.");

        emit TokensRequested(msg.sender, _maxAmount);
    }

    /// @notice Deposit tokens to the contract.
    /// @param amount The amount of tokens to deposit
    function depositTokens(uint256 amount) external onlyOwner {
        require(
            yenToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        remainingTokens += amount;
    }

    /// @notice Update the cooldown time.
    /// @dev This function should only be accessible by the contract owner.
    /// @param newCooldownTime The new cooldown time in seconds.
    function updateCooldownTime(uint256 newCooldownTime) external onlyOwner {
        cooldownTime = newCooldownTime;
    }

    /// @notice Update the maximum amount that can be requested.
    /// @dev This function should only be accessible by the contract owner.
    /// @param newMaxAmount The new maximum amount in tokens.
    function updateMaxAmount(uint256 newMaxAmount) external onlyOwner {
        maxAmount = newMaxAmount;
        emit UpdatedMaxAmount(newMaxAmount);
    }

    /// @notice Allows the contract owner to withdraw stuck ERC20 tokens.
    /// @dev This function should only be accessible by the contract owner.
    /// @param tokenAddress The address of the ERC20 token to withdraw.
    /// @param to The address to send the tokens to.
    function withdrawStuckTokens(
        address tokenAddress,
        address to
    ) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 amount = token.balanceOf(address(this));
        require(token.transfer(to, amount), "Token transfer failed");
    }

    /// @notice Allows the contract owner to withdraw stuck Ether from the contract.
    /// @dev This function should only be accessible by the contract owner.
    /// @param to The address to send Ether to.
    function withdrawStuckEther(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = to.call{value: balance}("");
        require(success, "Transfer failed.");
    }
}
