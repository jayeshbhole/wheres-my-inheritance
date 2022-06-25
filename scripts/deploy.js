// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

const { bigNumFrom, dec } = require("../utils/helpers");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const BasicSwitch = await hre.ethers.getContractFactory("BasicSwitch");
  const basicSwitch = await BasicSwitch.deploy(10, "0x3C5F48fAee7f50603071de0DaE955EAFb5293c46", {
    value: bigNumFrom(dec(1, "ether")),
  });

  await basicSwitch.deployed();

  console.log("basicSwitch deployed to:", basicSwitch.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
