import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther } from 'ethers';
import { mine } from "@nomicfoundation/hardhat-network-helpers";


describe("Samurai Staking Platform", function () {

  const initialRewardBalance = parseEther("1000000000");

  const advanceTime = async (seconds: number) => {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  };

  async function setupEscrow(admin: any, escrow: any, _stakingPlatform: any, _yen: any) {
    await escrow.connect(admin).updateStakingPlatform(_stakingPlatform.target);
    await _yen.connect(admin).mint(admin.address, initialRewardBalance);
    await _yen.connect(admin).increaseAllowance(escrow.target, initialRewardBalance);
    await escrow.connect(admin).depositRewards(initialRewardBalance, _yen.target);
  }

  const mineBlocks = async (blocks: number) => {
    // instantly mine 1000 blocks
    await mine(blocks);
  }

  const userStake = async (amount: string, user: any, yen: any, escrow: any, feeContract: any, oneDayStaking: any) => {
    // Mint some tokens for the user
    const initialUserBalance = parseEther(amount);
    await yen.mint(user.address, initialUserBalance);

    // Approve the escrow contract to spend tokens
    await yen.connect(user).approve(escrow.target, initialUserBalance);

    // Get the fee amount from the FeeContract
    const feeAmount = await feeContract.getFee();

    // Stake tokens using OneDayStakingContract
    const amountToStake = parseEther(amount);
    const tx = await oneDayStaking.connect(user).stake(amountToStake, { value: feeAmount });
    return tx;
  };

  async function deployStakingFixture() {
    const [admin, user1, user2] = await ethers.getSigners();

    const AdminContract = await ethers.getContractFactory("AdminContract");
    const adminContract = await AdminContract.deploy();

    const Contract = await ethers.getContractFactory("YenToken");
    const yen = await Contract.deploy();

    // Fee treasury is deployed first.
    const FeeTreasury = await ethers.getContractFactory("FeeTreasury");
    const feeTreasury = await FeeTreasury.deploy(adminContract.target);

    // FeeContract takes the FeeTreasury as a parameter.
    const FeeContract = await ethers.getContractFactory("FeeContract");
    const feeContract = await FeeContract.deploy(feeTreasury.target, adminContract.target);

    // EscrowContract is deployed next.
    const Escrow = await ethers.getContractFactory("EscrowContract");
    const escrow = await Escrow.deploy(adminContract.target);

    // ConcreteRewardDistribution is deployed to manage the RewardDistribution.
    const ConcreteRewardDistribution = await ethers.getContractFactory("ConcreteRewardDistribution");
    const rewardDistribution = await ConcreteRewardDistribution.deploy(adminContract.target);

    // StakingPlatform is the main contract.
    const StakingPlatform = await ethers.getContractFactory("SamuraiStakingPlatform");
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
      adminContract
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
        adminContract } = await loadFixture(deployStakingFixture);

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
    });

    it("Should setup the escrow contract", async function () {
      const { escrow } = await loadFixture(deployStakingFixture);
      const rewardBalance = await escrow.getRewardBalance();
      expect(rewardBalance).to.equal(initialRewardBalance);
    })

  });

  describe("User Staking", function () {

    it("Should allow a user to stake tokens", async function () {
      const { user1, oneDayStaking, yen, stakingPlatform, escrow, feeContract } = await loadFixture(deployStakingFixture);

      // Mint some tokens for the user
      const initialUserBalance = parseEther("1000");
      await yen.mint(user1.address, initialUserBalance);

      // Approve the escrow contract to spend tokens
      await yen.connect(user1).approve(escrow.target, initialUserBalance);

      // Get the fee amount from the FeeContract
      const feeAmount = await feeContract.getFee();

      // Stake tokens using OneDayStakingContract
      const amountToStake = parseEther("100");
      await oneDayStaking.connect(user1).stake(amountToStake, { value: feeAmount });

      // Retrieve the stake information from SamuraiStakingPlatform
      const stakeInfo = await stakingPlatform.userStakes(0); // Assuming 0 is the stakeId for this test

      // Validate the stake information
      expect(stakeInfo.user).to.equal(user1.address);
      expect(stakeInfo.amount).to.equal(amountToStake);
      expect(stakeInfo.poolType).to.equal(0); // 0 is the poolType for one-day staking
    });

    it("Should not allow a user to stake zero tokens", async function () {
      const { user1, oneDayStaking, feeContract } = await loadFixture(deployStakingFixture);

      // Get the fee amount from the FeeContract
      const feeAmount = await feeContract.getFee();

      // Try to stake zero tokens
      await expect(oneDayStaking.connect(user1).stake(0, { value: feeAmount })).to.be.revertedWith("Amount must be greater than zero");
    });

    it("Should store the correct users staked amount in the escrow", async function () {
      const { user1, user2, oneDayStaking, feeContract, yen, escrow } = await loadFixture(deployStakingFixture);
      await userStake("1000", user1, yen, escrow, feeContract, oneDayStaking);
      await userStake("100", user2, yen, escrow, feeContract, oneDayStaking);
      const stake1 = await escrow.userStakeBalances(user1, 0);
      const stake2 = await escrow.userStakeBalances(user2, 1);
      expect(Number(stake1) / 1e18).to.equal(1000);
      expect(Number(stake2) / 1e18).to.equal(100);
    })

    it("Should store the correct userStake information in the staking platform", async function () {
      const { user1, user2, oneDayStaking, feeContract, yen, escrow, stakingPlatform } = await loadFixture(deployStakingFixture);
      await userStake("1000", user1, yen, escrow, feeContract, oneDayStaking);
      await userStake("2000", user2, yen, escrow, feeContract, oneDayStaking);
      const stake1 = await stakingPlatform.userStakes(0);
      const stake2 = await stakingPlatform.userStakes(1);

      let reward1 = (Number(stake1.amount) * 5 / 100);
      let reward2 = (Number(stake2.amount) * 5 / 100);

      // Validate the stake information
      expect(stake1.stakeId).to.equal(0);
      expect(stake1.user).to.equal(user1.address);
      expect(stake1.amount).to.equal(parseEther("1000"));
      expect(stake1.poolType).to.equal(0); // 0 is the poolType for one-day staking
      expect(Number(stake1.reward) / 1e18).to.equal(reward1 / 1e18);

      expect(stake2.stakeId).to.equal(1);
      expect(stake2.user).to.equal(user2.address);
      expect(stake2.amount).to.equal(parseEther("2000"));
      expect(stake2.poolType).to.equal(0); // 0 is the poolType for one-day staking
      expect(Number(stake2.reward) / 1e18).to.equal(reward2 / 1e18);
    });

  });
  describe("Reward Calculation", function () {

    it("Should correctly calculate the reward based on the staked amount", async function () {
      const { user1, stakingPlatform, yen, escrow, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);

      // User stakes 1000 YEN tokens
      await userStake("1000", user1, yen, escrow, feeContract, oneDayStaking);

      // Retrieve the stake information from SamuraiStakingPlatform
      const stakeInfo = await stakingPlatform.userStakes(0); // Assuming 0 is the stakeId for this test

      // Calculate the expected reward
      const expectedReward = Number(stakeInfo.amount) * 5 / 100; // Assuming a 5% reward rate

      // Validate the calculated reward
      expect(Number(stakeInfo.reward)).to.equal(expectedReward);
    });

  });

  describe("User Claiming", function () {

    it("Should allow a user to claim a stake", async function () {
      const { user1, stakingPlatform, yen, escrow, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);

      // User stakes 1000 YEN tokens
      await userStake("1000", user1, yen, escrow, feeContract, oneDayStaking);

      // Mine some blocks to simulate time passing
      await advanceTime(86400);

      // User claims the stake
      await stakingPlatform.connect(user1).claim(0); // Assuming 0 is the stakeId for this test

      // Retrieve the stake information from SamuraiStakingPlatform
      const stakeInfo = await stakingPlatform.userStakes(0);

      // Validate that the stake is claimed
      expect(stakeInfo.isClaimed).to.equal(true);
    });

    it("Should allow a user to batch claim multiple stakes", async function () {
      const { user1, stakingPlatform, yen, escrow, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);

      // User stakes 1000 YEN tokens twice
      await userStake("1000", user1, yen, escrow, feeContract, oneDayStaking);
      await userStake("2000", user1, yen, escrow, feeContract, oneDayStaking);

      // Mine some blocks to simulate time passing
      await advanceTime(86400);

      // User batch claims the stakes
      await stakingPlatform.connect(user1).batchClaim([0, 1]); // Assuming 0 and 1 are the stakeIds for this test

      // Retrieve the stake information from SamuraiStakingPlatform
      const stakeInfo1 = await stakingPlatform.userStakes(0);
      const stakeInfo2 = await stakingPlatform.userStakes(1);

      // Validate that the stakes are claimed
      expect(stakeInfo1.isClaimed).to.equal(true);
      expect(stakeInfo2.isClaimed).to.equal(true);
    });

  });
  describe("Admin Operations", function () {
    it("Should only allow admin to update the admin contract", async function () {
      const { user1, escrow, adminContract } = await loadFixture(deployStakingFixture);
      await expect(escrow.connect(user1).updateAdminContract(adminContract.target)).to.be.revertedWith("Caller is not an admin");
    });

    it("Should only allow admin to deposit rewards", async function () {
      const { user1, escrow, yen } = await loadFixture(deployStakingFixture);
      const amount = parseEther("1000");
      await expect(escrow.connect(user1).depositRewards(amount, yen.target)).to.be.revertedWith("Caller is not an admin");
    });
  });

  describe("Revert Cases", function () {
    it("Should revert if unauthorized user tries to withdraw", async function () {
      const { user1, user2, escrow, yen, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);
      await userStake("1000", user1, yen, escrow, feeContract, oneDayStaking);
      await expect(escrow.connect(user2).userWithdraw(user1.address, 0, parseEther("100"), yen.target)).to.be.revertedWith("Caller is not the staking platform");
    });
  });

  describe("Event Emission", function () {
    it("Should emit UserDeposited event when a user deposits", async function () {
      const { user1, escrow, yen, oneDayStaking, feeContract } = await loadFixture(deployStakingFixture);
      await expect(userStake("1000", user1, yen, escrow, feeContract, oneDayStaking))
        .to.emit(escrow, 'UserDeposited')
        .withArgs(user1.address, 0, parseEther("1000"));
    });

    it("Should emit UserWithdrawn event when a user withdraws", async function () {
      const { user1, escrow, yen, oneDayStaking, feeContract, stakingPlatform } = await loadFixture(deployStakingFixture);
      await userStake("1050", user1, yen, escrow, feeContract, oneDayStaking);
      await advanceTime(86400);
      await expect(stakingPlatform.connect(user1).claim(0))
        .to.emit(escrow, 'UserWithdrawn')
        .withArgs(user1.address, 0, parseEther("1050"));
    });
  });

  describe("Claim and Reward Transfers", function () {

    it("Should transfer the staked amount back to the user upon claiming", async function () {
      const { user1, stakingPlatform, yen, escrow, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);

      // Initial user balance
      const initialBalance = await yen.balanceOf(user1.address);

      // User stakes 1550 YEN tokens
      await userStake("1550", user1, yen, escrow, feeContract, oneDayStaking);
      
      // Retrieve the stake information to get the reward amount
      const stakeInfo = await stakingPlatform.userStakes(0);
      const rewardAmount = stakeInfo.reward;

      // Advance time to make the stake claimable
      await advanceTime(86400);

      // User claims the stake
      await stakingPlatform.connect(user1).claim(0);
      
      // Final user balance
      const finalBalance = await yen.balanceOf(user1.address);

      // Validate that the staked amount is transferred back
      expect(finalBalance - initialBalance).to.equal(parseEther("1550") + (rewardAmount));
    });

    it("Should transfer the correct reward amount to the user upon claiming", async function () {
      const { user1, stakingPlatform, yen, escrow, feeContract, oneDayStaking } = await loadFixture(deployStakingFixture);

      // Initial user balance
      const initialBalance = await yen.balanceOf(user1.address);

      // User stakes 1000 YEN tokens
      await userStake("2400", user1, yen, escrow, feeContract, oneDayStaking);

      // Retrieve the stake information to get the reward amount
      const stakeInfo = await stakingPlatform.userStakes(0);
      const rewardAmount = stakeInfo.reward;

      // Advance time to make the stake claimable
      await advanceTime(86400);

      // User claims the stake
      await stakingPlatform.connect(user1).claim(0);

      // Final user balance
      const finalBalance = await yen.balanceOf(user1.address);

      // Validate that the reward amount is transferred
      expect(finalBalance - initialBalance).to.equal(parseEther("2400") + (rewardAmount));
    });

  });

});