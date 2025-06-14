const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - symbol() Function", function () {
  let CustomERC721, customERC721, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    CustomERC721 = await ethers.getContractFactory("CustomERC721");
    customERC721 = await CustomERC721.deploy("My Custom Token", "MCT");
    await customERC721.waitForDeployment();
  });

  it("should return the correct symbol", async function () {
    const tokenSymbol = await customERC721.symbol();
    expect(tokenSymbol).to.equal("MCT");
  });

  it("should return a non-empty string", async function () {
    const tokenSymbol = await customERC721.symbol();
    expect(tokenSymbol).to.be.a("string");
    expect(tokenSymbol.length).to.be.greaterThan(0);
  });

  it("should return the same symbol on multiple calls", async function () {
    const firstCall = await customERC721.symbol();
    const secondCall = await customERC721.symbol();
    expect(firstCall).to.equal(secondCall);
  });

  it("should support different symbols on separate deployments", async function () {
    const CustomERC721Alt = await ethers.getContractFactory("CustomERC721");
    const altToken = await CustomERC721Alt.deploy("Alternative Token", "ALT");
    await altToken.waitForDeployment();

    const altTokenSymbol = await altToken.symbol();
    expect(altTokenSymbol).to.equal("ALT");

    const originalSymbol = await customERC721.symbol();
    expect(originalSymbol).to.equal("MCT");
  });
});
