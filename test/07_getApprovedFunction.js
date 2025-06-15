require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - getApproved() Function", function () {
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

  async function mintAndGetTokenId(signer) {
    const tx = await customERC721.connect(signer).mint();
    await tx.wait();
    const balance = await customERC721.balanceOf(signer.address);
    const tokenId = await customERC721.tokenOfOwnerByIndex(
      signer.address,
      balance - 1n
    );
    return tokenId;
  }

  it("should revert when getApproved is called on a nonexistent token", async function () {
    await expect(customERC721.getApproved(1)).to.be.revertedWith(
      "ERC721: query for nonexistent token"
    );
  });

  it("should return the zero address if no approval has been set", async function () {
    const tokenId = await mintAndGetTokenId(addr1);
    const approvedAddr = await customERC721.getApproved(tokenId);
    expect(approvedAddr).to.equal(ethers.ZeroAddress);
  });

  it("should return the correct approved address after an approval is set", async function () {
    const tokenId = await mintAndGetTokenId(addr1);
    await (
      await customERC721.connect(addr1).approve(addr2.address, tokenId)
    ).wait();
    const approvedAddr = await customERC721.getApproved(tokenId);
    expect(approvedAddr).to.equal(addr2.address);
  });

  it("should update the approval if a new approval is set", async function () {
    const tokenId = await mintAndGetTokenId(addr1);
    await (
      await customERC721.connect(addr1).approve(addr2.address, tokenId)
    ).wait();
    let approvedAddr = await customERC721.getApproved(tokenId);
    expect(approvedAddr).to.equal(addr2.address);
    await (
      await customERC721.connect(addr1).approve(owner.address, tokenId)
    ).wait();
    approvedAddr = await customERC721.getApproved(tokenId);
    expect(approvedAddr).to.equal(owner.address);
  });

  it("should clear approval after a token transfer", async function () {
    const tokenId = await mintAndGetTokenId(addr1);
    await (
      await customERC721.connect(addr1).approve(addr2.address, tokenId)
    ).wait();
    let approvedAddr = await customERC721.getApproved(tokenId);
    expect(approvedAddr).to.equal(addr2.address);
    await (
      await customERC721
        .connect(addr1)
        .transferFrom(addr1.address, owner.address, tokenId)
    ).wait();
    approvedAddr = await customERC721.getApproved(tokenId);
    expect(approvedAddr).to.equal(ethers.ZeroAddress);
  });

  it("should throw error when getApproved is called with extra arguments", async function () {
    await expect(customERC721.getApproved(1, 2)).to.be.rejectedWith(
      /no matching fragment/i
    );
  });
});
