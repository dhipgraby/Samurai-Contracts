import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther } from "ethers";


describe("Samurai Staking Platform", function () {
async function deployStakingFixture() {
    const [admin, user1, user2] = await ethers.getSigners();
  
    // Fee treasury is deployed first.
    const FeeTreasury = await ethers.getContractFactory("FeeTreasury");
    const feeTreasury = await FeeTreasury.deploy();
    
    // FeeContract takes the FeeTreasury as a parameter.
    const FeeContract = await ethers.getContractFactory("FeeContract");
    const feeContract = await FeeContract.deploy(feeTreasury.target);

    // EscrowContract is deployed next.
    const Escrow = await ethers.getContractFactory("EscrowContract");
    const escrow = await Escrow.deploy();
    
    // ConcreteRewardDistribution is deployed to manage the RewardDistribution.
    const ConcreteRewardDistribution = await ethers.getContractFactory("ConcreteRewardDistribution");
    const rewardDistribution = await ConcreteRewardDistribution.deploy(escrow.target);

    // StakingPlatform is the main contract.
    const StakingPlatform = await ethers.getContractFactory("StakingPlatform");
    const stakingPlatform = await StakingPlatform.deploy(
      feeContract.target,
      rewardDistribution.target,
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
      feeContract
    };
  }
  describe("Deployment", function () {

    it("Should return the right addresses of the contracts", async function () {
      const { admin,
        user1,
        user2,
        feeTreasury,
        rewardDistribution,
        stakingPlatform,
        oneDayStaking,
        escrow,
        feeContract} = await loadFixture(deployStakingFixture);

      console.log("stakingPlatform", stakingPlatform.target);
      console.log("oneDayStaking", oneDayStaking.target);
      console.log("escrow", escrow.target);
      console.log("feeContract", feeContract.target);
      console.log("rewardDistribution", rewardDistribution.target);
      console.log("feeTreasury", feeTreasury.target);
      console.log("admin", admin.address);
      console.log("user1", user1.address);
      console.log("user2", user2.address);
    });

  });
});