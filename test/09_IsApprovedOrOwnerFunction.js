require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _isApprovedOrOwner() Function", function () {
  let customERC721;
  let owner, addr1, addr2, addr3;

  before(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
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

  async function getLastMintedToken(signer) {
    const tx = await customERC721.connect(signer).mint();
    await tx.wait();
    const balance = await customERC721.balanceOf(signer.address);
    const tokenId = await customERC721.tokenOfOwnerByIndex(
      signer.address,
      balance - 1n
    );
    return tokenId;
  }

  it("should return true when the spender is the token owner", async function () {
    const tokenId = await getLastMintedToken(addr1);
    const result = await customERC721.exposedIsApprovedOrOwner(
      addr1.address,
      tokenId
    );
    expect(result).to.equal(true);
  });

  it("should return true when the spender is approved specifically for the token", async function () {
    const tokenId = await getLastMintedToken(addr1);
    await (
      await customERC721.connect(addr1).approve(addr2.address, tokenId)
    ).wait();
    const result = await customERC721.exposedIsApprovedOrOwner(
      addr2.address,
      tokenId
    );
    expect(result).to.equal(true);
  });

  it("should return true when the spender is an approved operator", async function () {
    const tokenId = await getLastMintedToken(addr1);
    await (
      await customERC721.connect(addr1).setApprovalForAll(addr3.address, true)
    ).wait();
    const result = await customERC721.exposedIsApprovedOrOwner(
      addr3.address,
      tokenId
    );
    expect(result).to.equal(true);
  });

  it("should return false when the spender is not owner, approved or an operator", async function () {
    const tokenId = await getLastMintedToken(addr1);
    const result = await customERC721.exposedIsApprovedOrOwner(
      addr2.address,
      tokenId
    );
    expect(result).to.equal(false);
  });

  it("should revert when the token does not exist", async function () {
    await expect(
      customERC721.exposedIsApprovedOrOwner(addr1.address, 999)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });
});
