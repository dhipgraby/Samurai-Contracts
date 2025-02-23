import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther } from "ethers";

describe("Samurai NFTs", function () {

  async function deploySamuraiFixture() {
    const [admin, royaltyAccount, user1, user2, developer1, developer2, artist] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("Samurai");
    const samurai = await Contract.deploy(royaltyAccount.address, developer1.address, developer2.address, artist.address);

    return { samurai, admin, royaltyAccount, user1, user2 };
  }

  async function deployERC20Fixture() {
    const Contract = await ethers.getContractFactory("YenToken");
    const yen = await Contract.deploy();
    return { yen };
  }

  describe("Deployment", function () {

    it("Should return the right name and symbol", async function () {
      const { samurai } = await loadFixture(deploySamuraiFixture);

      expect(await samurai.name()).to.equal("LastBloodLines");
      expect(await samurai.symbol()).to.equal("LBL");
    });

  });

  describe("Admin Functions", function () {

    it("should allow admin to set ETH price", async function () {
      const { samurai, admin } = await loadFixture(deploySamuraiFixture);

      await samurai.connect(admin).setPrice(parseEther("0.2"));
      expect(await samurai.initialPrice()).to.equal(parseEther("0.2"));
    });

    it("should allow admin to set Token price", async function () {
      const { samurai, admin } = await loadFixture(deploySamuraiFixture);
      await samurai.connect(admin).setTokenPrice(parseEther("1100"));
      expect(await samurai.initialTokenPrice()).to.equal(parseEther("1100"));
    });

    it("should allow admin to set ERC20 Token Address", async function () {
      const { samurai, admin } = await loadFixture(deploySamuraiFixture);
      const { yen } = await loadFixture(deployERC20Fixture);

      await samurai.connect(admin).setERC20TokenAddress(yen.target);
      expect(await samurai.erc20TokenAddress()).to.equal(yen.target);
    });

    it("should allow admin to withdraw Ether", async function () {
      const { samurai, admin } = await loadFixture(deploySamuraiFixture);
      await admin.sendTransaction({
        to: samurai.target,
        value: parseEther("1")
      });

      await expect(samurai.connect(admin).withdrawEther())
        .to.emit(samurai, "Withdrawn")
        .withArgs(333333333333333333n);
    });

    it("should allow admin to withdraw Tokens", async function () {
      const { samurai, admin } = await loadFixture(deploySamuraiFixture);
      const { yen } = await loadFixture(deployERC20Fixture);

      await yen.transfer(samurai.target, parseEther("1000"));

      await expect(samurai.connect(admin).withdrawTokens(yen.target))
        .to.emit(samurai, "WithdrawnTokens")
        .withArgs(yen.target, "333333333333333333333");
    });
  });

  describe("Receive Ether", function () {

    it("should accept Ether sent directly to the contract", async function () {
      const { samurai, admin } = await loadFixture(deploySamuraiFixture);
      const tx = await admin.sendTransaction({
        to: samurai.target,
        value: parseEther("1")
      });

      await expect(tx)
        .to.emit(samurai, "Received")
        .withArgs(admin.address, parseEther("1"));
    });
  });

/*   describe("AdminMint", function () {

    it("should allow admin to mint a new token", async function () {
      const { samurai, admin, user1 } = await loadFixture(deploySamuraiFixture);

      expect(await samurai.connect(admin).adminMint(user1.address, 1))
        .to.emit(samurai, "Minted");
    });

    it("should not allow non-admin to mint a new token", async function () {
      const { samurai, user1, user2 } = await loadFixture(deploySamuraiFixture);

      await expect(samurai.connect(user1).adminMint(user2.address, 2)).to.be.revertedWith(
        'AccessControl: account 0xa670a43859bba57da9f0a275b601a3f0acccd41a is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'
      );
    });

    it("should not allow minting an existing token", async function () {
      const { samurai, admin, user1, user2 } = await loadFixture(deploySamuraiFixture);

      await samurai.connect(admin).adminMint(user1.address, 1);
      await expect(samurai.adminMint(user2.address, 1)).to.be.reverted;
    });
  }); */

  describe("userMint", function () {

    it("should allow a user to mint a new token with ETHER", async function () {
      const { samurai, user1 } = await loadFixture(deploySamuraiFixture);

      await expect(samurai.connect(user1).userMint(1, { value: parseEther("0.19") }))
        .to.emit(samurai, "Minted")
        .withArgs(user1.address, 1);
    });


    it("should allow a user to mint a new token with ERC20", async function () {
      const { samurai, admin, user1 } = await loadFixture(deploySamuraiFixture);
      const { yen } = await loadFixture(deployERC20Fixture);

      await samurai.connect(admin).setERC20TokenAddress(yen);
      await samurai.connect(admin).setTokenLive(true);

      await yen.transfer(user1, parseEther("2000"));


      await yen.connect(user1).approve(samurai.target, parseEther("1000"));

      await expect(samurai.connect(user1).userMintWithToken(1))
        .to.emit(samurai, "Minted")
        .withArgs(user1.address, 1);
    });

    it("should not allow minting an existing token", async function () {
      const { samurai, user1, user2 } = await loadFixture(deploySamuraiFixture);

      await samurai.connect(user1).userMint(1, { value: parseEther("0.19") });
      await expect(samurai.connect(user2).userMint(1, { value: parseEther("0.19") })).to.be.reverted;
    });
  });

  describe("YenToken", function () {

    it("Should return the right name and symbol", async function () {
      const { yen } = await loadFixture(deployERC20Fixture);

      expect(await yen.name()).to.equal("Yen");
      expect(await yen.symbol()).to.equal("YEN");
    })
    it("Should minted the correct amount", async function () {
      const { yen } = await loadFixture(deployERC20Fixture);

      expect(await yen.totalSupply()).to.equal(6000000000000000000000000000n);
    })
  });

});


