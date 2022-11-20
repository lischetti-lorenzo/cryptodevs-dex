require("dotenv").config({ path: ".env" });
import { ethers } from "hardhat";
import {CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS} from '../constants';

async function main() {
  const exchangeContract = await ethers.getContractFactory("Exchange");
  const deployedExchangeContract = await exchangeContract.deploy(CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS);
  await deployedExchangeContract.deployed();

  console.log("Exchange Contract Address:", deployedExchangeContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
