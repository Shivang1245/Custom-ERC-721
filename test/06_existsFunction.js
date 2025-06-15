require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _exists() Function", function () {
  let customERC721, owner, addr1;

  before(async function () {
    [owner, addr1] = await ethers.getSigners();
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

  it("should return false for a token id that has not been minted", async function () {
    const exists = await customERC721.exposedExists(999);
    expect(exists).to.equal(false);
  });

  it("should return true for a token id that exists", async function () {
    const tokenId = await getLastMintedToken(addr1);
    const exists = await customERC721.exposedExists(tokenId);
    expect(exists).to.equal(true);
  });

  it("should return false for a token id after the token has been burned", async function () {
    const tokenId = await getLastMintedToken(addr1);
    let exists = await customERC721.exposedExists(tokenId);
    expect(exists).to.equal(true);

    await customERC721.connect(addr1).exposedBurn(tokenId);
    exists = await customERC721.exposedExists(tokenId);
    expect(exists).to.equal(false);
  });
});
