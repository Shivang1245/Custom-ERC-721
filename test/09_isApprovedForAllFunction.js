const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - isApprovedForAll() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should return false if no operator approval is set", async function () {
    const isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.false;
  });

  it("should return true after the owner sets approval for all for an operator", async function () {
    await customERC721.setApprovalForAll(addr1.address, true);
    const isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.true;
  });

  it("should return false after the owner revokes approval for all", async function () {
    await customERC721.setApprovalForAll(addr1.address, true);
    let isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.true;

    await customERC721.setApprovalForAll(addr1.address, false);
    isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.false;
  });

  it("should maintain independent approvals for different owners", async function () {
    await customERC721.setApprovalForAll(addr1.address, true);
    const isApprovedOwner = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApprovedOwner).to.be.true;

    const isApprovedAddr2 = await customERC721.isApprovedForAll(
      addr2.address,
      addr1.address
    );
    expect(isApprovedAddr2).to.be.false;
  });

  it("should throw an error when isApprovedForAll is called with extra arguments", async function () {
    await expect(
      customERC721.isApprovedForAll(owner.address, addr1.address, 1)
    ).to.be.rejectedWith(/no matching fragment/i);
  });
});
