const hre = require("hardhat");
const parseEther = require('ethers');


const deployer = "0x21Cca084378f8a6F48117A85F25CCfCb040AEffe";
async function main() {

  console.log('contracts are deployed in this order: ')
  const Samurai = await hre.ethers.getContractFactory("Samurai");
  const samurai = await Samurai.deploy(deployer);

  const Admin = await ethers.getContractFactory("AdminContract");
  const adminContract = await Admin.deploy();

  const Fee = await ethers.getContractFactory("FeeManagement");
  const feeContract = await Fee.deploy(adminContract.target);

  const Yen = await ethers.getContractFactory("YenToken");
  const yentoken = await Yen.deploy();

  // Fee treasury is deployed.
  const FeeTreasury = await ethers.getContractFactory("FeeTreasury");
  const feeTreasury = await FeeTreasury.deploy(adminContract.target);

  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy(yentoken.target, feeContract.target, feeTreasury.getAddress());

  // EscrowHandler is deployed.
  const Escrow = await ethers.getContractFactory("EscrowHandler");
  const escrow = await Escrow.deploy(adminContract.target);

  // StakingRewardManager is deployed to manage the RewardDistribution.
  const StakingRewardManager = await ethers.getContractFactory("StakingRewardManager");
  const rewardDistribution = await StakingRewardManager.deploy(adminContract.target);

  // TokenStakingPlatform is the main contract.
  const StakingPlatform = await ethers.getContractFactory("TokenStakingPlatform");
  const stakingPlatform = await StakingPlatform.deploy(
    yentoken.target,
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


  console.log("Deploying contracts with the account:", deployer);
  console.log("1. Samurai deployed to:", samurai.target);
  console.log("1. AdminContract deployed to:", adminContract.target);
  console.log("2. YenToken deployed to:", yentoken.target);
  console.log("3. FeeTreasury address:", feeTreasury.target);
  console.log("4. Faucet deployed to:", faucet.target);
  console.log("5. escrow address:", escrow.target);
  console.log("6. rewardDistribution address:", rewardDistribution.target,);
  console.log("7. stakingPlatform address:", stakingPlatform.target,);
  console.log("8. oneDayStaking address:", oneDayStaking.target,);
  console.log("9. oneWeekStaking address:", oneWeekStaking.target,);
  console.log("10. oneMonthStaking address:", oneMonthStaking.target,);
  console.log("11. oneYearStaking address:", oneYearStaking.target,);
  console.log("12. sixMonthStaking address:", sixMonthStaking.target,);

 /*  async function setupFaucetAndEscrow() {
    const initialRewardBalance = hre.ethers.parseEther('1000000000');
    const initialFaucetBalance = hre.ethers.parseEther('1000000000');
    await escrow.connect(deployer).updateStakingPlatform(stakingPlatform.target);
    await yentoken.connect(deployer).mint(deployer.address, (initialRewardBalance + initialFaucetBalance));

    await yentoken.connect(deployer).increaseAllowance(faucet.target, initialFaucetBalance);
    await faucet.connect(deployer).replenishFaucet(initialFaucetBalance);

    await yentoken.connect(deployer).increaseAllowance(escrow.target, initialRewardBalance);
    await escrow.connect(deployer).replenishRewards(initialRewardBalance, yentoken.target);
    return true;
  }

  async function setupStakeFromUsers() {
    const initialTestStakeAmount1 = hre.ethers.parseEther('5000');
    const initialTestStakeAmount2 = hre.ethers.parseEther('100000');
    await yentoken.connect(deployer).mint(user1.address, (initialTestStakeAmount2));
    await yentoken.connect(deployer).mint(user2.address, (initialTestStakeAmount2));
    await yentoken.connect(deployer).mint(user3.address, (initialTestStakeAmount2));

    await yentoken.connect(user1).increaseAllowance(escrow.target, initialTestStakeAmount2);
    await yentoken.connect(user2).increaseAllowance(escrow.target, initialTestStakeAmount2);
    await yentoken.connect(user3).increaseAllowance(escrow.target, initialTestStakeAmount2);

    await oneDayStaking.connect(user1).stake(initialTestStakeAmount1, { value: hre.ethers.parseEther("0.0009") });
    await oneDayStaking.connect(user2).stake(initialTestStakeAmount1, { value: hre.ethers.parseEther("0.0009") });
    await oneDayStaking.connect(user3).stake(initialTestStakeAmount1, { value: hre.ethers.parseEther("0.0009") });
    console.log("one day staking done")

    await oneWeekStaking.connect(user1).stake(initialTestStakeAmount1, { value: hre.ethers.parseEther("0.0009") });
    await oneWeekStaking.connect(user2).stake(initialTestStakeAmount1, { value: hre.ethers.parseEther("0.0009") });
    await oneWeekStaking.connect(user3).stake(initialTestStakeAmount1, { value: hre.ethers.parseEther("0.0009") });
    console.log("one week staking done")

    await oneMonthStaking.connect(user1).stake(initialTestStakeAmount1, { value: hre.ethers.parseEther("0.0009") });
    await oneMonthStaking.connect(user2).stake(initialTestStakeAmount1, { value: hre.ethers.parseEther("0.0009") });
    await oneMonthStaking.connect(user3).stake(initialTestStakeAmount1, { value: hre.ethers.parseEther("0.0009") });
    console.log("one month staking done")
    return true
  }

  async function setupYenTokenToSamurai() {
    await samurai.connect(deployer).setERC20TokenAddress(yentoken.target);
    return true;
  }

  const yenOverSamurai = await setupYenTokenToSamurai();
  if (yenOverSamurai) {
    console.log('Yen token added to NFT Samurai contract!');
  }

  const faucetAndEscrow = await setupFaucetAndEscrow();
  if (faucetAndEscrow) {
    console.log('Faucet and Escrow setup successfully, pools are ready to stake!');
  }
  const stakeFromUsers = await setupStakeFromUsers();
  if (stakeFromUsers) {
    console.log('Users has staked successfully, Users are ready to after 24 hours!');
    const user1Stakes1 = await stakingPlatform.getUserStakeIdsInPool(user1.address, 1);
    const user1Stakes0 = await stakingPlatform.getUserStakeIdsInPool(user1.address, 0);
    console.log('user1, pool 1:', user1.address, await stakingPlatform.getStakeData(user1Stakes1[0]));
    console.log('user1, pool 0:', user1.address, await stakingPlatform.getStakeData(user1Stakes0[0]));
    console.log('user2:', user2.address);
    console.log('user3:', user3.address);
  }
  console.log('Samurai Staking Platform is deployed successfully');
  */
} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
