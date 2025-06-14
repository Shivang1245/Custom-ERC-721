const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _removeTokenFromAllTokensEnumeration() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  async function addToken(tokenId) {
    await customERC721.exposedAddTokenToAllTokensEnumeration(tokenId);
  }

  it("should correctly remove a token when it is the only token in the global enumeration", async function () {
    await addToken(101);

    expect(await customERC721.allTokensCount()).to.equal(1);
    expect(await customERC721.readAllToken(0)).to.equal(101);
    expect(await customERC721.readTokenIndex(101)).to.equal(0);

    await customERC721.exposedRemoveTokenFromAllTokensEnumeration(101);

    expect(await customERC721.allTokensCount()).to.equal(0);

    await expect(customERC721.readAllToken(0)).to.be.revertedWith(
      "Index out of bounds"
    );
  });

  it("should correctly remove a token from a global enumeration with multiple tokens", async function () {
    await addToken(101);
    await addToken(202);
    await addToken(303);

    expect(await customERC721.allTokensCount()).to.equal(3);

    await customERC721.exposedRemoveTokenFromAllTokensEnumeration(202);

    expect(await customERC721.allTokensCount()).to.equal(2);

    const tokenAt0 = await customERC721.readAllToken(0);
    const tokenAt1 = await customERC721.readAllToken(1);
    expect(tokenAt0).to.equal(101);
    expect(tokenAt1).to.equal(303);

    expect(await customERC721.readTokenIndex(101)).to.equal(0);
    expect(await customERC721.readTokenIndex(303)).to.equal(1);
  });

  it("should correctly remove the last token in the global enumeration", async function () {
    await addToken(101);
    await addToken(202);
    await addToken(303);

    expect(await customERC721.allTokensCount()).to.equal(3);

    await customERC721.exposedRemoveTokenFromAllTokensEnumeration(303);
    expect(await customERC721.allTokensCount()).to.equal(2);

    expect(await customERC721.readAllToken(0)).to.equal(101);
    expect(await customERC721.readAllToken(1)).to.equal(202);
  });

  it("should revert when trying to remove a token that is not in the global enumeration", async function () {
    await addToken(101);

    await expect(
      customERC721.exposedRemoveTokenFromAllTokensEnumeration(999)
    ).to.be.revertedWith("ERC721: token not found in global enumeration");
  });

  it("should revert when trying to remove a token from an empty global enumeration", async function () {
    await expect(
      customERC721.exposedRemoveTokenFromAllTokensEnumeration(101)
    ).to.be.revertedWith("ERC721: token not found in global enumeration");
  });

  it("should revert when trying to remove the same token twice", async function () {
    await addToken(101);

    await customERC721.exposedRemoveTokenFromAllTokensEnumeration(101);
    expect(await customERC721.allTokensCount()).to.equal(0);

    await expect(
      customERC721.exposedRemoveTokenFromAllTokensEnumeration(101)
    ).to.be.revertedWith("ERC721: token not found in global enumeration");
  });
});
