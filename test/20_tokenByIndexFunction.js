const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - tokenByIndex() Function", function () {
  let TestCustomERC721, customERC721, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should revert when no tokens have been minted", async function () {
    await expect(customERC721.tokenByIndex(0)).to.be.revertedWith(
      "ERC721Enumerable: global index out of bounds"
    );
  });

  it("should return the correct token ID for a valid index when one token is minted", async function () {
    await (await customERC721.mint()).wait();
    const tokenId = await customERC721.tokenByIndex(0);
    expect(tokenId).to.equal(1);
  });

  it("should return correct token IDs for multiple minted tokens", async function () {
    await (await customERC721.mint()).wait();
    await (await customERC721.connect(addr1).mint()).wait();
    await (await customERC721.connect(addr2).mint()).wait();

    const token0 = await customERC721.tokenByIndex(0);
    const token1 = await customERC721.tokenByIndex(1);
    const token2 = await customERC721.tokenByIndex(2);

    expect(token0).to.equal(1);
    expect(token1).to.equal(2);
    expect(token2).to.equal(3);
  });

  it("should revert when tokenByIndex is called with an out-of-bound index", async function () {
    await (await customERC721.mint()).wait();
    await (await customERC721.mint()).wait();

    await expect(customERC721.tokenByIndex(2)).to.be.revertedWith(
      "ERC721Enumerable: global index out of bounds"
    );
  });

  it("should update tokenByIndex correctly after a token is burned", async function () {
    if (typeof customERC721.burn === "function") {
      await (await customERC721.mint()).wait();
      await (await customERC721.connect(addr1).mint()).wait();
      await (await customERC721.connect(addr2).mint()).wait();

      await (await customERC721.connect(addr1).burn(2)).wait();

      const newSupply = await customERC721.totalSupply();
      expect(newSupply).to.equal(2);

      const tokenAtIndex0 = await customERC721.tokenByIndex(0);
      const tokenAtIndex1 = await customERC721.tokenByIndex(1);
      expect(tokenAtIndex0).to.not.equal(2);
      expect(tokenAtIndex1).to.not.equal(2);
    } else {
      this.skip();
    }
  });
});
