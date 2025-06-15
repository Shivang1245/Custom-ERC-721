require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - totalSupply() Function", function () {
  let customERC721;
  let owner, addr1, addr2;
  let baselineSupply;

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
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

  beforeEach(async function () {
    let currentSupplyRaw = await customERC721.totalSupply();
    baselineSupply = BigInt(currentSupplyRaw.toString());
  });

  it("should return 0 additional tokens if no tokens are minted", async function () {
    const supply = BigInt((await customERC721.totalSupply()).toString());
    expect(supply - baselineSupply).to.equal(0n);
  });

  it("should return correct totalSupply after minting one token", async function () {
    await (await customERC721.mint()).wait();
    const supply = BigInt((await customERC721.totalSupply()).toString());
    expect(supply - baselineSupply).to.equal(1n);
  });

  it("should return correct totalSupply after minting multiple tokens (same address)", async function () {
    await (await customERC721.mint()).wait();
    await (await customERC721.mint()).wait();
    const supply = BigInt((await customERC721.totalSupply()).toString());
    expect(supply - baselineSupply).to.equal(2n);
  });

  it("should return correct totalSupply when tokens are minted by different addresses", async function () {
    await (await customERC721.mint()).wait();
    await (await customERC721.connect(addr1).mint()).wait();
    const supply = BigInt((await customERC721.totalSupply()).toString());
    expect(supply - baselineSupply).to.equal(2n);
  });

  it("should throw error when calling totalSupply with extra arguments", async function () {
    await expect(customERC721.totalSupply(1)).to.be.rejectedWith(
      /no matching fragment/i
    );
  });
});
