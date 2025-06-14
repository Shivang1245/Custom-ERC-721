const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - totalSupply() Function", function () {
  let TestCustomERC721, customERC721, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should return 0 if no tokens have been minted", async function () {
    const supply = await customERC721.totalSupply();
    expect(supply).to.equal(0);
  });

  it("should return correct totalSupply after minting one token", async function () {
    await (await customERC721.mint()).wait();
    const supply = await customERC721.totalSupply();
    expect(supply).to.equal(1);
  });

  it("should return correct totalSupply after minting multiple tokens (same address)", async function () {
    await (await customERC721.mint()).wait();
    await (await customERC721.mint()).wait();
    const supply = await customERC721.totalSupply();
    expect(supply).to.equal(2);
  });

  it("should return correct totalSupply when tokens are minted by different addresses", async function () {
    await (await customERC721.mint()).wait();
    await (await customERC721.connect(addr1).mint()).wait();
    const supply = await customERC721.totalSupply();
    expect(supply).to.equal(2);
  });

  it("should not change totalSupply after transferring tokens", async function () {
    await (await customERC721.mint()).wait();
    const supplyBefore = await customERC721.totalSupply();
    expect(supplyBefore).to.equal(1);

    await (
      await customERC721.transferFrom(owner.address, addr1.address, 1)
    ).wait();

    const supplyAfter = await customERC721.totalSupply();
    expect(supplyAfter).to.equal(supplyBefore);
  });

  it("should update totalSupply correctly after burning tokens", async function () {
    if (typeof customERC721.burn === "function") {
      await (await customERC721.mint()).wait();
      const supplyBefore = await customERC721.totalSupply();
      expect(supplyBefore).to.equal(1);

      await (await customERC721.burn(1)).wait();

      const supplyAfter = await customERC721.totalSupply();
      expect(supplyAfter).to.equal(0);
    }
  });

  it("should throw error when calling totalSupply with extra arguments", async function () {
    await expect(customERC721.totalSupply(1)).to.be.rejectedWith(
      /no matching fragment/i
    );
  });
});
