import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther } from "ethers";
import { FeeTreasury } from '../typechain-types/contracts/stakingcontracts/FeeTreasury';
import { FeeContract } from '../typechain-types/contracts/stakingcontracts/FeeContract';
import { AdminContract } from '../typechain-types/contracts/stakingcontracts/AdminContract';

describe("Faucet Contract", function () {

  async function deployFaucetFixture() {
    const [admin, user1, user2] = await ethers.getSigners();
    const AdminContract = await ethers.getContractFactory("AdminContract");
    const adminContract = await AdminContract.deploy();
    const YenToken = await ethers.getContractFactory("YenToken");
    const yenToken = await YenToken.deploy();
    const FeeTreasury = await ethers.getContractFactory("FeeTreasury");
    const feeTreasury = await FeeTreasury.deploy(adminContract.target);
    const FeeContract = await ethers.getContractFactory("FeeContract");
    const feeContract = await FeeContract.deploy(feeTreasury.target, adminContract.target);
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy(yenToken.target, feeContract.target, feeTreasury.target);

    return { faucet, yenToken, admin, user1, user2 };
  }

  describe("Deployment", function () {

    it("Should initialize with the correct YenToken address", async function () {
      const { faucet, yenToken } = await loadFixture(deployFaucetFixture);
      expect(await faucet.yenToken()).to.equal(yenToken.target);
    });

  });

  describe("Token Request", function () {
    const feeAmount = parseEther("0.0009");
    it("should allow user to request tokens after cooldown", async function () {
      const { faucet, admin, user1, yenToken } = await loadFixture(deployFaucetFixture);
      await yenToken.connect(admin).approve(faucet.target, parseEther("200000"));
      await faucet.connect(admin).depositTokens(parseEther("200000"));

      await faucet.connect(user1).requestTokens({ value: feeAmount });
      expect(await yenToken.balanceOf(user1.address)).to.equal(parseEther("1000"));
    });

    it("should not allow user to request tokens if faucet has insufficient balance", async function () {
      const { faucet, user1 } = await loadFixture(deployFaucetFixture);

      await expect(faucet.connect(user1).requestTokens({ value: feeAmount })).to.be.revertedWith("Not enough tokens in faucet");
    });

  });

  describe("Admin Functions", function () {

    it("should allow admin to deposit tokens", async function () {
      const { faucet, admin, yenToken } = await loadFixture(deployFaucetFixture);
      await yenToken.transfer(admin.address, parseEther("200000")); // Mint some tokens to admin for testing

      await yenToken.connect(admin).approve(faucet.target, parseEther("10000"));
      await faucet.connect(admin).depositTokens(parseEther("10000"));

      expect(await yenToken.balanceOf(faucet.target)).to.equal(parseEther("10000"));
    });

    it("should allow admin to withdraw stuck tokens", async function () {
      const { faucet, admin, yenToken } = await loadFixture(deployFaucetFixture);
      await yenToken.transfer(faucet.target, parseEther("10000")); // Admin deposits 1000 YenTokens to faucet

      await faucet.connect(admin).withdrawStuckTokens(yenToken.target, admin.address);
      expect(await yenToken.balanceOf(admin.address)).to.equal(parseEther("1000000"));
    });

    it("should allow admin to withdraw stuck Ether", async function () {
      const { faucet, admin } = await loadFixture(deployFaucetFixture);

      await admin.sendTransaction({
        to: faucet.target,
        value: parseEther("1")
      });

      await faucet.connect(admin).withdrawStuckEther(admin.address);
      expect(await ethers.provider.getBalance(faucet.target)).to.equal(0);
    });

  });

});
