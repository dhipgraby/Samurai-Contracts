// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./FeeManagement.sol";
import "./StakingRewardManager.sol";  
import "./PoolTypes.sol";
import "./EscrowHandler.sol";
import "./AdminContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/// @title TokenStakingPlatform
/// @notice Manages user token staking and reward distribution.
/// @dev Utilizes FeeManagement for fee calculations and StakingRewardManager for reward distribution.
contract TokenStakingPlatform is PoolTypes {
    /// @notice Contract for fee calculations.
    FeeManagement public feeContract;
    
    /// @notice Contract for reward distribution.
    StakingRewardManager public rewardManager;

    /// @notice ERC20 token contract address.
    address public tokenContract;
    
    /// @notice Treasury address for fee collection.
    address payable public treasury;

    /// @notice AdminContract instance for role-based access control.
    AdminContract public _adminContract;
    
    /// @notice Contract for escrow functionalities.
    EscrowHandler private escrowHandler;

    string private constant INVALID_FEE = "Incorrect fee sent";
    string private constant NON_ZERO_STAKE = "Amount must be greater than zero";
    string private constant TREASURY_TRANSFER_FAIL = "Transfer to treasury failed";
    string private constant STAKING_PERIOD_NOT_ENDED = "Staking period not ended yet";
    string private constant UNAUTHORIZED_ACCESS = "Unauthorized";
    string private constant STAKE_ALREADY_CLAIMED = "Stake already claimed";
    string private constant NOT_ADMIN_ERROR = "Caller is not an admin";
    
    /// @dev Counter for unique stake IDs.
    uint256 private stakeIdCounter = 0;

    /// @dev Struct for user stake data.
    struct StakeInfo {
        uint256 id;
        address user;
        uint256 amount;
        PoolType pool;
        uint256 endTime;
        uint256 reward;
        bool claimed;
    }

    /// @dev Mapping from stake ID to StakeInfo.
    mapping(uint256 => StakeInfo) private stakeData;

    /// @notice Event emitted when a user stakes tokens.
    event TokenStaked(
        address indexed user,
        uint256 amount,
        PoolType indexed pool,
        uint256 stakeId
    );

    /// @notice Event emitted when the token contract is updated.
    event TokenContractUpdated(address indexed newTokenContract);

    /// @notice Event emitted when the fee management and treasury are updated.
    event FeeManagementAndTreasuryUpdated(address indexed newFeeContract, address indexed newTreasury);

     /// @dev Modifier to restrict function access to admin roles only.
     modifier onlyAdmin() {
        require(_adminContract.hasRole(_adminContract.ADMIN_ROLE(), msg.sender),
            NOT_ADMIN_ERROR
        );
        _;
    }

    constructor(
        address _tokenContract,
        address _feeContract,
        address _rewardManager,
        address payable _escrowHandler,
        address payable _treasury
    ) {
        tokenContract = _tokenContract;
        feeContract = FeeManagement(_feeContract);
        rewardManager = StakingRewardManager(_rewardManager);
        escrowHandler = EscrowHandler(_escrowHandler);
        treasury = _treasury;
    }

    /// @notice Initiates a token stake.
    /// @param user The staker's address.
    /// @param amount The amount to stake.
    /// @param poolType The type of staking pool.
    /// @param duration The staking duration in seconds.
    function initiateStake(
        address user,
        uint256 amount,
        uint256 poolType,
        uint256 duration
    ) external payable {
        uint256 fee = feeContract.fetchCurrentFee();
        require(msg.value == fee, INVALID_FEE);
        require(amount > 0, NON_ZERO_STAKE);

        PoolType pool = PoolType(poolType);
        uint256 newStakeId = stakeIdCounter++;

        _executeStake(user, amount, pool, duration, fee, newStakeId);
    }

    /// @dev Internal function to handle staking logic.
    function _executeStake(
        address user,
        uint256 amount,
        PoolType pool,
        uint256 duration,
        uint256 fee,
        uint256 stakeId
    ) internal {
        uint256 endTime = block.timestamp + duration;
        uint256 reward = rewardManager.computeStakingReward(amount, pool);

        StakeInfo memory newStake = StakeInfo({
            id: stakeId,
            user: user,
            amount: amount,
            pool: pool,
            endTime: endTime,
            reward: reward,
            claimed: false
        });

        stakeData[stakeId] = newStake;

        (bool success, ) = payable(treasury).call{value: fee}("");
        require(success, TREASURY_TRANSFER_FAIL);

        escrowHandler.handleUserDeposit(user, stakeId, amount, reward, tokenContract);
        emit TokenStaked(user, amount, pool, stakeId);
    }

    /// @notice Allows a user to claim their staked tokens and rewards.
    /// @dev The function checks if the staking period has ended and if the stake has not been claimed yet.
    /// @param stakeId The unique identifier for the user's stake.
    function claimStakeAndReward(uint256 stakeId) external payable {
        uint256 fee = feeContract.fetchCurrentFee();
        require(msg.value == fee, INVALID_FEE);
        StakeInfo storage s = stakeData[stakeId];
        require(s.user == msg.sender, UNAUTHORIZED_ACCESS);
        require(!s.claimed, STAKE_ALREADY_CLAIMED);
        require(s.endTime <= block.timestamp, STAKING_PERIOD_NOT_ENDED);

        uint256 claimAmount = s.amount;
        s.amount = 0;
        s.reward = 0;
        s.claimed = true;

        (bool success, ) = payable(treasury).call{value: fee}("");
        require(success, TREASURY_TRANSFER_FAIL);

        escrowHandler.handleUserWithdraw(msg.sender, stakeId, claimAmount, tokenContract);
    }

    /// @notice Allows a user to claim multiple stakes and rewards in a single transaction.
    /// @dev The function checks if the staking periods have ended and if the stakes have not been claimed yet.
    /// @param stakeIds An array of unique identifiers for the user's stakes.
    function batchClaimStakesAndRewards(uint256[] calldata stakeIds) external payable {
        uint256 fee = feeContract.fetchCurrentFee();
        require(msg.value == fee * stakeIds.length, INVALID_FEE);

        (bool success, ) = payable(treasury).call{value: msg.value}("");
        require(success, TREASURY_TRANSFER_FAIL);

        for (uint256 i = 0; i < stakeIds.length; i++) {
            StakeInfo storage s = stakeData[stakeIds[i]];
            require(s.user == msg.sender, UNAUTHORIZED_ACCESS);
            require(!s.claimed, STAKE_ALREADY_CLAIMED);
            require(s.endTime <= block.timestamp, STAKING_PERIOD_NOT_ENDED);

            uint256 claimAmount = s.amount;
            s.amount = 0;
            s.reward = 0;
            s.claimed = true;

            escrowHandler.handleUserWithdraw(msg.sender, stakeIds[i], claimAmount, tokenContract);
        }
    }

    /// @notice Function used to fetch the stakeData.
    /// @param stakeId the stakeId to query.
    function getStakeData(uint256 stakeId) external view returns (StakeInfo memory) {
        return stakeData[stakeId];
    }

    /// @notice Updates the token contract address.
    /// @dev Can only be called by the admin.
    /// @param _newTokenContract The new token contract address.
    function updateTokenContract(address _newTokenContract) external onlyAdmin {
        tokenContract = _newTokenContract;
        emit TokenContractUpdated(_newTokenContract);
    }

    /// @notice Updates the fee management contract and treasury address.
    /// @dev Can only be called by the contract admin.
    /// @param _newFeeContract The new fee management contract address.
    /// @param _newTreasury The new treasury address.
    function updateFeeManagementAndTreasury(address _newFeeContract, address payable _newTreasury) external onlyAdmin {
        feeContract = FeeManagement(_newFeeContract);
        treasury = _newTreasury;
        emit FeeManagementAndTreasuryUpdated(_newFeeContract, _newTreasury);
    }
}