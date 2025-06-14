const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - supportsInterface() Function", function () {
  let CustomERC721, customERC721;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    CustomERC721 = await ethers.getContractFactory("CustomERC721");

    customERC721 = await CustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should return true for the ERC721 interface (0x80ac58cd)", async function () {
    const result = await customERC721.supportsInterface("0x80ac58cd");
    expect(result).to.be.true;
  });

  it("should return true for the ERC721Metadata interface (0x5b5e139f)", async function () {
    const result = await customERC721.supportsInterface("0x5b5e139f");
    expect(result).to.be.true;
  });

  it("should return true for the ERC721Enumerable interface (0x780e9d63)", async function () {
    const result = await customERC721.supportsInterface("0x780e9d63");
    expect(result).to.be.true;
  });

  it("should return false for an unsupported interface (0xffffffff)", async function () {
    const result = await customERC721.supportsInterface("0xffffffff");
    expect(result).to.be.false;
  });

  it("should throw an error when supportsInterface is called with extra arguments", async function () {
    await expect(
      customERC721.supportsInterface("0x80ac58cd", 1)
    ).to.be.rejectedWith(/no matching fragment/i);
  });
});
