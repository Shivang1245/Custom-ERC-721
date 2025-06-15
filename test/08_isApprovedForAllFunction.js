require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - isApprovedForAll() Function", function () {
  let customERC721, owner, addr1, addr2;

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const deployedAddress = process.env.TESTCUSTOMERC721;
    if (!deployedAddress || deployedAddress.trim() === "") {
      throw new Error(
        "No deployed contract address provided in TESTCUSTOMERC721."
      );
    }
    customERC721 = await ethers.getContractAt(
      "TestCustomERC721",
      deployedAddress.trim()
    );
    console.log("Using deployed TestCustomERC721 at:", deployedAddress.trim());
  });

  it("should return false if no operator approval is set", async function () {
    await (await customERC721.setApprovalForAll(addr1.address, false)).wait();
    const isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.false;
  });

  it("should return true after the owner sets approval for all for an operator", async function () {
    await (await customERC721.setApprovalForAll(addr1.address, true)).wait();
    const isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.true;
  });

  it("should return false after the owner revokes approval for all", async function () {
    await (await customERC721.setApprovalForAll(addr1.address, true)).wait();
    let isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.true;

    await (await customERC721.setApprovalForAll(addr1.address, false)).wait();
    isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.false;
  });

  it("should maintain independent approvals for different owners", async function () {
    await (await customERC721.setApprovalForAll(addr1.address, true)).wait();
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
