// ./01_deploy_verify_genesis.ts
// npx hardhat run --network <your-network> scripts/deploy.js
// npx hardhat verify --network mainnet <address> "constructor argument 1"

import { ethers } from "hardhat";
import hre from "hardhat";

var dotenv = require("dotenv");
dotenv.config();

const deployer = "0x21Cca084378f8a6F48117A85F25CCfCb040AEffe";
const admin_contract = "0x2B96C34B875aC61c513328949bA479A0469AF6E0";
const staking_platform = "0xeD102bAB87Fc4E2D21b0Dc59979E4685330a756C";
const fee_contract = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";

async function deploy() {

    // We get the contract to deploy
    const Contract = await ethers.getContractFactory("OneDayStakingContract");
    const contract = await Contract.deploy(admin_contract, staking_platform, fee_contract);

    console.log("Deploying contract now...");
    console.log("Contract deployed to:",
        contract.target);
    console.log("Contract deployed by:", deployer);

    return contract.target;
}

async function verify(address: string) {
    let contract = {
        address: address
    };
    await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: [
            admin_contract,
            staking_platform,
            fee_contract
        ]
    });
    console.log(`Verified Contract: ${contract.address}`)
}

async function main() {
    // await deploy();
    // let address = await deploy();
    await verify("0xD570dB1478565DdA45eedA31a795Db8174Eb524E");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });