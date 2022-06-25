const hre = require("hardhat");

try {
  hre
    .run("verify:verify", {
      address: "0x",
      constructorArguments: [""],
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
