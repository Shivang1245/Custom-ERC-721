require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - symbol() Function", function () {
  let customERC721;
  let owner, addr1, addr2;

  // Load the already deployed contract instance once.
  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const deployedAddress = process.env.TESTCUSTOMERC721;
    if (!deployedAddress || deployedAddress.trim() === "") {
      throw new Error(
        "No deployed contract address provided in TESTCUSTOMERC721."
      );
    }
    customERC721 = await ethers.getContractAt(
      "CustomERC721",
      deployedAddress.trim()
    );
    console.log("Using deployed CustomERC721 at:", deployedAddress.trim());
  });

  it("should return the correct symbol", async function () {
    const tokenSymbol = await customERC721.symbol();
    expect(tokenSymbol).to.equal("TTK");
  });

  it("should return a non-empty string", async function () {
    const tokenSymbol = await customERC721.symbol();
    expect(tokenSymbol).to.be.a("string").and.to.have.length.greaterThan(0);
  });

  it("should return the same symbol on multiple calls", async function () {
    const firstCall = await customERC721.symbol();
    const secondCall = await customERC721.symbol();
    expect(firstCall).to.equal(secondCall);
  });
});
