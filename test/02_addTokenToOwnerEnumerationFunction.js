const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _addTokenToOwnerEnumeration() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1;
  const TOKEN_ID1 = 1;
  const TOKEN_ID2 = 2;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const TestCustomERC721Factory = await ethers.getContractFactory(
      "TestCustomERC721"
    );
    customERC721 = await TestCustomERC721Factory.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });
  it("should correctly add a token to an empty owner's enumeration", async function () {
    await customERC721.exposedAddTokenToOwnerEnumeration(
      owner.address,
      TOKEN_ID1
    );

    const tokenAtIndex = await customERC721.exposedTokenOfOwnerByIndex(
      owner.address,
      0
    );
    expect(tokenAtIndex).to.equal(TOKEN_ID1);

    const tokenIndex = await customERC721.exposedOwnerTokenIndex(TOKEN_ID1);
    expect(tokenIndex).to.equal(0);
  });

  it("should correctly add multiple tokens to an owner's enumeration", async function () {
    await customERC721.exposedAddTokenToOwnerEnumeration(
      owner.address,
      TOKEN_ID1
    );
    await customERC721.exposedAddTokenToOwnerEnumeration(
      owner.address,
      TOKEN_ID2
    );

    const token0 = await customERC721.exposedTokenOfOwnerByIndex(
      owner.address,
      0
    );
    const token1 = await customERC721.exposedTokenOfOwnerByIndex(
      owner.address,
      1
    );

    expect(token0).to.equal(TOKEN_ID1);
    expect(token1).to.equal(TOKEN_ID2);

    const index1 = await customERC721.exposedOwnerTokenIndex(TOKEN_ID1);
    const index2 = await customERC721.exposedOwnerTokenIndex(TOKEN_ID2);
    expect(index1).to.equal(0);
    expect(index2).to.equal(1);
  });

  it("should revert when adding a token to the zero address", async function () {
    await expect(
      customERC721.exposedAddTokenToOwnerEnumeration(
        "0x0000000000000000000000000000000000000000",
        TOKEN_ID1
      )
    ).to.be.revertedWith("CustomERC721: add to zero address");
  });

  it("should revert when adding a duplicate token to the same owner", async function () {
    await customERC721.exposedAddTokenToOwnerEnumeration(
      owner.address,
      TOKEN_ID1
    );
    await expect(
      customERC721.exposedAddTokenToOwnerEnumeration(owner.address, TOKEN_ID1)
    ).to.be.revertedWith("CustomERC721: token already added");
  });

  it("should add tokens to different owners separately", async function () {
    await customERC721.exposedAddTokenToOwnerEnumeration(
      owner.address,
      TOKEN_ID1
    );
    await customERC721.exposedAddTokenToOwnerEnumeration(
      addr1.address,
      TOKEN_ID2
    );

    const tokenOwner = await customERC721.exposedTokenOfOwnerByIndex(
      owner.address,
      0
    );
    expect(tokenOwner).to.equal(TOKEN_ID1);

    const tokenAddr1 = await customERC721.exposedTokenOfOwnerByIndex(
      addr1.address,
      0
    );
    expect(tokenAddr1).to.equal(TOKEN_ID2);
  });
});
