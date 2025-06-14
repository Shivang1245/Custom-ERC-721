const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - balanceOf() Function", function () {
  let TestCustomERC721, customERC721, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");

    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should return 0 balance for an address that hasn't minted any tokens", async function () {
    const balanceAddr1 = await customERC721.balanceOf(addr1.address);
    expect(balanceAddr1).to.equal(0);
  });

  it("should return correct balance after a single mint", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    const balanceAddr1 = await customERC721.balanceOf(addr1.address);
    expect(balanceAddr1).to.equal(1);
  });

  it("should return correct balance for multiple tokens minted by the same address", async function () {
    await (await customERC721.connect(addr2).mint()).wait();
    await (await customERC721.connect(addr2).mint()).wait();
    const balanceAddr2 = await customERC721.balanceOf(addr2.address);
    expect(balanceAddr2).to.equal(2);
  });

  it("should update balances correctly after transferring a token", async function () {
    await (await customERC721.connect(addr3).mint()).wait();
    const initialBalanceAddr3 = await customERC721.balanceOf(addr3.address);
    const initialBalanceAddr1 = await customERC721.balanceOf(addr1.address);
    expect(initialBalanceAddr3).to.equal(1);
    expect(initialBalanceAddr1).to.equal(0);

    await (
      await customERC721
        .connect(addr3)
        .transferFrom(addr3.address, addr1.address, 1)
    ).wait();

    const finalBalanceAddr3 = await customERC721.balanceOf(addr3.address);
    const finalBalanceAddr1 = await customERC721.balanceOf(addr1.address);
    expect(finalBalanceAddr3).to.equal(0);
    expect(finalBalanceAddr1).to.equal(1);
  });

  it("should update the balance after burning a token", async function () {
    if (typeof customERC721.burn === "function") {
      await (await customERC721.connect(addr2).mint()).wait();
      let balanceBeforeBurn = await customERC721.balanceOf(addr2.address);
      expect(balanceBeforeBurn).to.equal(1);
      await (await customERC721.connect(addr2).burn(1)).wait();
      let balanceAfterBurn = await customERC721.balanceOf(addr2.address);
      expect(balanceAfterBurn).to.equal(0);
    }
  });

  it("should revert when balanceOf is called for the zero address", async function () {
    await expect(customERC721.balanceOf(ethers.ZeroAddress)).to.be.revertedWith(
      "ERC721: balance query for zero address"
    );
  });
});
