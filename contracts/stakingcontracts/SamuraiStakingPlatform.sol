// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./FeeContract.sol";
import "./ConcreteRewardDistribution.sol";
import "./PoolTypes.sol";
import "./EscrowContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Samurai Staking Platform for Token Rewards.
/// @notice This contract allows users to stake tokens and earn rewards.
/// @dev The contract uses FeeContract for fee calculations and ConcreteRewardDistribution for reward calculations.
contract SamuraiStakingPlatform is PoolTypes {
    string private constant INCORRECT_FEE_AMOUNT = "Incorrect fee sent";
    string private constant NON_ZERO_AMOUNT = "Amount must be greater than zero";
    string private constant TRANSFER_TO_TREASURY_FAILED = "Transfer to treasury failed";

    /// @notice The contract address for fee calculations.
    FeeContract public feeContract;

    /// @notice The contract address for escrow.
    EscrowContract public escrowContract;

    /// @notice The contract address for token.
    IERC20 public tokenAddress;

    /// @notice The contract address for reward distribution.
    ConcreteRewardDistribution public rewardDistribution;

    /// @notice The treasury address where fees are sent.
    address public treasuryAddress;

    /// @dev Counter to generate unique stake IDs.
    uint256 private stakeIdCounter = 0;

    /// @dev Struct to hold user stake information.
    struct UserStake {
        uint256 stakeId; // The unique stake ID.
        address user; // The address of the staking user.
        uint256 amount; // The amount staked.
        PoolType poolType; // The type of staking pool.
        uint256 endTimestamp; // The timestamp when the stake ends.
        uint256 reward; // The tokens earned as reward for staking.
        bool isClaimed; 
    }

    /// @dev Mapping from stake ID to UserStake.
    mapping(uint256 => UserStake) public userStakes;

    // @dev Event emitted when a user staked.
    event Staked(
        address indexed user,
        uint256 amount,
        PoolType indexed poolType,
        uint256 stakeId
    );

    /// @param _tokenAddress The address of the ERC20 token to stake.
    /// @param _feeContract The address of the FeeContract.
    /// @param _rewardDistribution The address of the ConcreteRewardDistribution.
    /// @param _escrowContract The address of the escrow contract.
    /// @param _treasuryAddress The address of the treasury.
    constructor(
        address _tokenAddress,
        address _feeContract,
        address _rewardDistribution,
        address _escrowContract,
        address payable _treasuryAddress
    ) {
        tokenAddress = IERC20(_tokenAddress);
        feeContract = FeeContract(_feeContract);
        rewardDistribution = ConcreteRewardDistribution(_rewardDistribution);
        escrowContract = EscrowContract(_escrowContract);
        treasuryAddress = _treasuryAddress;
    }

    /// @notice Function should be triggered by the individual staking pools.
    /// @param _user The address of the user.
    /// @param _amount The amount to stake.
    /// @param _poolUintType The type of staking pool as uint.
    /// @param _duration The duration of the stake in seconds.
    function stakeTokens(
        address _user,
        uint256 _amount,
        uint256 _poolUintType,
        uint256 _duration
    ) external payable {
        uint256 _feeAmount = feeContract.getFee();
        require(msg.value == _feeAmount, INCORRECT_FEE_AMOUNT);
        require(_amount > 0, NON_ZERO_AMOUNT);

        PoolType _poolType = PoolType(_poolUintType);

        // Generate a new stakeId for this stake.
        uint256 newStakeId = stakeIdCounter++;

        _stakeTokens(
            _user,
            _amount,
            _poolType,
            _duration,
            _feeAmount,
            newStakeId
        );
    }

    /// @dev Internal function to execute the staking logic
    /// @param _user The address of the user
    /// @param _amount The amount to stake
    /// @param _poolType The type of staking pool
    /// @param _duration The duration of the stake in seconds
    /// @param _feeAmount The fee amount for staking
    /// @param _stakeId The unique stake ID.
    function _stakeTokens(
        address _user,
        uint256 _amount,
        PoolType _poolType,
        uint256 _duration,
        uint256 _feeAmount,
        uint256 _stakeId
    ) internal {
        uint256 _endTimestamp = block.timestamp + _duration;
        uint256 _reward = rewardDistribution.calculateRewards(
            _amount,
            _poolType
        );

        UserStake memory newUserStake = UserStake({
            stakeId: _stakeId,
            user: _user,
            amount: _amount,
            poolType: _poolType,
            endTimestamp: _endTimestamp,
            reward: _reward,
            isClaimed: false
        });

        userStakes[_stakeId] = newUserStake;

        (bool success, ) = payable(treasuryAddress).call{value: _feeAmount}("");
        require(success, TRANSFER_TO_TREASURY_FAILED);

        escrowContract.userDeposit(
            _user,
            _stakeId,
            _amount,
            _reward,
            address(tokenAddress)
        );
        emit Staked(_user, _amount, _poolType, _stakeId);
    }

    function claim(uint256 stakeId) external {
        UserStake storage userStake = userStakes[stakeId];
        require(userStake.endTimestamp <= block.timestamp, "Staking period not ended yet");
        require(userStake.user == msg.sender, "Unauthorized");
        require(!userStake.isClaimed, "Stake already claimed");
    
        uint256 amountToClaim = userStake.amount;
        userStake.amount = 0;
        userStake.reward = 0;
        userStake.isClaimed = true;
        escrowContract.userWithdraw(msg.sender, stakeId, amountToClaim, address(tokenAddress));
    }
    
    function batchClaim(uint256[] calldata stakeIds) external {
        for (uint256 i = 0; i < stakeIds.length; i++) {
            UserStake storage userStake = userStakes[stakeIds[i]];
            require(userStake.endTimestamp <= block.timestamp, "Staking period not ended yet for some stakes");
            require(userStake.user == msg.sender, "Unauthorized for some stakes");
            require(!userStake.isClaimed, "Stake already claimed");
    
            uint256 amountToClaim = userStake.amount;
            userStake.amount = 0;
            userStake.reward = 0;
            userStake.isClaimed = true;
            escrowContract.userWithdraw(msg.sender, stakeIds[i], amountToClaim, address(tokenAddress));
        }
    }
}