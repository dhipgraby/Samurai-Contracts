import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther } from "ethers";

async function deployStakingContracts() {
    const [admin, user1, user2] = await ethers.getSigners();
  
    const FeeTreasury = await ethers.getContractFactory("FeeTreasury");
    const feeTreasury = await FeeTreasury.deploy();

  
    const Escrow = await ethers.getContractFactory("EscrowContract");
    const escrow = await Escrow.deploy();
    
    const ConcreteRewardDistribution = await ethers.getContractFactory("ConcreteRewardDistribution");
    const rewardDistribution = await ConcreteRewardDistribution.deploy(escrow.target);

  
    const StakingPlatform = await ethers.getContractFactory("StakingPlatform");
    const stakingPlatform = await StakingPlatform.deploy(feeTreasury.target, rewardDistribution.target, admin.address);
    
  
    const OneDayStakingContract = await ethers.getContractFactory("OneDayStakingContract");
    const oneDayStaking = await OneDayStakingContract.deploy(stakingPlatform.target);

  
    return {
      admin,
      user1,
      user2,
      feeTreasury,
      rewardDistribution,
      stakingPlatform,
      oneDayStaking
    };
  }
  