const { ethers } = require("hardhat");

const bigNumFrom = (v) => ethers.BigNumber.from(v);
const bigNumToString = (v) => ethers.BigNumber.from(v).toString();

const dec = (val, scale) => {
  let zerosCount;
  if (scale == "ether") {
    zerosCount = 18;
  } else if (scale == "finney") zerosCount = 15;
  else {
    zerosCount = scale;
  }
  const strVal = val.toString();
  const strZeros = "0".repeat(zerosCount);

  return strVal.concat(strZeros);
};

module.exports = {
  bigNumFrom,
  dec,
  bigNumToString,
};
