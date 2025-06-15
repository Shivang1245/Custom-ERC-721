require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - name() Function", function () {
  let customERC721;
  let owner, addr1, addr2;

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

  it("should return the correct name", async function () {
    const tokenName = await customERC721.name();
    expect(tokenName).to.equal("Test Token");
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
});
