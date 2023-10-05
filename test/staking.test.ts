import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther } from "ethers";


describe("Samurai Staking Platform", function () {

  const initialRewardBalance = parseEther("1000000000");

  async function setupEscrow(admin: any, escrow: any, _stakingPlatform: any, _yen: any) {
    await escrow.connect(admin).updateStakingPlatform(_stakingPlatform.target);
    await _yen.connect(admin).mint(admin.address, initialRewardBalance);
    await _yen.connect(admin).increaseAllowance(escrow.target, initialRewardBalance);
    await escrow.connect(admin).depositRewards(initialRewardBalance, _yen.target);
  }

  async function deployStakingFixture() {
    const [admin, user1, user2] = await ethers.getSigners();

    const AdminContract = await ethers.getContractFactory("AdminContract");
    const adminContract = await AdminContract.deploy();

    const Contract = await ethers.getContractFactory("YenToken");
    const yen = await Contract.deploy();

    // Fee treasury is deployed first.
    const FeeTreasury = await ethers.getContractFactory("FeeTreasury");
    const feeTreasury = await FeeTreasury.deploy();

    // FeeContract takes the FeeTreasury as a parameter.
    const FeeContract = await ethers.getContractFactory("FeeContract");
    const feeContract = await FeeContract.deploy(feeTreasury.target);

    // EscrowContract is deployed next.
    const Escrow = await ethers.getContractFactory("EscrowContract");
    const escrow = await Escrow.deploy(adminContract.target);

    // ConcreteRewardDistribution is deployed to manage the RewardDistribution.
    const ConcreteRewardDistribution = await ethers.getContractFactory("ConcreteRewardDistribution");
    const rewardDistribution = await ConcreteRewardDistribution.deploy(escrow.target);

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
    const oneDayStaking = await OneDayStakingContract.deploy(stakingPlatform.target);

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
      const { yen, escrow, stakingPlatform, admin } = await loadFixture(deployStakingFixture);
      await setupEscrow(admin, escrow, stakingPlatform, yen);
      const rewardBalance = await escrow.getRewardBalance();
      expect(rewardBalance).to.equal(initialRewardBalance);
    })
  });

});