// ./01_deploy_verify_genesis.ts
// npx hardhat run --network base scripts/deploy.js
// npx hardhat verify --network base <address> "constructor argument 1"

import { ethers } from "hardhat";
import hre from "hardhat";

var dotenv = require("dotenv");
dotenv.config();

const deployer = "0x376EA39f7529D226fc33b7C7be0b962E27066b7B";
const royaltyReceiver = "0x71C57cF4239deFB33Acb1e287f1310530a3b8Ae8";
const developer1 = "0x71C57cF4239deFB33Acb1e287f1310530a3b8Ae8";
const developer2 = "0xb1C5c75c5869142A8d273eBCD6a5c0331198A232"
const artist = "0x31Cc269eBb5e5AFAFC988c37FA4E6b77c7C0d467"

async function deploy() {

    // We get the contract to deploy
    const Contract = await ethers.getContractFactory("Samurai");
    const contract = await Contract.deploy(royaltyReceiver, developer1, developer2, artist);

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
            royaltyReceiver,
            developer1,
            developer2,
            artist
        ]
    });
    console.log(`Verified Contract: ${contract.address}`)
}

async function main() {
    // await deploy();
    // let address = await deploy();
    await verify("0x3623f7EE4040365669D4890A5a4A76C74aEdF140");
    // console.log("Contract deployed to:", address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });