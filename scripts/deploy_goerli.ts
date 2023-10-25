// ./01_deploy_verify_genesis.ts
// npx hardhat run --network <your-network> scripts/deploy.js
// npx hardhat verify --network mainnet <address> "constructor argument 1"

import { ethers } from "hardhat";
import hre from "hardhat";

var dotenv = require("dotenv");
dotenv.config();

const deployer = "0x21Cca084378f8a6F48117A85F25CCfCb040AEffe";

async function deploy() {


    // We get the contract to deploy
    const Contract = await ethers.getContractFactory("AdminContract");
    const contract = await Contract.deploy();

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
            "0x2B96C34B875aC61c513328949bA479A0469AF6E0",
            "0xeD102bAB87Fc4E2D21b0Dc59979E4685330a756C",
            "0x993718a2A407191a887FA39b3CDf87c8ED6c4678"
        ]
    });
    console.log(`Verified Contract: ${contract.address}`)
}

async function main() {
    // await deploy();
    // let address = await deploy();
    const addresses = ["0xf3e63F73d3BDC41741380F7D2CF717f233857E6B",
        "0x36487412a995E1835CeAFF2f6f191E645Da0e0be",
        "0xA0a96974C4b4496794564786578eea117c1537d9",
        "0x8f50c625B5a107365e52EF8c291A0d21F6e671BB",
        "0xD241Bef340cA7ce6b964310528676A58A53bcF78"]

    for (let i = 0; i < addresses.length; i++) {
        await verify(addresses[i]);
    }

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });