const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _addTokenToAllTokensEnumeration() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should correctly add a new token to the global enumeration", async function () {
    await customERC721.exposedAddTokenToAllTokensEnumeration(100);

    const count = await customERC721.allTokensCount();
    expect(count).to.equal(1);

    const tokenAt0 = await customERC721.readAllToken(0);
    expect(tokenAt0).to.equal(100);

    const tokenIndex = await customERC721.readTokenIndex(100);
    expect(tokenIndex).to.equal(0);
  });

  it("should correctly add multiple tokens to the global enumeration", async function () {
    await customERC721.exposedAddTokenToAllTokensEnumeration(100);
    await customERC721.exposedAddTokenToAllTokensEnumeration(200);
    await customERC721.exposedAddTokenToAllTokensEnumeration(300);

    const count = await customERC721.allTokensCount();
    expect(count).to.equal(3);

    expect(await customERC721.readAllToken(0)).to.equal(100);
    expect(await customERC721.readAllToken(1)).to.equal(200);
    expect(await customERC721.readAllToken(2)).to.equal(300);

    expect(await customERC721.readTokenIndex(100)).to.equal(0);
    expect(await customERC721.readTokenIndex(200)).to.equal(1);
    expect(await customERC721.readTokenIndex(300)).to.equal(2);
  });

  it("should revert when adding a duplicate token", async function () {
    await customERC721.exposedAddTokenToAllTokensEnumeration(100);

    await expect(
      customERC721.exposedAddTokenToAllTokensEnumeration(100)
    ).to.be.revertedWith("ERC721: token already added");
  });

  it("should correctly add token id 0 if allowed", async function () {
    await customERC721.exposedAddTokenToAllTokensEnumeration(0);
    const count = await customERC721.allTokensCount();
    expect(count).to.equal(1);
    expect(await customERC721.readAllToken(0)).to.equal(0);
    expect(await customERC721.readTokenIndex(0)).to.equal(0);
  });
});
