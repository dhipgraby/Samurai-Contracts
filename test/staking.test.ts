import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther } from "ethers";



async function setupEscrow() {
  const { yen, escrow, stakingPlatform, admin } = await loadFixture(deployStakingFixture);
  // Define staking platform
  escrow.connect(admin).updateStakingPlatform(stakingPlatform.target);
  // Deposit rewards amount
  escrow.connect(admin).depositRewards(parseEther("1_000_000_000"), yen.target);
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
describe("Samurai Staking Platform", function () {


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

      expect(stakingPlatform.target).to.be.properAddress;
      expect(escrow.target).to.be.properAddress;
      expect(feeTreasury.target).to.be.properAddress;
      expect(rewardDistribution.target).to.be.properAddress;
      expect(oneDayStaking.target).to.be.properAddress;
      expect(feeContract.target).to.be.properAddress;
      expect(yen.target).to.be.properAddress;
      expect(adminContract.target).to.be.properAddress;
      expect(admin.address).to.be.properAddress;
      expect(user1.address).to.be.properAddress;
      expect(user2.address).to.be.properAddress;
    });
  });

});