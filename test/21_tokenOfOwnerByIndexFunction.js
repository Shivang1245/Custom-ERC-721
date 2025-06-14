const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - tokenOfOwnerByIndex() Function", function () {
  let TestCustomERC721, customERC721, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should revert when tokenOfOwnerByIndex is called for an owner with no tokens", async function () {
    await expect(
      customERC721.tokenOfOwnerByIndex(addr1.address, 0)
    ).to.be.revertedWith("ERC721Enumerable: owner index out of bounds");
  });

  it("should return the correct token ID for a valid index when one token is minted", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    const tokenId = await customERC721.tokenOfOwnerByIndex(addr1.address, 0);
    expect(tokenId).to.equal(1);
  });

  it("should return correct token IDs for multiple tokens minted by the same owner", async function () {
    await (await customERC721.connect(addr2).mint()).wait();
    await (await customERC721.connect(addr2).mint()).wait();
    await (await customERC721.connect(addr2).mint()).wait();

    const token0 = await customERC721.tokenOfOwnerByIndex(addr2.address, 0);
    const token1 = await customERC721.tokenOfOwnerByIndex(addr2.address, 1);
    const token2 = await customERC721.tokenOfOwnerByIndex(addr2.address, 2);

    expect(token0).to.equal(1);
    expect(token1).to.equal(2);
    expect(token2).to.equal(3);
  });

  it("should revert when tokenOfOwnerByIndex is called with an out-of-bound index for an owner", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    await (await customERC721.connect(addr1).mint()).wait();

    await expect(
      customERC721.tokenOfOwnerByIndex(addr1.address, 2)
    ).to.be.revertedWith("ERC721Enumerable: owner index out of bounds");
  });

  it("should update enumeration correctly after transferring a token", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    await (await customERC721.connect(addr1).mint()).wait();

    const token0 = await customERC721.tokenOfOwnerByIndex(addr1.address, 0);
    const token1 = await customERC721.tokenOfOwnerByIndex(addr1.address, 1);
    expect(token0).to.equal(1);
    expect(token1).to.equal(2);

    await (
      await customERC721
        .connect(addr1)
        .transferFrom(addr1.address, owner.address, 1)
    ).wait();

    await expect(
      customERC721.tokenOfOwnerByIndex(addr1.address, 1)
    ).to.be.revertedWith("ERC721Enumerable: owner index out of bounds");

    const remainingToken = await customERC721.tokenOfOwnerByIndex(
      addr1.address,
      0
    );
    expect(remainingToken).to.equal(2);
  });

  it("should update enumeration correctly after burning a token", async function () {
    if (typeof customERC721.burn === "function") {
      await (await customERC721.connect(addr2).mint()).wait();
      await (await customERC721.connect(addr2).mint()).wait();
      await (await customERC721.connect(addr2).mint()).wait();

      await (await customERC721.connect(addr2).burn(2)).wait();

      const balance = await customERC721.balanceOf(addr2.address);
      expect(balance).to.equal(2);

      const tokenAtIndex0 = await customERC721.tokenOfOwnerByIndex(
        addr2.address,
        0
      );
      const tokenAtIndex1 = await customERC721.tokenOfOwnerByIndex(
        addr2.address,
        1
      );
      expect(tokenAtIndex0).to.not.equal(2);
      expect(tokenAtIndex1).to.not.equal(2);
    } else {
      this.skip();
    }
  });
});
