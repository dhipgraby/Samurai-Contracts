// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./FeeContract.sol";
import "./ConcreteRewardDistribution.sol";
import "./PoolTypes.sol";

contract StakingPlatform is PoolTypes {
    
    FeeContract public feeContract;
    ConcreteRewardDistribution public rewardDistribution;
    address public treasuryAddress;

    struct UserStake {
        address user;
        uint256 amount;
        PoolType poolType;
        uint256 endTimestamp;
        uint256 reward;
    }
    
    mapping(uint256 => UserStake) public userStakes;
    uint256 private stakeIdCounter = 0;

    constructor(address _feeContract, address _rewardDistribution, address _treasuryAddress) {
        feeContract = FeeContract(_feeContract);
        rewardDistribution = ConcreteRewardDistribution(_rewardDistribution);
        treasuryAddress = _treasuryAddress;
    }

    function stakeTokens(address _user, uint256 _amount, uint256 _poolUintType, uint256 _duration) public payable {
        uint256 _feeAmount = feeContract.getFee();
        require(msg.value == _feeAmount, "Incorrect fee sent");
        require(_amount > 0, "Amount must be greater than zero");
        
        PoolType _poolType = PoolType(_poolUintType);

        _stakeTokens(_user, _amount, _poolType, _duration, _feeAmount);
    }

    function _stakeTokens(address _user, uint256 _amount, PoolType _poolType, uint256 _duration, uint256 _feeAmount) internal {
        uint256 endTimestamp = block.timestamp + _duration;
        uint256 reward = rewardDistribution.calculateRewards(_amount, _poolType);

        UserStake memory newUserStake = UserStake({
            user: _user,
            amount: _amount,
            poolType: _poolType,
            endTimestamp: endTimestamp,
            reward: reward
        });
        
        uint256 newStakeId = stakeIdCounter++;
        userStakes[newStakeId] = newUserStake;

        payable(treasuryAddress).transfer(_feeAmount);

        // Additional logic for transferring staked tokens could go here
    }
}
