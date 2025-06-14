const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _exists() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");

    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should return false for a token id that has not been minted", async function () {
    const exists = await customERC721.exposedExists(999);
    expect(exists).to.equal(false);
  });

  it("should return true for a token id that exists", async function () {
    await customERC721.connect(addr1).mint();
    const exists = await customERC721.exposedExists(1);
    expect(exists).to.equal(true);
  });

  it("should return false for a token id after the token has been burned", async function () {
    await customERC721.connect(addr1).mint();
    let exists = await customERC721.exposedExists(1);
    expect(exists).to.equal(true);

    await customERC721.connect(addr1).exposedBurn(1);

    exists = await customERC721.exposedExists(1);
    expect(exists).to.equal(false);
  });
});
