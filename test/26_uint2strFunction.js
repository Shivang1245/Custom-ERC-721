const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _uint2str() Function", function () {
  let TestCustomERC721, customERC721;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should return '0' when given 0", async function () {
    const result = await customERC721.connect(owner).exposedUint2str(0);
    expect(result).to.equal("0");
  });

  it("should return the correct string for a single-digit number", async function () {
    const result = await customERC721.connect(owner).exposedUint2str(7);
    expect(result).to.equal("7");
  });

  it("should return the correct string for a multi-digit number", async function () {
    const result = await customERC721.connect(owner).exposedUint2str(123456);
    expect(result).to.equal("123456");
  });

  it("should return the correct string for the maximum uint256", async function () {
    const maxUint256 = ethers.MaxUint256;
    const result = await customERC721
      .connect(owner)
      .exposedUint2str(maxUint256);
    const expected =
      "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    expect(result).to.equal(expected);
  });

  it("should correctly convert any valid uint input to its string representation", async function () {
    for (let i = 0; i < 5; i++) {
      const randomNum = Math.floor(Math.random() * 1000000);
      const result = await customERC721
        .connect(owner)
        .exposedUint2str(randomNum);
      expect(result).to.equal(String(randomNum));
    }
  });
});
