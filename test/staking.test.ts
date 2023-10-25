import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther } from 'ethers';


describe("Samurai Staking Platform", function () {

  const initialRewardBalance = parseEther("1000000000");

  const advanceTime = async (seconds: number) => {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  };

  async function setupEscrow(admin: any, escrow: any, _stakingPlatform: any, _yen: any) {
    await escrow.connect(admin).updateStakingPlatform(_stakingPlatform.target);
    //await _yen.connect(admin).mint(admin.address, initialRewardBalance);
    await _yen.connect(admin).increaseAllowance(escrow.target, initialRewardBalance);
    await escrow.connect(admin).replenishRewards(initialRewardBalance, _yen.target);
  }

  const userStake = async ( admin: any, amount: string, user: any, yen: any, escrow: any, feeContract: any, staking: any) => {
    // Mint some tokens for the user
    const initialUserBalance = parseEther(amount);
    await yen.connect(admin).transfer(user.address, initialUserBalance);

    // Approve the escrow contract to spend tokens
    await yen.connect(user).approve(escrow.target, initialUserBalance);

    // Get the fee amount from the FeeContract
    const feeAmount = await feeContract.fetchCurrentFee();

    // Stake tokens using OneDayStakingContract
    const amountToStake = parseEther(amount);
    const tx = await staking.connect(user).stake(amountToStake, { value: feeAmount });
    return tx;
  };

  async function deployStakingFixture() {
    const [admin, user1, user2] = await ethers.getSigners();

    const AdminContract = await ethers.getContractFactory("AdminContract");
    const adminContract = await AdminContract.deploy();

    const Contract1 = await ethers.getContractFactory("YenToken");
    const yen = await Contract1.deploy();

    const Contract2 = await ethers.getContractFactory("YenToken");
    const yen2 = await Contract2.deploy();

    
    // FeeManagement takes the FeeTreasury as a parameter.
    const FeeContract = await ethers.getContractFactory("FeeManagement");
    const feeContract = await FeeContract.deploy(adminContract.target);
    
    // Fee treasury is deployed.
    const FeeTreasury = await ethers.getContractFactory("FeeTreasury");
    const feeTreasury = await FeeTreasury.deploy(adminContract.target);

    // EscrowHandler is deployed.
    const Escrow = await ethers.getContractFactory("EscrowHandler");
    const escrow = await Escrow.deploy(adminContract.target);

    // StakingRewardManager is deployed to manage the RewardDistribution.
    const ConcreteRewardDistribution = await ethers.getContractFactory("StakingRewardManager");
    const rewardDistribution = await ConcreteRewardDistribution.deploy(adminContract.target);

    // TokenStakingPlatform is the main contract.
    const StakingPlatform = await ethers.getContractFactory("TokenStakingPlatform");
    const stakingPlatform = await StakingPlatform.deploy(
      yen.target,
      feeContract.target,
      rewardDistribution.target,
      escrow.target,
      feeTreasury.target
    );

    // OneDayStakingContract is a one-day staking pool.
    const OneDayStakingContract = await ethers.getContractFactory("OneDayStakingContract");
    const oneDayStaking = await OneDayStakingContract.deploy(adminContract.target, stakingPlatform.target, feeContract.target);
    
    // OneWeekStakingContract is a one-week staking pool.
    const OneWeekStakingContract = await ethers.getContractFactory("OneWeekStakingContract");
    const oneWeekStaking = await OneWeekStakingContract.deploy(adminContract.target, stakingPlatform.target, feeContract.target);
    
    // OneMonthStakingContract is a one-month staking pool.
    const OneMonthStakingContract = await ethers.getContractFactory("OneMonthStakingContract");
    const oneMonthStaking = await OneMonthStakingContract.deploy(adminContract.target, stakingPlatform.target, feeContract.target);
    
    // OneYearStakingContract is a one-year staking pool.
    const OneYearStakingContract = await ethers.getContractFactory("OneYearStakingContract");
    const oneYearStaking = await OneYearStakingContract.deploy(adminContract.target, stakingPlatform.target, feeContract.target);
    
    // SixMonthStakingContract is a six-month staking pool.
    const SixMonthStakingContract = await ethers.getContractFactory("SixMonthStakingContract");
    const sixMonthStaking = await SixMonthStakingContract.deploy(adminContract.target, stakingPlatform.target, feeContract.target);
    
   
    await setupEscrow(admin, escrow, stakingPlatform, yen);

    return {
      admin,
      user1,
      user2,
      feeTreasury,
      rewardDistribution,
      stakingPlatform,
      oneDayStaking,
      escrow,
      feeContract,
      yen,
      yen2,
      adminContract,
      oneWeekStaking,
      oneMonthStaking,
      oneYearStaking,
      sixMonthStaking,
    };

  };

  describe("Deployment", function () {

    it("Should deploy all the contracts in the staking protocol", async function () {
      const { admin,
        user1,
        user2,
        feeTreasury,
        rewardDistribution,
        stakingPlatform,
        oneDayStaking,
        escrow,
        feeContract,
        yen,
        adminContract,
        oneWeekStaking,
        oneMonthStaking,
        oneYearStaking,
        sixMonthStaking } = await loadFixture(deployStakingFixture);

      expect(stakingPlatform.target).to.be.a('string');
      expect(escrow.target).to.be.a('string');
      expect(feeTreasury.target).to.be.a('string');
      expect(rewardDistribution.target).to.be.a('string');
      expect(oneDayStaking.target).to.be.a('string');
      expect(feeContract.target).to.be.a('string');
      expect(yen.target).to.be.a('string');
      expect(adminContract.target).to.be.a('string');
      expect(admin.address).to.be.a('string');
      expect(user1.address).to.be.a('string');
      expect(user2.address).to.be.a('string');
      expect(oneDayStaking.target).to.be.a('string');
      expect(oneWeekStaking.target).to.be.a('string');
      expect(oneMonthStaking.target).to.be.a('string');
      expect(oneYearStaking.target).to.be.a('string');
      expect(sixMonthStaking.target).to.be.a('string');
    });

    it("Should setup the escrow contract", async function () {
      const { escrow } = await loadFixture(deployStakingFixture);
      const rewardBalance = await escrow.getRewardBalance();
      expect(rewardBalance).to.equal(initialRewardBalance);
    })

  });

  describe("User Staking", function () {

    it("Should allow a user to stake tokens", async function () {
      const {admin, user1, oneDayStaking, yen, stakingPlatform, escrow, feeContract } = await loadFixture(deployStakingFixture);

      // Mint some tokens for the user
      const initialUserBalance = parseEther("1000");
      await yen.connect(admin).transfer(user1.address, initialUserBalance);

      // Approve the escrow contract to spend tokens
      await yen.connect(user1).approve(escrow.target, initialUserBalance);

      // Get the fee amount from the FeeContract
      const feeAmount = await feeContract.fetchCurrentFee();

      // Stake tokens using OneDayStakingContract
      const amountToStake = parseEther("100");
      await oneDayStaking.connect(user1).stake(amountToStake, { value: feeAmount });

      // Retrieve the stake information from SamuraiStakingPlatform
      const stakeInfo = await stakingPlatform.getStakeData(0); // Assuming 0 is the stakeId for this test

      // Validate the stake information
      expect(stakeInfo.user).to.equal(user1.address);
      expect(stakeInfo.amount).to.equal(amountToStake);
      expect(stakeInfo.pool).to.equal(0); // 0 is the poolType for one-day staking
    });

    it("Should not allow a user to stake zero tokens", async function () {
      const { user1, oneDayStaking, feeContract } = await loadFixture(deployStakingFixture);

      // Get the fee amount from the FeeContract
      const feeAmount = await feeContract.fetchCurrentFee();

      // Try to stake zero tokens
      await expect(oneDayStaking.connect(user1).stake(0, { value: feeAmount })).to.be.revertedWith("Amount must be greater than zero");
    });

    it("Should store the correct users staked amount in the escrow", async function () {
      const { admin, user1, user2, oneDayStaking, feeContract, yen, escrow } = await loadFixture(deployStakingFixture);
      await userStake(admin, "1000", user1, yen, escrow, feeContract, oneDayStaking);
      await userStake(admin, "100", user2, yen, escrow, feeContract, oneDayStaking);
      const stake1 = await escrow.userStakeBalances(user1, 0);
      const stake2 = await escrow.userStakeBalances(user2, 1);
      expect(Number(stake1) / 1e18).to.equal(1000);
      expect(Number(stake2) / 1e18).to.equal(100);
    })

    it("Should store the correct userStake information in the staking platform", async function () {
      const {admin,  user1, user2, oneDayStaking, feeContract, yen, escrow, stakingPlatform } = await loadFixture(deployStakingFixture);
      await userStake(admin, "1000", user1, yen, escrow, feeContract, oneDayStaking);
      await userStake(admin, "2000", user2, yen, escrow, feeContract, oneDayStaking);
      const stake1 = await stakingPlatform.getStakeData(0);
      const stake2 = await stakingPlatform.getStakeData(1);

      let reward1 = (Number(stake1.amount) * 5 / 100);
      let reward2 = (Number(stake2.amount) * 5 / 100);

      // Validate the stake information
      expect(stake1.id).to.equal(0);
      expect(stake1.user).to.equal(user1.address);
      expect(stake1.amount).to.equal(parseEther("1000"));
      expect(stake1.pool).to.equal(0); // 0 is the poolType for one-day staking
      expect(Number(stake1.reward) / 1e18).to.equal(reward1 / 1e18);
      expect(stake1.claimed).to.equal(false);

      expect(stake2.id).to.equal(1);
      expect(stake2.user).to.equal(user2.address);
      expect(stake2.amount).to.equal(parseEther("2000"));
      expect(stake2.pool).to.equal(0); // 0 is the poolType for one-day staking
      expect(Number(stake2.reward) / 1e18).to.equal(reward2 / 1e18);
      expect(stake2.claimed).to.equal(false);
    });

  });
  describe("Reward Calculation", function () {

    it("Should correctly calculate the reward based on the staked amount", async function () {
      const { admin,user1, stakingPlatform, yen, escrow, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);
      await userStake(admin,"1000", user1, yen, escrow, feeContract, oneDayStaking);
      const stakeInfo = await stakingPlatform.getStakeData(0);
      const expectedReward = Number(stakeInfo.amount) * 5 / 100;
      expect(Number(stakeInfo.reward)).to.equal(expectedReward);
    });

  });

  describe("User Claiming", function () {

    it("Should allow a user to claimStakeAndReward a stake", async function () {
      const {admin, user1, stakingPlatform, yen, escrow, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);
      await userStake(admin,"1000", user1, yen, escrow, feeContract, oneDayStaking);
      await advanceTime(86400);
      const feeAmount = await feeContract.fetchCurrentFee();
      await stakingPlatform.connect(user1).claimStakeAndReward(0, { value: feeAmount });
      const stakeInfo = await stakingPlatform.getStakeData(0);
      expect(stakeInfo.claimed).to.equal(true);
    });

    it("Should allow a user to batch claimStakeAndReward multiple stakes", async function () {
      const {admin, user1, stakingPlatform, yen, escrow, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);
      await userStake(admin, "1000", user1, yen, escrow, feeContract, oneDayStaking);
      await userStake(admin, "2000", user1, yen, escrow, feeContract, oneDayStaking);
      await advanceTime(86400);
      const feeAmount = await feeContract.fetchCurrentFee();
      await stakingPlatform.connect(user1).batchClaimStakesAndRewards([0, 1], { value: feeAmount + feeAmount }); // Assuming 0 and 1 are the stakeIds for this test
      const stakeInfo1 = await stakingPlatform.getStakeData(0);
      const stakeInfo2 = await stakingPlatform.getStakeData(1);
      expect(stakeInfo1.claimed).to.equal(true);
      expect(stakeInfo2.claimed).to.equal(true);
    });

  });
  describe("Admin Operations", function () {
    it("Should only allow admin to update the admin contract", async function () {
      const { user1, escrow, adminContract } = await loadFixture(deployStakingFixture);
      await expect(escrow.connect(user1).updateAdminContract(adminContract.target)).to.be.revertedWith("Caller is not an admin");
    });

    it("Should only allow admin to replenish rewards", async function () {
      const { user1, escrow, yen } = await loadFixture(deployStakingFixture);
      const amount = parseEther("1000");
      await expect(escrow.connect(user1).replenishRewards(amount, yen.target)).to.be.revertedWith("Caller is not an admin");
    });
  });

  describe("Revert Cases", function () {
    it("Should revert if unauthorized user tries to withdraw", async function () {
      const {admin, user1, user2, escrow, yen, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);
      await userStake(admin,"1000", user1, yen, escrow, feeContract, oneDayStaking);
      await expect(escrow.connect(user2).handleUserWithdraw(user1.address, 0, parseEther("100"), yen.target)).to.be.revertedWith('Caller is not the staking platform');
    });
  });

  describe("Event Emission", function () {
    it("Should emit UserDeposited event when a user deposits", async function () {
      const {admin, user1, escrow, yen, oneDayStaking, feeContract } = await loadFixture(deployStakingFixture);
      expect(await userStake(admin,"1000", user1, yen, escrow, feeContract, oneDayStaking))
        .to.emit(escrow, 'UserDeposited')
        .withArgs(user1.address, 0, parseEther("1000"));
    });

    it("Should emit UserWithdrawn event when a user withdraws", async function () {
      const {admin, user1, escrow, yen, oneDayStaking, feeContract, stakingPlatform } = await loadFixture(deployStakingFixture);
      await userStake(admin,"1050", user1, yen, escrow, feeContract, oneDayStaking);
      await advanceTime(86400);
      const feeAmount = await feeContract.fetchCurrentFee();
      expect(await stakingPlatform.connect(user1).claimStakeAndReward(0, { value: feeAmount }))
        .to.emit(escrow, 'UserWithdrawn')
        .withArgs(user1.address, 0, parseEther("1050"));
    });
  });

  describe("Claim and Reward Transfers", function () {

    it("Should transfer the staked amount back to the user upon claimStakeAndRewarding", async function () {
      const {admin, user1, stakingPlatform, yen, escrow, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);
      const initialBalance = await yen.balanceOf(user1.address);
      await userStake(admin,"1550", user1, yen, escrow, feeContract, oneDayStaking);
      const stakeInfo = await stakingPlatform.getStakeData(0);
      const rewardAmount = stakeInfo.reward;
      await advanceTime(86400);
      const feeAmount = await feeContract.fetchCurrentFee();
      await stakingPlatform.connect(user1).claimStakeAndReward(0, { value: feeAmount });
      const finalBalance = await yen.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(parseEther("1550") + (rewardAmount));
    });

    it("Should transfer the correct reward amount to the user upon claimStakeAndRewarding", async function () {
      const {admin, user1, stakingPlatform, yen, escrow, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);
      const initialBalance = await yen.balanceOf(user1.address);
      await userStake(admin,"2400", user1, yen, escrow, feeContract, oneDayStaking);
      const stakeInfo = await stakingPlatform.getStakeData(0);
      const rewardAmount = stakeInfo.reward;

      await advanceTime(86400);

      const feeAmount = await feeContract.fetchCurrentFee();

      await stakingPlatform.connect(user1).claimStakeAndReward(0, { value: feeAmount });

      const finalBalance = await yen.balanceOf(user1.address);

      expect(finalBalance - initialBalance).to.equal(parseEther("2400") + (rewardAmount));
    });

  });

  describe("Fee Treasury - withdrawFees", function () {
    it("should allow admin to withdraw fees", async function () {
      const { admin, feeTreasury } = await loadFixture(deployStakingFixture);
      await admin.sendTransaction({ to: feeTreasury.target, value: parseEther("1") });
      await feeTreasury.connect(admin).withdrawAccumulatedFees();
      expect(await ethers.provider.getBalance(feeTreasury.target)).to.equal(0);
    });

    it("should emit FeesWithdrawn event", async function () {
      const { admin, feeTreasury } = await loadFixture(deployStakingFixture);
      await admin.sendTransaction({ to: feeTreasury.target, value: parseEther("1") });
      expect(await feeTreasury.connect(admin).withdrawAccumulatedFees())
        .to.emit(feeTreasury, "FeesWithdrawn")
        .withArgs(admin.address, parseEther("1"));
    });

    it("should revert if not admin tries to withdraw", async function () {
      const { user1, feeTreasury } = await loadFixture(deployStakingFixture);
      await expect(feeTreasury.connect(user1).withdrawAccumulatedFees()).to.be.revertedWith("Caller is not an admin");
    });

    it("should revert if no fees to withdraw", async function () {
      const { admin, feeTreasury } = await loadFixture(deployStakingFixture);
      await expect(feeTreasury.connect(admin).withdrawAccumulatedFees()).to.be.revertedWith("No fees to withdraw");
    });
  });

  describe("Fee Treasury - recoverStuckTokens", function () {
    it("should allow admin to recover stuck tokens", async function () {
      const { yen, admin, feeTreasury } = await loadFixture(deployStakingFixture);
      await yen.transfer(feeTreasury.target, 100);
      await feeTreasury.connect(admin).recoverStuckERC20Tokens(yen.target);
      expect(await yen.balanceOf(feeTreasury.target)).to.equal(0);
    });

    it("should emit TokensRecovered event", async function () {
      const { yen, admin, feeTreasury } = await loadFixture(deployStakingFixture);
      await yen.transfer(feeTreasury.target, 100);
      expect(await feeTreasury.connect(admin).recoverStuckERC20Tokens(yen.target))
        .to.emit(feeTreasury, "TokensRecovered")
        .withArgs(admin.address, yen.target, 100);
    });

    it("should revert if not admin tries to recover tokens", async function () {
      const { yen, user1, feeTreasury } = await loadFixture(deployStakingFixture);
      await expect(feeTreasury.connect(user1).recoverStuckERC20Tokens(yen.target)).to.be.revertedWith("Caller is not an admin");
    });
  });

  describe("EscrowHandler - recoverStuckTokens", function () {
    it("should allow admin to recover stuck tokens", async function () {
      const { yen, admin, escrow } = await loadFixture(deployStakingFixture);
      await yen.transfer(escrow.target, 100);
      await escrow.connect(admin).recoverStuckERC20Tokens(yen.target);
      expect(await yen.balanceOf(escrow.target)).to.equal(0);
    });

    it("should emit TokensRecovered event", async function () {
      const { yen, admin, escrow } = await loadFixture(deployStakingFixture);
      await yen.transfer(escrow.target, 100);
      expect(await escrow.connect(admin).recoverStuckERC20Tokens(yen.target))
        .to.emit(escrow, "TokensRecovered")
        .withArgs(admin.address, yen.target, 100);
    });

    it("should revert if not admin tries to recover tokens", async function () {
      const { yen, user1, escrow } = await loadFixture(deployStakingFixture);
      await expect(escrow.connect(user1).recoverStuckERC20Tokens(yen.target)).to.be.revertedWith("Caller is not an admin");
    });
  });

  describe("EscrowHandler - withdrawFees", function () {
    it("should allow admin to withdraw fees", async function () {
      const { admin, escrow } = await loadFixture(deployStakingFixture);
      await admin.sendTransaction({ to: escrow.target, value: parseEther("1") });
      await escrow.connect(admin).withdraw();
      expect(await ethers.provider.getBalance(escrow.target)).to.equal(0);
    });
    it("should revert if not admin tries to withdraw", async function () {
      const { user1, escrow } = await loadFixture(deployStakingFixture);
      await expect(escrow.connect(user1).withdraw()).to.be.revertedWith("Caller is not an admin");
    });

    it("should revert if no fees to withdraw", async function () {
      const { admin, escrow } = await loadFixture(deployStakingFixture);
      await expect(escrow.connect(admin).withdraw()).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("FeeManagement - update", function () {
    const newFeeAmount = parseEther('0.001');
    it("should allow admin to update fees", async function () {
      const { admin, feeContract } = await loadFixture(deployStakingFixture);
      await feeContract.connect(admin).updateFeeAmount(newFeeAmount);
      expect(await feeContract.connect(admin).fetchCurrentFee()).to.equal(newFeeAmount);
    });
    it("should allow admin to update adminContract", async function () {
      const { admin, feeContract } = await loadFixture(deployStakingFixture);
      await feeContract.connect(admin).updateAdminAccessControl(admin.address);
      expect(await feeContract._adminContract()).to.be.equal(admin.address);
    });
    it("should allow admin to update escrow adminContract", async function () {
      const { admin, escrow } = await loadFixture(deployStakingFixture);
      await escrow.connect(admin).updateAdminContract(admin.address);
      expect(await escrow._adminContract()).to.be.equal(admin.address);
    });
    it("should allow admin to update adminContract", async function () {
      const { admin, oneDayStaking } = await loadFixture(deployStakingFixture);
      await oneDayStaking.connect(admin).updateAdminContract(admin.address);
      expect(await oneDayStaking.adminContract()).to.be.equal(admin.address);
    });
    it("should allow admin to update staking platform", async function () {
      const { admin, oneDayStaking } = await loadFixture(deployStakingFixture);
      const [ newStakingPlatform ] = await ethers.getSigners();
      await oneDayStaking.connect(admin).updateStakingPlatform(newStakingPlatform.address);
      expect(await oneDayStaking.stakingPlatform()).to.be.equal(newStakingPlatform.address);
    });
    it("should allow admin to update adminContract", async function () {
      const { admin, feeTreasury } = await loadFixture(deployStakingFixture);
      await feeTreasury.connect(admin).updateAdminAccessControl(admin.address);
      expect(await feeTreasury._adminContract()).to.be.equal(admin.address);
    });
    it("should revert if not admin update adminContract", async function () {
      const { admin, user1, feeContract } = await loadFixture(deployStakingFixture);
      await expect(feeContract.connect(user1).updateAdminAccessControl(admin.address)).to.be.revertedWith("Caller is not an operator");
    });
  });

  describe("StakingRewardManager - update reward rate ", function () {
 
    it("should allow operator to set reward rate", async function () {
      const { admin, rewardDistribution } = await loadFixture(deployStakingFixture);
      await rewardDistribution.connect(admin).setRewardRate(0, 10); // Assuming 0 corresponds to PoolType.OneDay
      expect(await rewardDistribution.poolRewardRates(0)).to.equal(10);
    });
    it("should allow operator to set reward rate", async function () {
      const { admin, rewardDistribution } = await loadFixture(deployStakingFixture);
      await rewardDistribution.connect(admin).setAdminContract(admin.address); // Assuming 0 corresponds to PoolType.OneDay
      expect(await rewardDistribution._adminContract()).to.be.equal(admin.address);
    });
    it("should emit RewardRateUpdated event", async function () {
      const { admin, rewardDistribution } = await loadFixture(deployStakingFixture);
      expect(await rewardDistribution.connect(admin).setRewardRate(0, 10))
        .to.emit(rewardDistribution, "RewardRateUpdated")
        .withArgs(0, 10);
    });

    it("should revert if non-operator tries to set reward rate", async function () {
      const { user1, rewardDistribution } = await loadFixture(deployStakingFixture);
      await expect(rewardDistribution.connect(user1).setRewardRate(0, 10)).to.be.revertedWith("Caller is not an operator");
    });
  });
  describe("Multiple Staking pools - user staking ", function () {
 
    it("should allow user to stake in multiple pools", async function () {
      const {admin, user1, stakingPlatform, oneDayStaking, oneWeekStaking, oneMonthStaking, yen, escrow, feeContract } = await loadFixture(deployStakingFixture);
      const _amount = "2000";
      const _amount1 = "1000";
      const _amount2 = "500";

      await userStake(admin,_amount, user1, yen, escrow, feeContract, oneDayStaking);
      await userStake(admin,_amount1, user1, yen, escrow, feeContract, oneWeekStaking);
      await userStake(admin,_amount2, user1, yen, escrow, feeContract, oneMonthStaking);

      expect((await stakingPlatform.getUserStakeIds(user1.address)).length).to.be.equal(3);

    });
    it("should allow users to stake in multiple pools at the same time", async function () {
      const {admin, user1, user2, stakingPlatform, oneDayStaking, oneWeekStaking, oneMonthStaking, yen, escrow, feeContract } = await loadFixture(deployStakingFixture);
      const _amount = "2000";
      const _amount1 = "1000";
      const _amount2 = "500";

      await userStake(admin, _amount, user1, yen, escrow, feeContract, oneDayStaking);
      await userStake(admin, _amount1, user2, yen, escrow, feeContract, oneWeekStaking);
      await userStake(admin, _amount2, user1, yen, escrow, feeContract, oneMonthStaking);

      expect((await stakingPlatform.getUserStakeIds(user1.address)).length).to.be.equal(2);
    });
    
  });
  describe("Mapping Features", function () {
    it("Should correctly map user to their stakes", async function () {
      const {admin, user1, user2, stakingPlatform, yen, escrow, feeContract, oneWeekStaking } = await loadFixture(deployStakingFixture);
      await userStake(admin, "3000", user1, yen, escrow, feeContract, oneWeekStaking);
      await userStake(admin, "2000", user2, yen, escrow, feeContract, oneWeekStaking);
  
      const user1Stakes = await stakingPlatform.getUserStakeIdsInPool(user1.address, 1);
      const user2Stakes = await stakingPlatform.getUserStakeIdsInPool(user2.address, 1);
      
      expect(user1Stakes.length).to.equal(1);
      expect(user2Stakes.length).to.equal(1);
      expect(user1Stakes[0]).to.equal(0); // Assuming 0 is the stakeId for user1
      expect(user2Stakes[0]).to.equal(1); // Assuming 1 is the stakeId for user2
    });
  
    it("Should update the mapping when a user un-stakes", async function () {
      const {admin,  user1, stakingPlatform, yen, escrow, feeContract, oneWeekStaking } = await loadFixture(deployStakingFixture);
      await userStake(admin, "3000", user1, yen, escrow, feeContract, oneWeekStaking);
      await advanceTime(86400*7);
      const feeAmount = await feeContract.fetchCurrentFee();
      await stakingPlatform.connect(user1).claimStakeAndReward(0, { value: feeAmount });
  
      const user1Stakes = await stakingPlatform.getUserStakeIdsInPool(user1.address, 0);
      expect(user1Stakes.length).to.equal(0);
    });
  });

});