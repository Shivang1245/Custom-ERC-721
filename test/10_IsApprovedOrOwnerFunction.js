const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _isApprovedOrOwner() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");

    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should return true when the spender is the token owner", async function () {
    await customERC721.connect(addr1).mint();
    expect(
      await customERC721.exposedIsApprovedOrOwner(addr1.address, 1)
    ).to.equal(true);
  });

  it("should return true when the spender is approved specifically for the token", async function () {
    await customERC721.connect(addr1).mint();
    await customERC721.connect(addr1).approve(addr2.address, 1);
    expect(
      await customERC721.exposedIsApprovedOrOwner(addr2.address, 1)
    ).to.equal(true);
  });

  it("should return true when the spender is an approved operator", async function () {
    await customERC721.connect(addr1).mint();
    await customERC721.connect(addr1).setApprovalForAll(addr3.address, true);
    expect(
      await customERC721.exposedIsApprovedOrOwner(addr3.address, 1)
    ).to.equal(true);
  });

  it("should return false when the spender is not owner, approved or an operator", async function () {
    await customERC721.connect(addr1).mint();
    expect(
      await customERC721.exposedIsApprovedOrOwner(addr2.address, 1)
    ).to.equal(false);
  });

  it("should revert when the token does not exist", async function () {
    await expect(
      customERC721.exposedIsApprovedOrOwner(addr1.address, 999)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });
});
