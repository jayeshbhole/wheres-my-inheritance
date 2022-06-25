const hre = require("hardhat");
const { dec } = require("../utils/helpers");
try {
  hre
    .run("verify:verify", {
      address: "0xF3852a2720Bf97277Ae716d9c19e3050357E9508",
      contract: "/contracts/BasicSwitch.sol:BasicSwitch",
      constructorArguments: [
        dec(1, "ether"),
        "0x3C5F48fAee7f50603071de0DaE955EAFb5293c46",
      ],
    })
    .then(() => {
      console.log("Contract verified successfully");
    });
} catch (error) {
  if (error.name !== "NomicLabsHardhatPluginError") {
    console.error(`Error verifying: ${error.name}`);
    console.error(error);
  } else {
    throw error;
  }
}
