const hre = require("hardhat");
const parseEther =  require('ethers');

async function main() {
  const [deployer, user1, user2, user3, receiver ] = await hre.ethers.getSigners();

  console.log("Royalty Receiver account:", receiver.address);
  
  console.log('contracts are deployed in this order: ')
  const Samurai = await hre.ethers.getContractFactory("Samurai");
  const samurai = await Samurai.connect(deployer).deploy(receiver.address);  
  
  const Admin = await hre.ethers.getContractFactory("AdminContract");
  const adminContract = await Admin.connect(deployer).deploy();
 
  const Fee = await hre.ethers.getContractFactory("FeeManagement");
  const feeContract = await Fee.connect(deployer).deploy(adminContract.target);

  const Yen = await hre.ethers.getContractFactory("YenToken");
  const yentoken = await Yen.connect(deployer).deploy();

  // Fee treasury is deployed.
  const FeeTreasury = await ethers.getContractFactory("FeeTreasury");
  const feeTreasury = await FeeTreasury.deploy(adminContract.target);

  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.connect(deployer).deploy(yentoken.target, feeContract.target, feeTreasury.target);  

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
  
  
  console.log("Deploying contracts with the account:", deployer.address);
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

  async function setupFaucetAndEscrow() {
    const initialRewardBalance = hre.ethers.parseEther('1000000000');
    const initialFaucetBalance = hre.ethers.parseEther('1000000000');
    await escrow.connect(deployer).updateStakingPlatform(stakingPlatform.target);
    await yentoken.connect(deployer).mint(deployer.address, (initialRewardBalance+ initialFaucetBalance));

    await yentoken.connect(deployer).increaseAllowance(faucet.target, initialFaucetBalance);
    await faucet.connect(deployer).replenishFaucet(initialFaucetBalance);

    await yentoken.connect(deployer).increaseAllowance(escrow.target, initialRewardBalance);
    await escrow.connect(deployer).replenishRewards(initialRewardBalance, yentoken.target);
    return true;
  }

  async function setupStakeFromUsers() {
    const initialTestStakeAmount = hre.ethers.parseEther('1000');
    const initialTestStakeAmount1 = hre.ethers.parseEther('10000');
    await yentoken.connect(deployer).mint(user1.address, (initialTestStakeAmount1));
    await yentoken.connect(deployer).mint(user2.address, (initialTestStakeAmount));
    await yentoken.connect(deployer).mint(user3.address, (initialTestStakeAmount));

    await yentoken.connect(user1).increaseAllowance(escrow.target, initialTestStakeAmount1);
    await yentoken.connect(user2).increaseAllowance(escrow.target, initialTestStakeAmount);
    await yentoken.connect(user3).increaseAllowance(escrow.target, initialTestStakeAmount);
    
    await oneDayStaking.connect(user1).stake(initialTestStakeAmount, {value: hre.ethers.parseEther("0.0009")});
    await oneDayStaking.connect(user2).stake(initialTestStakeAmount, {value: hre.ethers.parseEther("0.0009")});
    await oneDayStaking.connect(user3).stake(initialTestStakeAmount, {value: hre.ethers.parseEther("0.0009")});
    return true
  }



  const faucetAndEscrow = await setupFaucetAndEscrow();
  if (faucetAndEscrow) {
    console.log('Faucet and Escrow setup successfully, pools are ready to stake!');
  }
  const stakeFromUsers = await setupStakeFromUsers();
  if (stakeFromUsers) {
    console.log('Users has staked successfully, Users are ready to after 24 hours!');
    console.log('user1:', user1.address);
    console.log('user2:', user2.address);
    console.log('user3:', user3.address);
  }

  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
