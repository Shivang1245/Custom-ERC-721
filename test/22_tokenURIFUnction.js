const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - tokenURI() Function", function () {
  let TestCustomERC721, customERC721, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("My Custom Token", "MCT");
    await customERC721.waitForDeployment();
  });

  it("should revert when tokenURI is queried for a nonexistent token", async function () {
    await expect(customERC721.tokenURI(999)).to.be.revertedWith(
      "ERC721: query for nonexistent token"
    );
  });

  it("should return the correct tokenURI for a minted token when base URI is empty", async function () {
    let tx = await customERC721.mint();
    await tx.wait();

    const uri = await customERC721.tokenURI(1);
    expect(uri).to.equal("1");
  });

  it("should return the same tokenURI on repeated calls", async function () {
    let tx = await customERC721.mint();
    await tx.wait();
    const uri1 = await customERC721.tokenURI(1);
    const uri2 = await customERC721.tokenURI(1);
    expect(uri1).to.equal(uri2);
  });

  it("should return correct tokenURIs for multiple minted tokens", async function () {
    let tx1 = await customERC721.mint();
    await tx1.wait();
    let tx2 = await customERC721.mint();
    await tx2.wait();

    const uri1 = await customERC721.tokenURI(1);
    const uri2 = await customERC721.tokenURI(2);
    expect(uri1).to.equal("1");
    expect(uri2).to.equal("2");
  });

  it("should return tokenURI with a custom base URI if set", async function () {
    if (typeof customERC721.setBaseURI === "function") {
      await customERC721.setBaseURI("https://api.example.com/token/");
      let tx = await customERC721.mint();
      await tx.wait();

      const uri = await customERC721.tokenURI(1);
      expect(uri).to.equal("https://api.example.com/token/1");
    }
  });
});
