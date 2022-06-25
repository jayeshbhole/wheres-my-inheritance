const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { constants } = ethers;
const { bigNumFrom, dec, bigNumToString } = require("../utils/helpers");

describe("BasicSwitch", function () {
  let BasicSwitch;
  let basicSwitch;

  const provider = ethers.provider;

  describe("Deployment", function () {
    it("Should Deploy", async function () {
      // Deploy the contract for Basic Switch
      BasicSwitch = await hre.ethers.getContractFactory("BasicSwitch");
      basicSwitch = await BasicSwitch.deploy(
        10,
        "0x3C5F48fAee7f50603071de0DaE955EAFb5293c46",
        {
          value: bigNumFrom(dec(1000, "ether")),
        }
      );

      await basicSwitch.deployed();
    });

    it("Should initialise deployment correctly", async function () {
      // expect the balance of basic switch to be 1000 ether
      expect(await await provider.getBalance(basicSwitch.address)).to.equal(
        dec(1000, "ether")
      );

      // expect the heir to be 0x3C5F48fAee7f50603071de0DaE955EAFb5293c46
      expect(await basicSwitch.getHeir()).to.equal(
        "0x3C5F48fAee7f50603071de0DaE955EAFb5293c46"
      );
    });
  });

  describe("Functionality", function () {
    it("Should be able to change the heir", async function () {
      const [owner, heir] = await ethers.getSigners();
      // expect the heir
      expect(await basicSwitch.getHeir()).to.equal(heir.address);

      // change the heir
      const changeHeirTx = await basicSwitch.changeHeir(
        "0x8C1d599A7fEF1ee7e21B719dB4FdcF79001fF19f"
      );

      // wait until the transaction is mined
      await changeHeirTx.wait();

      expect(await basicSwitch.getHeir()).to.equal(
        "0x8C1d599A7fEF1ee7e21B719dB4FdcF79001fF19f"
      );

      const revertHeirTx = await basicSwitch.changeHeir(heir.address);
      await revertHeirTx.wait();
    });

    it("Should update the lastAlive variable", async function () {
      // Deploy the contract for Basic Switch
      BasicSwitch = await hre.ethers.getContractFactory("BasicSwitch");
      basicSwitch = await BasicSwitch.deploy(
        10,
        "0x3C5F48fAee7f50603071de0DaE955EAFb5293c46",
        {
          value: bigNumFrom(dec(1000, "ether")),
        }
      );

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
  });

  describe("Inheritance: ", function () {
    describe("Native Token", function () {
      it("Should transfer ETH when not alive", async function () {
        const [owner, heir] = await ethers.getSigners();

        // call keep alive function
        const keepAliveTx = await basicSwitch.keepAlive();
        await keepAliveTx.wait();

        let lastAlive = await basicSwitch.lastAlive();

        // simulate new blocks
        await hre.network.provider.send("hardhat_mine", ["0x10"]);

        // Heir balance should become 1000 ETH after the claim
        const expectedBalance = (await heir.getBalance()).add(
          dec(1000, "ether")
        );

        // connect heir account and claim inheritance
        await basicSwitch.claimInheritance();

        // contract balance should become 0
        expect(
          bigNumToString(await provider.getBalance(basicSwitch.address))
        ).to.equal("0");

        expect(await provider.getBalance(await basicSwitch.getHeir())).to.equal(
          expectedBalance
        );

        await basicSwitch.connect(owner);
      });
    });

    describe("ERC20 Token", function () {
      let ERC20;
      let erc20;

      it("Should deploy ERC20 token and approve tokens to Switch", async function () {
        const [owner, heir] = await ethers.getSigners();

        // deploy ERC20 token
        ERC20 = await hre.ethers.getContractFactory("TestERC20");
        erc20 = await ERC20.deploy(dec(10, 27));

        // check user balance of ERC20 token
        expect(bigNumToString(await erc20.balanceOf(owner.address))).to.equal(
          dec(10, 27)
        );

        // approve ERC20 spend for Basic Switch
        const approveTx = await erc20.approve(basicSwitch.address, dec(10, 27));
        await approveTx.wait();

        // check allowance of Basic Switch
        expect(
          bigNumToString(
            await erc20.allowance(owner.address, basicSwitch.address)
          )
        ).to.equal(dec(10, 27));
      });

      it("Should add ERC20 tokens to the list", async function () {
        // add ERC20 token to the list of tokens
        const addTokenTx = await basicSwitch.addERC20(erc20.address);
        await addTokenTx.wait();

        // check if the token is added to the mapping
        expect(
          bigNumToString(await basicSwitch.erc20Status(erc20.address))
        ).to.equal("1");
      });

      it("Should transfer ERC20 tokens when not alive", async function () {
        const [owner, heir] = await ethers.getSigners();

        // check ERC20 balance of owner
        expect(bigNumToString(await erc20.balanceOf(owner.address))).to.equal(
          dec(10, 27)
        );

        // claim ERC20 inheritance
        const claimInheritanceTx = await basicSwitch.claimInheritanceERC20();
        await claimInheritanceTx.wait();

        // check ERC20 balance of owner
        expect(bigNumToString(await erc20.balanceOf(owner.address))).to.equal(
          "0"
        );
        // check ERC20 balance of heir
        expect(bigNumToString(await erc20.balanceOf(heir.address))).to.equal(
          dec(10, 27)
        );
      });
    });
  });
});
