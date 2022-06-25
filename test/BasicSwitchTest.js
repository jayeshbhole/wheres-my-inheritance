const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { constants } = ethers;
const { bigNumFrom, dec } = require("../utils/helpers");

describe("BasicSwitch", function () {
  describe("Deployment", function () {
    let BasicSwitch;
    let basicSwitch;

    const provider = ethers.provider;

    it("Should Deploy", async function () {
      // Deploy the contract for Basic Switch
      BasicSwitch = await hre.ethers.getContractFactory("BasicSwitch");
      basicSwitch = await BasicSwitch.deploy(10, "0x3C5F48fAee7f50603071de0DaE955EAFb5293c46", {
        value: bigNumFrom(dec(1000, "ether")),
      });

      await basicSwitch.deployed();
    });

    it("Should initialise deployment correctly", async function () {
      // expect the balance of basic switch to be 1000 ether
      expect(await await provider.getBalance(basicSwitch.address)).to.equal(dec(1000, "ether"));

      // expect the heir to be 0x3C5F48fAee7f50603071de0DaE955EAFb5293c46
      expect(await basicSwitch.getHeir()).to.equal("0x3C5F48fAee7f50603071de0DaE955EAFb5293c46");
    });

    it("Should be able to change the heir", async function () {
      const [owner, heir] = await ethers.getSigners();
      // expect the heir
      expect(await basicSwitch.getHeir()).to.equal("0x3C5F48fAee7f50603071de0DaE955EAFb5293c46");

      // change the heir
      const changeHeirTx = await basicSwitch.changeHeir(
        "0x8C1d599A7fEF1ee7e21B719dB4FdcF79001fF19f"
      );

      // wait until the transaction is mined
      await changeHeirTx.wait();

      expect(await basicSwitch.getHeir()).to.equal("0x8C1d599A7fEF1ee7e21B719dB4FdcF79001fF19f");

      const revertHeirTx = await basicSwitch.changeHeir(heir.address);
      await revertHeirTx.wait();
    });

    it("Should update the lastAlive variable", async function () {
      // Deploy the contract for Basic Switch
      BasicSwitch = await hre.ethers.getContractFactory("BasicSwitch");
      basicSwitch = await BasicSwitch.deploy(10, "0x3C5F48fAee7f50603071de0DaE955EAFb5293c46", {
        value: bigNumFrom(dec(1000, "ether")),
      });

      await basicSwitch.deployed();

      let lastAlive = await basicSwitch.lastAlive();

      await hre.network.provider.send("hardhat_mine", ["0x2"]);

      // call keep alive function
      const keepAliveTx = await basicSwitch.keepAlive();
      await keepAliveTx.wait();

      const expectedLastAlive = bigNumFrom(lastAlive).add(3).toString();
      const newLastAlive = (await basicSwitch.lastAlive()).toString();

      expect(newLastAlive).to.equal(expectedLastAlive);
    });

    it("Should transfer ETH when not alive", async function () {
      const [owner, heir] = await ethers.getSigners();

      // call keep alive function
      const keepAliveTx = await basicSwitch.keepAlive();
      await keepAliveTx.wait();

      let lastAlive = await basicSwitch.lastAlive();

      // simulate new blocks
      await hre.network.provider.send("hardhat_mine", ["0x10"]);

      // connect heir account and claim inheritance
      await basicSwitch.connect(heir).claimInheritance();

      // contract balance should become 0
      expect(await provider.getBalance(basicSwitch.address)).to.equal(0);

      // Heir balance should become 1000 ETH
      const expectedBalance = (await heir.getBalance()).add(dec(1000, "ether"));
      expect(await provider.getBalance(await basicSwitch.getHeir())).to.equal(expectedBalance);

      await basicSwitch.connect(owner);
    });
  });
});
