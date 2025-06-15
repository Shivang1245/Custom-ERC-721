require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _addTokenToOwnerEnumeration() Function", function () {
  let customERC721;
  let owner, addr1;
  let tokenCounter = 1000;

  before(async function () {
    [owner, addr1] = await ethers.getSigners();
    const providedAddress = process.env.TESTCUSTOMERC721;
    if (!providedAddress || providedAddress.trim() === "") {
      throw new Error(
        "No deployed contract address provided in TESTCUSTOMERC721."
      );
    }
    customERC721 = await ethers.getContractAt(
      "TestCustomERC721",
      providedAddress.trim()
    );
    console.log("Using deployed TestCustomERC721 at:", providedAddress.trim());
  });

  it("should correctly add multiple tokens to an owner's enumeration", async function () {
    const tokenId1 = tokenCounter++;
    const tokenId2 = tokenCounter++;
    await customERC721.exposedAddTokenToOwnerEnumeration(
      owner.address,
      tokenId1
    );
    await customERC721.exposedAddTokenToOwnerEnumeration(
      owner.address,
      tokenId2
    );

    const token0 = await customERC721.exposedTokenOfOwnerByIndex(
      owner.address,
      0
    );
    const token1 = await customERC721.exposedTokenOfOwnerByIndex(
      owner.address,
      1
    );

    expect(token0).to.equal(tokenId1);
    expect(token1).to.equal(tokenId2);

    const index1 = await customERC721.exposedOwnerTokenIndex(tokenId1);
    const index2 = await customERC721.exposedOwnerTokenIndex(tokenId2);
    expect(index1).to.equal(0);
    expect(index2).to.equal(1);
  });

  it("should revert when adding a token to the zero address", async function () {
    const tokenId = tokenCounter++;
    await expect(
      customERC721.exposedAddTokenToOwnerEnumeration(
        "0x0000000000000000000000000000000000000000",
        tokenId
      )
    ).to.be.revertedWith("CustomERC721: add to zero address");
  });

  it("should revert when adding a duplicate token to the same owner", async function () {
    const tokenId = tokenCounter++;
    await customERC721.exposedAddTokenToOwnerEnumeration(
      owner.address,
      tokenId
    );
    await expect(
      customERC721.exposedAddTokenToOwnerEnumeration(owner.address, tokenId)
    ).to.be.revertedWith("CustomERC721: token already added");
  });
});
