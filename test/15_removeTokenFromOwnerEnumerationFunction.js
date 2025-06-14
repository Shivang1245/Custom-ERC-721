const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _removeTokenFromOwnerEnumeration() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should update the owner’s enumeration correctly when removing a token from a list of multiple tokens", async function () {
    await customERC721.exposedAddTokenToOwnerEnumeration(addr1.address, 1);
    await customERC721.exposedAddTokenToOwnerEnumeration(addr1.address, 2);

    expect(await customERC721.readTokenOwner(addr1.address, 0)).to.equal(1);
    expect(await customERC721.readTokenOwner(addr1.address, 1)).to.equal(2);

    await expect(
      customERC721.exposedRemoveTokenFromOwnerEnumeration(addr1.address, 1)
    ).to.not.be.reverted;

    const newToken0 = await customERC721.readTokenOwner(addr1.address, 0);
    expect(newToken0).to.equal(2);

    const token2Index = await customERC721.exposedOwnerTokenIndex(2);
    expect(token2Index).to.equal(0);

    await expect(
      customERC721.exposedRemoveTokenFromOwnerEnumeration(addr1.address, 1)
    ).to.be.revertedWith("ERC721: token not found in enumeration");
  });

  it("should revert when trying to remove a token from the zero address", async function () {
    await expect(
      customERC721.exposedRemoveTokenFromOwnerEnumeration(ethers.ZeroAddress, 1)
    ).to.be.revertedWith("ERC721: remove token from zero address");
  });

  it("should revert when trying to remove a token that is not in the owner’s enumeration", async function () {
    await customERC721.exposedAddTokenToOwnerEnumeration(addr1.address, 1);

    await expect(
      customERC721.exposedRemoveTokenFromOwnerEnumeration(addr1.address, 2)
    ).to.be.revertedWith("ERC721: token not found in enumeration");
  });
});
