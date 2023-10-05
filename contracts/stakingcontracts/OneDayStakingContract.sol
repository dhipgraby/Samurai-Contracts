// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SamuraiStakingPlatform.sol";
import "../YenToken.sol";
import "./FeeContract.sol";

contract OneDayStakingContract is Ownable {
    string private constant INCORRECT_FEE_AMOUNT = "Incorrect fee sent";
    SamuraiStakingPlatform public stakingPlatform;
    
    /// @notice The contract address for fee calculations.
    FeeContract public feeContract;
    
    constructor(address _stakingPlatform, address _feeContract) {
        stakingPlatform = SamuraiStakingPlatform(_stakingPlatform);
        feeContract = FeeContract(_feeContract);
    }
    
    function stake(uint256 amount) external payable {
        uint256 _feeAmount = feeContract.getFee();
        require(msg.value == _feeAmount, INCORRECT_FEE_AMOUNT);
        require(amount > 0, "Amount must be greater than zero");

        // Define pool type and end timestamp for one-day staking
        uint256 poolType = 0;
        uint256 duration = 1 days;

        // Call the stakeTokens function in the StakingPlatform
        stakingPlatform.stakeTokens{value: msg.value}(msg.sender, amount, poolType, duration);
    }


    function updateStakingPlatform(address newStakingPlatform) external onlyOwner {
        stakingPlatform = SamuraiStakingPlatform(newStakingPlatform);
    }

}