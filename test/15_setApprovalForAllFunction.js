require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - setApprovalForAll() Function", function () {
  let customERC721;
  let owner, addr1, addr2;

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

  it("should revert when trying to set approval for self", async function () {
    await expect(
      customERC721.setApprovalForAll(owner.address, true)
    ).to.be.revertedWith("ERC721: approve to caller");
  });

  it("should allow the token owner to approve an operator", async function () {
    await expect(customERC721.setApprovalForAll(addr1.address, true))
      .to.emit(customERC721, "ApprovalForAll")
      .withArgs(owner.address, addr1.address, true);

    const isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.true;
  });

  it("should allow revoking operator approval", async function () {
    await customERC721.setApprovalForAll(addr1.address, true);
    let isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.true;

    await expect(customERC721.setApprovalForAll(addr1.address, false))
      .to.emit(customERC721, "ApprovalForAll")
      .withArgs(owner.address, addr1.address, false);

    isApproved = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApproved).to.be.false;
  });

  it("should work independently for different token owners", async function () {
    await customERC721.setApprovalForAll(addr1.address, true);
    const isApprovedOwner = await customERC721.isApprovedForAll(
      owner.address,
      addr1.address
    );
    expect(isApprovedOwner).to.be.true;

    await customERC721.connect(addr2).setApprovalForAll(addr1.address, true);
    const isApprovedAddr2 = await customERC721.isApprovedForAll(
      addr2.address,
      addr1.address
    );
    expect(isApprovedAddr2).to.be.true;
  });

  it("should throw error when setApprovalForAll is called with extra arguments", async function () {
    await expect(
      customERC721.setApprovalForAll(addr1.address, true, 123)
    ).to.be.rejectedWith(/no matching fragment/i);
  });
});
