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
    console.log("Contract deployed to:", contract.target);
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
            deployer,
        ]
    });
    console.log(`Verified Contract: ${contract.address}`)
}

async function main() {
    await deploy();
    // let address = await deploy();
    // await verify(address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});