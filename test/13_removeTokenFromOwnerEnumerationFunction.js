require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _removeTokenFromOwnerEnumeration() Function", function () {
  let customERC721;
  let owner, addr1;

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

  async function clearOwnerEnumeration(ownerAddress) {
    while (true) {
      try {
        const token = await customERC721.readTokenOwner(ownerAddress, 0);
        await customERC721.exposedRemoveTokenFromOwnerEnumeration(
          ownerAddress,
          token
        );
      } catch (error) {
        break;
      }
    }
  }

  beforeEach(async function () {
    await clearOwnerEnumeration(addr1.address);
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
