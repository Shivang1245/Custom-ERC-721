require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _addTokenToAllTokensEnumeration() Function", function () {
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

  it("should correctly add a new token to the global enumeration", async function () {
    const baseline = Number(await customERC721.allTokensCount());
    const newToken = baseline + 1000;
    await customERC721.exposedAddTokenToAllTokensEnumeration(newToken);

    const updatedCount = Number(await customERC721.allTokensCount());
    expect(updatedCount).to.equal(baseline + 1);

    const tokenAtIndex = await customERC721.readAllToken(baseline);
    expect(tokenAtIndex).to.equal(newToken);

    const tokenIndex = await customERC721.readTokenIndex(newToken);
    expect(tokenIndex).to.equal(baseline);
  });

  it("should correctly add multiple tokens to the global enumeration", async function () {
    const baseline = Number(await customERC721.allTokensCount());
    const token1 = baseline + 1001;
    const token2 = baseline + 1002;
    const token3 = baseline + 1003;
    await customERC721.exposedAddTokenToAllTokensEnumeration(token1);
    await customERC721.exposedAddTokenToAllTokensEnumeration(token2);
    await customERC721.exposedAddTokenToAllTokensEnumeration(token3);

    const updatedCount = Number(await customERC721.allTokensCount());
    expect(updatedCount).to.equal(baseline + 3);

    expect(await customERC721.readAllToken(baseline)).to.equal(token1);
    expect(await customERC721.readAllToken(baseline + 1)).to.equal(token2);
    expect(await customERC721.readAllToken(baseline + 2)).to.equal(token3);

    expect(await customERC721.readTokenIndex(token1)).to.equal(baseline);
    expect(await customERC721.readTokenIndex(token2)).to.equal(baseline + 1);
    expect(await customERC721.readTokenIndex(token3)).to.equal(baseline + 2);
  });

  it("should revert when adding a duplicate token", async function () {
    const baseline = Number(await customERC721.allTokensCount());
    const dupToken = baseline + 1004;
    await customERC721.exposedAddTokenToAllTokensEnumeration(dupToken);
    await expect(
      customERC721.exposedAddTokenToAllTokensEnumeration(dupToken)
    ).to.be.revertedWith("ERC721: token already added");
  });

  it("should correctly add token id 0 if allowed", async function () {
    const baseline = Number(await customERC721.allTokensCount());
    await customERC721.exposedAddTokenToAllTokensEnumeration(0);
    const updatedCount = Number(await customERC721.allTokensCount());
    expect(updatedCount).to.equal(baseline + 1);
    expect(await customERC721.readAllToken(baseline)).to.equal(0);
    expect(await customERC721.readTokenIndex(0)).to.equal(baseline);
  });
});
