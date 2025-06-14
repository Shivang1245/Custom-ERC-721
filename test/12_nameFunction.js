const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - name() Function", function () {
  let CustomERC721, customERC721, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    CustomERC721 = await ethers.getContractFactory("CustomERC721");
    customERC721 = await CustomERC721.deploy("My Custom Token", "MCT");
    await customERC721.waitForDeployment();
  });

  it("should return the correct name", async function () {
    const tokenName = await customERC721.name();
    expect(tokenName).to.equal("My Custom Token");
  });

  it("should return a non-empty string", async function () {
    const tokenName = await customERC721.name();
    expect(tokenName).to.be.a("string").and.to.have.length.greaterThan(0);
  });

  it("should return the same name on multiple calls", async function () {
    const firstCall = await customERC721.name();
    const secondCall = await customERC721.name();
    expect(firstCall).to.equal(secondCall);
  });

  it("should support different names on separate deployments", async function () {
    const CustomERC721Alt = await ethers.getContractFactory("CustomERC721");
    const altToken = await CustomERC721Alt.deploy("Alternative Token", "ALT");
    await altToken.waitForDeployment();

    const altTokenName = await altToken.name();
    expect(altTokenName).to.equal("Alternative Token");

    const originalName = await customERC721.name();
    expect(originalName).to.equal("My Custom Token");
  });
});
